package com.river.module.coupon.crawler;

import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 通用商家网站爬虫
 * <p>
 * 提取策略（按优先级）：
 * 1. JSON-LD (Schema.org Product 结构化数据) — 最可靠
 * 2. Open Graph meta 标签 (og:title, og:image, product:price:amount)
 * 3. 通用 CSS 选择器（价格相关 class 名）
 * <p>
 * 仅返回有优惠价格的商品（原价 > 现价）
 */
@Slf4j
@Component
public class GenericMerchantScraper implements MerchantSiteScraper {

    private static final int CONNECT_TIMEOUT_MS = 10_000;
    private static final int READ_TIMEOUT_MS = 15_000;
    private static final String USER_AGENT =
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                    + "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    private static final int MAX_PRODUCTS_PER_PAGE = 50;
    private static final Pattern PRICE_PATTERN =
            Pattern.compile("[\\d,]+\\.?\\d*");

    @Override
    public List<ProductData> scrape(String baseUrl) {
        List<ProductData> products = new ArrayList<>();
        try {
            // Step 1: 获取商家首页，发现 deal/sale 专区链接
            Document homeDoc = fetchDocument(baseUrl);
            if (homeDoc == null) {
                return products;
            }

            List<String> dealPageUrls = findDealPageUrls(homeDoc, baseUrl);
            log.info("Found {} deal pages for {}", dealPageUrls.size(), baseUrl);

            // Step 2: 爬取首页（部分网站首页就有折扣商品）
            products.addAll(scrapeDocument(homeDoc, baseUrl));

            // Step 3: 爬取每个 deal 专区页面
            for (String dealUrl : dealPageUrls) {
                if (products.size() >= MAX_PRODUCTS_PER_PAGE) {
                    break;
                }
                try {
                    Thread.sleep(1500); // 礼貌延迟，避免给目标站点造成压力
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
                Document dealDoc = fetchDocument(dealUrl);
                if (dealDoc != null) {
                    products.addAll(scrapeDocument(dealDoc, baseUrl));
                }
            }

            // Step 4: 对有折扣的商品，访问详情页获取完整描述和图片
            enrichProductsFromDetailPages(products);

        } catch (Exception e) {
            log.warn("Failed to scrape {}: {}", baseUrl, e.getMessage());
        }
        return products;
    }

    // ==================== 页面抓取 ====================

    private Document fetchDocument(String url) {
        try {
            return Jsoup.connect(url)
                    .userAgent(USER_AGENT)
                    .timeout(CONNECT_TIMEOUT_MS)
                    .followRedirects(true)
                    .get();
        } catch (Exception e) {
            log.debug("Cannot fetch {}: {}", url, e.getMessage());
            return null;
        }
    }

    // ==================== Deal 专区链接发现 ====================

    private static final String[] DEAL_PATH_KEYWORDS = {
            "/deals", "/sale", "/clearance", "/offers",
            "/specials", "/discount", "/promotions", "/outlet"
    };

    /**
     * 从首页中寻找可能的 deal/sale 专区链接
     */
    private List<String> findDealPageUrls(Document doc, String baseUrl) {
        List<String> urls = new ArrayList<>();
        Elements links = doc.select("a[href]");
        for (Element link : links) {
            if (urls.size() >= 5) break;

            String href = link.attr("abs:href");
            String text = link.text().toLowerCase();
            String path = href.toLowerCase();

            boolean match = false;
            for (String keyword : DEAL_PATH_KEYWORDS) {
                if (path.contains(keyword)) {
                    match = true;
                    break;
                }
            }
            if (!match) {
                for (String keyword : new String[]{"deal", "sale", "offer", "clearance", "discount"}) {
                    if (text.contains(keyword)) {
                        match = true;
                        break;
                    }
                }
            }

            if (match && href.startsWith(baseUrl) && !href.contains("#")) {
                String cleanUrl = href.split("\\?")[0];
                if (!urls.contains(cleanUrl)) {
                    urls.add(cleanUrl);
                }
            }
        }
        return urls;
    }

    // ==================== 商品提取 ====================

    /**
     * 从页面中提取商品数据，依次尝试 JSON-LD → OG meta → CSS 选择器
     */
    private List<ProductData> scrapeDocument(Document doc, String baseUrl) {
        List<ProductData> products = new ArrayList<>();

        // 策略 1: JSON-LD 结构化数据
        products.addAll(extractFromJsonLd(doc, baseUrl));
        if (!products.isEmpty()) {
            log.debug("Extracted {} products from JSON-LD on {}", products.size(), baseUrl);
            return products;
        }

        // 策略 2: OG meta 标签（单商品页）
        ProductData ogProduct = extractFromMetaTags(doc, baseUrl);
        if (ogProduct != null && ogProduct.hasDiscount()) {
            products.add(ogProduct);
            return products;
        }

        // 策略 3: 通用 CSS 选择器
        products.addAll(extractFromCssSelectors(doc, baseUrl));
        log.debug("Extracted {} products from CSS on {}", products.size(), baseUrl);

        return products;
    }

    // ==================== JSON-LD 提取 ====================

    private List<ProductData> extractFromJsonLd(Document doc, String baseUrl) {
        List<ProductData> products = new ArrayList<>();
        Elements scripts = doc.select("script[type=application/ld+json]");

        for (Element script : scripts) {
            String json = script.data().trim();
            try {
                if (json.startsWith("[")) {
                    parseJsonLdArray(json, products);
                } else if (json.startsWith("{")) {
                    parseJsonLdObject(json, products, baseUrl);
                }
            } catch (Exception e) {
                log.debug("JSON-LD parse error: {}", e.getMessage());
            }
        }
        return products;
    }

    private void parseJsonLdArray(String json, List<ProductData> products) {
        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        try {
            var array = mapper.readTree(json);
            for (var node : array) {
                String type = node.has("@type") ? node.get("@type").asText() : "";
                if ("Product".equalsIgnoreCase(type)) {
                    ProductData p = productFromJsonLd(node);
                    if (p != null && p.hasDiscount()) {
                        products.add(p);
                    }
                } else if ("ItemList".equalsIgnoreCase(type) && node.has("itemListElement")) {
                    for (var item : node.get("itemListElement")) {
                        var obj = item.has("item") ? item.get("item") : item;
                        String itemType = obj.has("@type") ? obj.get("@type").asText() : "";
                        if ("Product".equalsIgnoreCase(itemType)) {
                            ProductData p = productFromJsonLd(obj);
                            if (p != null && p.hasDiscount()) {
                                products.add(p);
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.debug("JSON array parse error: {}", e.getMessage());
        }
    }

    private void parseJsonLdObject(String json, List<ProductData> products, String baseUrl) {
        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        try {
            var node = mapper.readTree(json);
            String type = node.has("@type") ? node.get("@type").asText() : "";

            if ("Product".equalsIgnoreCase(type)) {
                ProductData p = productFromJsonLd(node);
                if (p != null && p.hasDiscount()) {
                    products.add(p);
                }
            } else if ("ItemList".equalsIgnoreCase(type) && node.has("itemListElement")) {
                for (var item : node.get("itemListElement")) {
                    var obj = item.has("item") ? item.get("item") : item;
                    ProductData p = productFromJsonLd(obj);
                    if (p != null && p.hasDiscount()) {
                        products.add(p);
                    }
                }
            } else if ("WebPage".equalsIgnoreCase(type) || "CollectionPage".equalsIgnoreCase(type)) {
                // 某些页面将商品嵌套在 WebPage 节点中
                if (node.has("mainEntity")) {
                    parseJsonLdObject(node.get("mainEntity").toString(), products, baseUrl);
                }
            }
        } catch (Exception e) {
            log.debug("JSON object parse error: {}", e.getMessage());
        }
    }

    private ProductData productFromJsonLd(com.fasterxml.jackson.databind.JsonNode node) {
        String title = getTextValue(node, "name");
        if (title == null || title.isBlank()) return null;

        String description = getTextValue(node, "description");
        String imageUrl = getTextValue(node, "image");
        String productUrl = getTextValue(node, "url");

        BigDecimal originalPrice = null;
        BigDecimal dealPrice = null;

        var offers = node.has("offers") ? node.get("offers") : null;
        if (offers != null) {
            if (offers.isArray()) {
                for (var offer : offers) {
                    BigDecimal low = extractPrice(offer);
                    BigDecimal high = offer.has("highPrice")
                            ? parsePrice(offer.get("highPrice").asText()) : null;
                    if (high != null && low != null && high.compareTo(low) > 0) {
                        originalPrice = high;
                        dealPrice = low;
                        break;
                    }
                }
            } else if ("AggregateOffer".equalsIgnoreCase(getTextValue(offers, "@type"))) {
                originalPrice = offers.has("highPrice")
                        ? parsePrice(offers.get("highPrice").asText()) : null;
                dealPrice = offers.has("lowPrice")
                        ? parsePrice(offers.get("lowPrice").asText()) : null;
            } else {
                originalPrice = offers.has("priceSpecification")
                        ? extractPrice(offers.get("priceSpecification")) : null;
                dealPrice = extractPrice(offers);
            }
        }

        return ProductData.builder()
                .title(title)
                .description(description)
                .originalPrice(originalPrice)
                .dealPrice(dealPrice)
                .imageUrl(imageUrl)
                .productUrl(productUrl)
                .build();
    }

    // ==================== Meta 标签提取 ====================

    private ProductData extractFromMetaTags(Document doc, String baseUrl) {
        String title = getMetaContent(doc, "og:title");
        if (title == null || title.isBlank()) return null;

        String salePrice = getMetaContent(doc, "product:price:amount");
        String originalPriceStr = getMetaContent(doc, "product:original_price:amount");

        if (salePrice == null && originalPriceStr == null) return null;

        return ProductData.builder()
                .title(title)
                .description(getMetaContent(doc, "og:description"))
                .imageUrl(getMetaContent(doc, "og:image"))
                .productUrl(getMetaContent(doc, "og:url"))
                .originalPrice(parsePrice(originalPriceStr))
                .dealPrice(parsePrice(salePrice))
                .build();
    }

    // ==================== CSS 选择器提取 ====================

    private List<ProductData> extractFromCssSelectors(Document doc, String baseUrl) {
        List<ProductData> products = new ArrayList<>();

        // 常见商品卡片选择器
        String[] cardSelectors = {
                ".product-card", ".product-item", ".product-tile",
                "[data-product]", ".item.product", ".grid-item",
                ".s-result-item[data-asin]", ".deal-item", ".offer-item"
        };

        Elements productElements = null;
        for (String selector : cardSelectors) {
            productElements = doc.select(selector);
            if (productElements.size() > 1) break; // 至少找到 2 个商品卡片
        }

        if (productElements == null || productElements.size() <= 1) {
            return products;
        }

        for (Element el : productElements) {
            if (products.size() >= MAX_PRODUCTS_PER_PAGE) break;

            ProductData product = extractFromProductElement(el, baseUrl);
            if (product != null && product.hasDiscount()) {
                products.add(product);
            }
        }
        return products;
    }

    private ProductData extractFromProductElement(Element el, String baseUrl) {
        // 标题
        String title = null;
        for (String sel : new String[]{".product-title", ".product-name", "h2", "h3", "h4", ".title"}) {
            Element titleEl = el.selectFirst(sel);
            if (titleEl != null && !titleEl.text().isBlank()) {
                title = titleEl.text();
                break;
            }
        }
        if (title == null) return null;

        // 原价
        BigDecimal originalPrice = null;
        for (String sel : new String[]{
                ".original-price", ".list-price", ".was-price",
                ".regular-price", ".price-was", ".strikethrough",
                "s:strike", "del"}) {
            Element priceEl = el.selectFirst(sel);
            if (priceEl != null) {
                originalPrice = parsePrice(priceEl.text());
                if (originalPrice != null) break;
            }
        }

        // 现价
        BigDecimal dealPrice = null;
        for (String sel : new String[]{
                ".sale-price", ".deal-price", ".current-price",
                ".price-now", ".discount-price", ".special-price",
                ".price"}) {
            Element priceEl = el.selectFirst(sel);
            if (priceEl != null) {
                dealPrice = parsePrice(priceEl.text());
                if (dealPrice != null) break;
            }
        }

        // 图片
        String imageUrl = null;
        Element imgEl = el.selectFirst("img[src]");
        if (imgEl != null) {
            imageUrl = imgEl.attr("abs:src");
        }

        // 链接
        String productUrl = null;
        Element linkEl = el.selectFirst("a[href]");
        if (linkEl != null) {
            productUrl = linkEl.attr("abs:href");
        }

        return ProductData.builder()
                .title(title)
                .imageUrl(imageUrl)
                .productUrl(productUrl)
                .originalPrice(originalPrice)
                .dealPrice(dealPrice)
                .build();
    }

    // ==================== 详情页回填 ====================

    /**
     * 对有折扣的商品逐一访问详情页，回填完整描述和多张图片
     */
    private void enrichProductsFromDetailPages(List<ProductData> products) {
        for (ProductData product : products) {
            if (!product.hasDiscount() || product.getProductUrl() == null
                    || product.getProductUrl().isBlank()) {
                continue;
            }
            try {
                Thread.sleep(1000); // 礼貌延迟
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
            enrichFromDetailPage(product);
        }
    }

    /**
     * 访问商品详情页，提取完整描述和多张图片
     */
    private void enrichFromDetailPage(ProductData product) {
        try {
            Document detailDoc = fetchDocument(product.getProductUrl());
            if (detailDoc == null) return;

            // 检测平台类型
            String platform = detectPlatform(detailDoc);

            // 1. 回填描述（平台专用 → 通用）
            String description = extractDetailDescription(detailDoc, platform);
            if (description != null && !description.isBlank()
                    && (product.getDescription() == null
                        || product.getDescription().isBlank()
                        || description.length() > product.getDescription().length())) {
                product.setDescription(description);
            }

            // 2. 提取详情页多张图片（平台专用 → 通用）
            List<String> detailImages = extractDetailImages(detailDoc, product.getProductUrl(), platform);
            for (String img : detailImages) {
                product.addImageUrl(img);
            }

            // 3. 如果列表页没拿到主图，用详情页的
            if ((product.getImageUrl() == null || product.getImageUrl().isBlank())
                    && !detailImages.isEmpty()) {
                product.setImageUrl(detailImages.get(0));
            }

            log.debug("Enriched [{}] {}: desc={}chars, {} images",
                    platform, product.getTitle(),
                    product.getDescription() != null ? product.getDescription().length() : 0,
                    product.getImageUrls() != null ? product.getImageUrls().size() : 0);
        } catch (Exception e) {
            log.debug("Failed to enrich detail page {}: {}",
                    product.getProductUrl(), e.getMessage());
        }
    }

    /**
     * 从详情页提取商品描述（平台专用 → JSON-LD → Meta → 通用 CSS）
     */
    private String extractDetailDescription(Document doc, String platform) {
        // 平台专用提取
        String desc = null;
        if ("shopify".equals(platform)) {
            desc = extractShopifyDescription(doc);
        } else if ("woocommerce".equals(platform)) {
            desc = extractWooCommerceDescription(doc);
        }
        if (desc != null && desc.length() > 20) return desc;

        // JSON-LD
        Elements scripts = doc.select("script[type=application/ld+json]");
        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        for (Element script : scripts) {
            try {
                var node = mapper.readTree(script.data().trim());
                if (node.isObject() && "Product".equalsIgnoreCase(
                        node.has("@type") ? node.get("@type").asText() : "")) {
                    if (node.has("description")) {
                        String desc = node.get("description").asText();
                        if (desc != null && desc.length() > 20) return desc;
                    }
                }
            } catch (Exception ignored) {}
        }

        // Meta description
        String metaDesc = getMetaContent(doc, "og:description");
        if (metaDesc != null && metaDesc.length() > 20) return metaDesc;
        metaDesc = getMetaContent(doc, "description");
        if (metaDesc != null && metaDesc.length() > 20) return metaDesc;

        // 常见描述容器
        for (String sel : new String[]{
                "#product-description", ".product-description",
                "[itemprop=description]", ".description", "#description"}) {
            Element el = doc.selectFirst(sel);
            if (el != null && el.text().length() > 30) {
                return el.text();
            }
        }
        return null;
    }

    /**
     * 从详情页提取商品图片（平台专用 → JSON-LD → OG → 通用 CSS）
     */
    private List<String> extractDetailImages(Document doc, String pageUrl, String platform) {
        Set<String> images = new LinkedHashSet<>();

        // 平台专用提取
        if ("shopify".equals(platform)) {
            images.addAll(extractShopifyImages(doc));
        } else if ("woocommerce".equals(platform)) {
            images.addAll(extractWooCommerceImages(doc));
        }

        // JSON-LD image 字段
        Elements scripts = doc.select("script[type=application/ld+json]");
        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        for (Element script : scripts) {
            try {
                var node = mapper.readTree(script.data().trim());
                if (node.isObject() && "Product".equalsIgnoreCase(
                        node.has("@type") ? node.get("@type").asText() : "")) {
                    if (node.has("image")) {
                        var imageNode = node.get("image");
                        if (imageNode.isArray()) {
                            for (var img : imageNode) {
                                String url = img.isObject() && img.has("url")
                                        ? img.get("url").asText() : img.asText();
                                if (url != null && !url.isBlank()) images.add(url);
                            }
                        } else if (imageNode.isTextual()) {
                            images.add(imageNode.asText());
                        } else if (imageNode.isObject() && imageNode.has("url")) {
                            images.add(imageNode.get("url").asText());
                        }
                    }
                }
            } catch (Exception ignored) {}
        }

        // 2. OG image
        String ogImage = getMetaContent(doc, "og:image");
        if (ogImage != null) images.add(ogImage);

        // 3. 常见商品图片画廊 CSS 选择器
        for (String sel : new String[]{
                ".product-gallery img", ".product-images img",
                ".image-gallery img", "[data-product-images] img",
                ".product__images img", ".gallery img",
                ".swiper-slide img", ".product-media img"}) {
            Elements imgs = doc.select(sel);
            for (Element img : imgs) {
                // 优先取 data-src / data-zoom-image（高分辨率图），否则取 src
                String src = img.attr("data-zoom-image");
                if (src.isBlank()) src = img.attr("data-src");
                if (src.isBlank()) src = img.attr("abs:src");
                if (!src.isBlank() && isProductImage(src)) {
                    images.add(src);
                }
            }
            if (images.size() >= 3) break;
        }

        return new ArrayList<>(images);
    }

    /**
     * 过滤明显不是商品图的 URL（icon、logo、pixel 等）
     */
    private boolean isProductImage(String url) {
        if (url == null) return false;
        String lower = url.toLowerCase();
        // 排除小图标和像素图
        for (String exclude : new String[]{
                "icon", "logo", "pixel", "sprite", "1x1", "spacer",
                "blank.gif", "loading", "placeholder", "avatar"}) {
            if (lower.contains(exclude)) return false;
        }
        return true;
    }

    // ==================== 平台检测 ====================

    /**
     * 检测页面所属电商平台
     * @return "shopify" / "woocommerce" / "generic"
     */
    private String detectPlatform(Document doc) {
        // Shopify 特征
        if (doc.selectFirst("meta[name=shopify-digital-wallet]") != null
                || doc.selectFirst("meta[name=shopify-checkout-api-token]") != null
                || doc.selectFirst("link[href*=cdn.shopify.com]") != null) {
            return "shopify";
        }

        // WooCommerce 特征
        Element body = doc.selectFirst("body");
        if (body != null) {
            String bodyClass = body.attr("class");
            if (bodyClass.contains("woocommerce") || bodyClass.contains("woocommerce-page")) {
                return "woocommerce";
            }
        }
        if (doc.selectFirst("link[href*=/wp-content/plugins/woocommerce/]") != null
                || doc.selectFirst("script[src*=/wp-content/plugins/woocommerce/]") != null) {
            return "woocommerce";
        }

        return "generic";
    }

    // ==================== Shopify 专用提取 ====================

    private String extractShopifyDescription(Document doc) {
        // 1. 商品完整描述区块
        for (String sel : new String[]{
                ".product__description", ".product-description",
                "[data-product-description]", ".product-single__description",
                "#ProductDescription", ".product__info-container .description"}) {
            Element el = doc.selectFirst(sel);
            if (el != null && el.text().length() > 30) {
                return el.text();
            }
        }
        // 2. product.description 属性（metafield）
        Element descMeta = doc.selectFirst("[itemprop=description]");
        if (descMeta != null && descMeta.text().length() > 30) {
            return descMeta.text();
        }
        return null;
    }

    private List<String> extractShopifyImages(Document doc) {
        Set<String> images = new LinkedHashSet<>();

        // 商品画廊（多种 Shopify 主题常用选择器）
        for (String sel : new String[]{
                ".product__photos img", ".product-single__photos img",
                ".product__media img", "[data-product-media] img",
                ".product-media-container img", ".product-gallery img",
                ".product__images img", ".product-single__photo img",
                "[data-product-single-media] img"}) {
            Elements imgs = doc.select(sel);
            for (Element img : imgs) {
                // Shopify 图片 URL 参数：优先取 data-src 或 srcset 中的大图
                String src = img.attr("data-src");
                if (src.isBlank()) src = img.attr("data-original");
                if (src.isBlank()) {
                    String srcset = img.attr("srcset");
                    src = extractLargestFromSrcset(srcset);
                }
                if (src.isBlank()) src = img.attr("abs:src");
                if (!src.isBlank()) {
                    images.add(getShopifyFullSize(src));
                }
            }
            if (images.size() >= 3) break;
        }
        return new ArrayList<>(images);
    }

    /**
     * 将 Shopify CDN 图片 URL 转为最大尺寸
     * cdn.shopify.com/.../image_300x.jpg → cdn.shopify.com/.../image.jpg
     */
    private String getShopifyFullSize(String url) {
        if (url == null || !url.contains("cdn.shopify.com")) return url;
        // 去掉尺寸后缀 _100x, _200x, _300x, _grande, _master 等
        return url.replaceAll("_[0-9]+x[0-9]*", "")
                  .replaceAll("_(grande|master|large|medium|small|compact|pico|icon|thumb|card)\\.", ".");
    }

    // ==================== WooCommerce 专用提取 ====================

    private String extractWooCommerceDescription(Document doc) {
        // 1. WooCommerce 商品描述 tab (通常最完整)
        Element descTab = doc.selectFirst("#tab-description");
        if (descTab != null && descTab.text().length() > 30) {
            return descTab.text();
        }

        // 2. 标准 WooCommerce 描述容器
        for (String sel : new String[]{
                ".woocommerce-product-details__short-description",
                ".woocommerce-Tabs-panel--description",
                ".entry-content .woocommerce-product-details__short-description",
                "[itemprop=description]"}) {
            Element el = doc.selectFirst(sel);
            if (el != null && el.text().length() > 30) {
                return el.text();
            }
        }

        // 3. 短描述 + 长描述拼接
        String shortDesc = "";
        Element shortEl = doc.selectFirst(".woocommerce-product-details__short-description");
        if (shortEl != null) shortDesc = shortEl.text();
        String longDesc = "";
        Element longEl = doc.selectFirst("#tab-description");
        if (longEl != null) longDesc = longEl.text();

        if (!shortDesc.isEmpty() || !longDesc.isEmpty()) {
            return (shortDesc + " " + longDesc).trim();
        }
        return null;
    }

    private List<String> extractWooCommerceImages(Document doc) {
        Set<String> images = new LinkedHashSet<>();

        // 1. WooCommerce 图片画廊（data-large_image 是高清大图）
        Elements galleryImages = doc.select(
                ".woocommerce-product-gallery__image img, "
                + ".woocommerce-product-gallery__image a");
        for (Element el : galleryImages) {
            // 优先取 data-large_image（WooCommerce 标准高清图属性）
            String largeImage = el.attr("data-large_image");
            if (!largeImage.isBlank()) {
                images.add(largeImage);
                continue;
            }
            // <a> 标签的 href 通常指向原图
            if (el.tagName().equals("a")) {
                String href = el.attr("abs:href");
                if (!href.isBlank()) {
                    images.add(href);
                    continue;
                }
            }
            // 回退到 img src / data-src
            Element img = el.tagName().equals("img") ? el : el.selectFirst("img");
            if (img != null) {
                String src = img.attr("data-src");
                if (src.isBlank()) src = img.attr("data-lazy-src");
                if (src.isBlank()) src = img.attr("abs:src");
                if (!src.isBlank() && !src.contains("placeholder")) {
                    images.add(src);
                }
            }
        }

        // 2. 主图（featured image）
        Element featuredImg = doc.selectFirst(".woocommerce-product-gallery__image--first img");
        if (featuredImg != null) {
            String largeImage = featuredImg.attr("data-large_image");
            if (!largeImage.isBlank()) {
                images.add(largeImage);
            }
        }

        return new ArrayList<>(images);
    }

    // ==================== 工具方法（srcset 解析） ====================

    /**
     * 从 srcset 属性中提取最大尺寸的图片 URL
     * 例: "img.jpg 400w, img.jpg 800w, img.jpg 1200w" → "img.jpg"
     */
    private String extractLargestFromSrcset(String srcset) {
        if (srcset == null || srcset.isBlank()) return "";
        String[] parts = srcset.split(",");
        String best = "";
        int bestWidth = 0;
        for (String part : parts) {
            String trimmed = part.trim();
            String[] tokens = trimmed.split("\\s+");
            if (tokens.length >= 2) {
                try {
                    int w = Integer.parseInt(tokens[1].replace("w", ""));
                    if (w > bestWidth) {
                        bestWidth = w;
                        best = tokens[0];
                    }
                } catch (NumberFormatException ignored) {}
            } else if (tokens.length == 1 && !tokens[0].isBlank()) {
                best = tokens[0];
            }
        }
        return best;
    }

    // ==================== 工具方法 ====================

    private BigDecimal extractPrice(com.fasterxml.jackson.databind.JsonNode offerNode) {
        if (offerNode == null) return null;
        if (offerNode.has("price")) {
            return parsePrice(offerNode.get("price").asText());
        }
        return null;
    }

    private BigDecimal parsePrice(String priceStr) {
        if (priceStr == null || priceStr.isBlank()) return null;
        try {
            Matcher matcher = PRICE_PATTERN.matcher(
                    priceStr.replaceAll("[,$€£¥]", "").trim());
            if (matcher.find()) {
                return new BigDecimal(matcher.group().replace(",", ""));
            }
        } catch (Exception e) {
            log.debug("Cannot parse price: {}", priceStr);
        }
        return null;
    }

    private String getTextValue(com.fasterxml.jackson.databind.JsonNode node, String field) {
        if (node == null || !node.has(field)) return null;
        var val = node.get(field);
        if (val.isArray() && val.size() > 0) {
            return val.get(0).asText();
        }
        return val.asText(null);
    }

    private String getMetaContent(Document doc, String property) {
        Element el = doc.selectFirst("meta[property=" + property + "]");
        if (el == null) {
            el = doc.selectFirst("meta[name=" + property + "]");
        }
        return el != null ? el.attr("content") : null;
    }
}
