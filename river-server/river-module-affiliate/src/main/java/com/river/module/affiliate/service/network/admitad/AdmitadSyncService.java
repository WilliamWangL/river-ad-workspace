package com.river.module.affiliate.service.network.admitad;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.river.module.affiliate.dal.dataobject.CategoryDO;
import com.river.module.affiliate.dal.dataobject.CategoryMappingDO;
import com.river.module.affiliate.dal.dataobject.MerchantDO;
import com.river.module.affiliate.dal.dataobject.NetworkCredentialDO;
import com.river.module.affiliate.dal.dataobject.OfferDO;
import com.river.module.affiliate.dal.mysql.CategoryMapper;
import com.river.module.affiliate.dal.mysql.CategoryMappingMapper;
import com.river.module.affiliate.dal.mysql.MerchantMapper;
import com.river.module.affiliate.dal.mysql.NetworkCredentialMapper;
import com.river.module.affiliate.dal.mysql.OfferMapper;
import com.river.module.affiliate.enums.PayoutModelEnum;
import com.river.module.affiliate.service.CategoryService;
import com.river.module.coupon.dal.dataobject.CouponDO;
import com.river.module.coupon.dal.dataobject.DealDO;
import com.river.module.coupon.dal.mysql.CouponMapper;
import com.river.module.coupon.dal.mysql.DealMapper;
import com.river.framework.common.enums.CommonStatusEnum;
import com.river.module.coupon.enums.CouponTypeEnum;
import com.river.module.coupon.enums.DiscountTypeEnum;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.Resource;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.HashSet;
import java.util.stream.Collectors;

import com.river.framework.common.biz.tracking.TrackingLinkCommonApi;
import com.river.framework.common.biz.tracking.dto.TrackingLinkCreateReqDTO;
import com.river.module.affiliate.controller.admin.network.AffiliateNetworkController;

@Slf4j
@Service
public class AdmitadSyncService {

    /** 目标类型常量 */
    private static final int TARGET_TYPE_OFFER = 2;
    private static final int TARGET_TYPE_DEAL = 3;
    private static final int TARGET_TYPE_COUPON = 4;

    @Resource
    private AdmitadClient admitadClient;

    @Resource
    private MerchantMapper merchantMapper;

    @Resource
    private OfferMapper offerMapper;

    @Resource
    private CategoryMapper categoryMapper;

    @Resource
    private CategoryMappingMapper categoryMappingMapper;

    @Resource
    private CouponMapper couponMapper;

    @Resource
    private DealMapper dealMapper;

    @Resource
    private TrackingLinkCommonApi trackingLinkCommonApi;

    @Resource
    private NetworkCredentialMapper credentialMapper;

    private static final ObjectMapper objectMapper = new ObjectMapper();
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    // Sync statistics tracking
    private volatile int lastSyncMerchants = 0;
    private volatile int lastSyncOffers = 0;
    private volatile int lastSyncCoupons = 0;
    private volatile int lastSyncDeals = 0;
    private volatile int lastSyncFailed = 0;
    private volatile LocalDateTime lastSyncTime = null;

    /**
     * Get last sync statistics
     */
    public Map<String, Object> getLastSyncStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("merchants", lastSyncMerchants);
        stats.put("offers", lastSyncOffers);
        stats.put("coupons", lastSyncCoupons);
        stats.put("deals", lastSyncDeals);
        stats.put("failed", lastSyncFailed);
        stats.put("lastSyncTime", lastSyncTime);
        return stats;
    }

    public void syncCampaigns(NetworkCredentialDO credential) {
        // Reset statistics at start
        this.lastSyncMerchants = 0;
        this.lastSyncOffers = 0;
        this.lastSyncCoupons = 0;
        this.lastSyncDeals = 0;
        this.lastSyncFailed = 0;
        this.lastSyncTime = LocalDateTime.now();

        int offset = 0;
        int limit = 100;
        int totalSynced = 0;

        while (true) {
            List<AdmitadCampaign> campaigns = admitadClient.getCampaigns(credential, offset, limit);
            if (campaigns.isEmpty()) {
                break;
            }

            // Batch sync: preload existing merchants and process in batch
            syncCampaignsBatch(credential.getNetworkId(), campaigns, credential);
            totalSynced += campaigns.size();
            this.lastSyncMerchants += campaigns.size();

            offset += limit;
            if (campaigns.size() < limit) {
                break;
            }
        }

        log.info("Admitad sync completed for network {}, synced {} campaigns",
            credential.getNetworkId(), totalSynced);
    }

    /**
     * 批量同步 Campaigns/Merchants
     * 1. 预加载已存在的商家（减少重复查询）
     * 2. 去重：同一批次内按 externalId 去重
     * 3. 幂等写入：区分 insert vs update
     * 4. 批量操作：使用 insertBatch/updateBatch
     */
    @Transactional
    public void syncCampaignsBatch(Long networkId, List<AdmitadCampaign> campaigns, NetworkCredentialDO credential) {
        if (campaigns == null || campaigns.isEmpty()) {
            return;
        }

        // 1. 去重：同一批次内按 externalId 去重（保留最后一条）
        Map<String, AdmitadCampaign> campaignMap = new HashMap<>();
        for (AdmitadCampaign campaign : campaigns) {
            campaignMap.put(String.valueOf(campaign.getId()), campaign);
        }

        // 2. 预加载已存在的商家（批量查询）
        List<String> externalIds = campaignMap.keySet().stream().toList();
        List<MerchantDO> existingMerchants = merchantMapper.selectListByNetworkAndExternalIds(networkId, externalIds);

        // 构建 existing merchant map: externalId -> MerchantDO
        Map<String, MerchantDO> existingMerchantMap = existingMerchants.stream()
            .collect(Collectors.toMap(MerchantDO::getExternalId, m -> m));

        // 3. 分类：toInsert 和 toUpdate
        List<MerchantDO> toInsert = new ArrayList<>();
        List<MerchantDO> toUpdate = new ArrayList<>();

        // 4. 保存 campaign -> merchant 的映射，用于后续创建 Offer
        Map<String, MerchantDO> campaignMerchantMap = new HashMap<>();

        for (AdmitadCampaign campaign : campaignMap.values()) {
            String externalId = String.valueOf(campaign.getId());
            MerchantDO existing = existingMerchantMap.get(externalId);

            MerchantDO merchant;
            if (existing != null) {
                merchant = existing;
                updateMerchant(merchant, campaign);
                toUpdate.add(merchant);
            } else {
                merchant = createMerchant(networkId, campaign);
                toInsert.add(merchant);
            }
            campaignMerchantMap.put(externalId, merchant);
        }

        // 5. 批量插入/更新 Merchants（先插入，这样新 Merchant 才有 ID）
        if (!toInsert.isEmpty()) {
            merchantMapper.insertBatch(toInsert);
            log.info("Batch inserted {} merchants", toInsert.size());
        }
        if (!toUpdate.isEmpty()) {
            merchantMapper.updateBatch(toUpdate);
            log.info("Batch updated {} merchants", toUpdate.size());
        }

        // 6. 在 Merchant 插入后，再创建 Offers（此时 merchant.getId() 已有值）
        Map<Long, List<OfferDO>> merchantOffersMap = new HashMap<>();
        for (AdmitadCampaign campaign : campaignMap.values()) {
            String externalId = String.valueOf(campaign.getId());
            MerchantDO merchant = campaignMerchantMap.get(externalId);

            if (campaign.getActions() != null && !campaign.getActions().isEmpty()) {
                List<OfferDO> offers = new ArrayList<>();
                for (AdmitadCampaign.Action action : campaign.getActions()) {
                    offers.add(createOffer(networkId, merchant.getId(), campaign, action, credential));
                }
                merchantOffersMap.put(merchant.getId(), offers);
            }
        }

        // 7. 批量处理 Offers（按 merchant 分组）
        for (Map.Entry<Long, List<OfferDO>> entry : merchantOffersMap.entrySet()) {
            Long merchantId = entry.getKey();
            List<OfferDO> offers = entry.getValue();
            syncOffersBatch(networkId, merchantId, offers);
            this.lastSyncOffers += offers.size();

            // 创建 TrackingLinks
            for (OfferDO offer : offers) {
                createOrUpdateOfferTrackingLink(offer);
            }
        }
    }

    /**
     * 批量同步 Offers
     * 基于唯一约束 (network_id, external_id, tenant_id) 进行幂等写入
     */
    @Transactional
    public void syncOffersBatch(Long networkId, Long merchantId, List<OfferDO> offers) {
        if (offers == null || offers.isEmpty()) {
            return;
        }

        // 预加载已存在的 Offers（基于 network_id + external_id，匹配唯一约束）
        List<String> externalIds = offers.stream().map(OfferDO::getExternalId).toList();
        List<OfferDO> existingOffers = offerMapper.selectListByNetworkAndExternalIds(networkId, externalIds);

        Map<String, OfferDO> existingOfferMap = existingOffers.stream()
            .collect(Collectors.toMap(OfferDO::getExternalId, o -> o));

        List<OfferDO> toInsert = new ArrayList<>();
        List<OfferDO> toUpdate = new ArrayList<>();

        for (OfferDO offer : offers) {
            OfferDO existing = existingOfferMap.get(offer.getExternalId());
            if (existing != null) {
                offer.setId(existing.getId());
                // 更新 merchantId（如果 merchant 被重新创建）
                offer.setMerchantId(merchantId);
                toUpdate.add(offer);
            } else {
                toInsert.add(offer);
            }
        }

        if (!toInsert.isEmpty()) {
            offerMapper.insertBatch(toInsert);
        }
        if (!toUpdate.isEmpty()) {
            offerMapper.updateBatch(toUpdate);
        }
    }

    /**
     * 同步优惠券数据（优化版：批量处理）
     * 根据 species 字段分流到 Coupon 或 Deal 表
     */
    public void syncCoupons(NetworkCredentialDO credential) {
        // Reset statistics at start (offers may be synced from campaigns)
        this.lastSyncCoupons = 0;
        this.lastSyncDeals = 0;
        this.lastSyncFailed = 0;
        this.lastSyncTime = LocalDateTime.now();

        Long websiteId = extractWebsiteId(credential);
        if (websiteId == null) {
            log.error("No websiteId found in credential {}", credential.getId());
            this.lastSyncFailed++;
            return;
        }

        int offset = 0;
        int limit = 100;
        int couponCount = 0;
        int dealCount = 0;

        while (true) {
            List<AdmitadCoupon> coupons = admitadClient.getCoupons(credential, websiteId, offset, limit);
            if (coupons.isEmpty()) {
                break;
            }

            // 批量处理
            syncCouponsBatch(credential.getNetworkId(), coupons);
            
            for (AdmitadCoupon coupon : coupons) {
                if ("promocode".equalsIgnoreCase(coupon.getSpecies())) {
                    couponCount++;
                    this.lastSyncCoupons++;
                } else {
                    dealCount++;
                    this.lastSyncDeals++;
                }
            }

            offset += limit;
            if (coupons.size() < limit) {
                break;
            }
        }

        log.info("Admitad coupon sync completed for network {}: {} coupons, {} deals",
            credential.getNetworkId(), couponCount, dealCount);
    }

    /**
     * 批量同步 Coupons 和 Deals
     * 1. 预加载已存在的数据
     * 2. 去重：同一批次内按 externalId 去重
     * 3. 幂等写入：区分 insert vs update
     * 4. 批量操作
     */
    @Transactional
    public void syncCouponsBatch(Long networkId, List<AdmitadCoupon> coupons) {
        if (coupons == null || coupons.isEmpty()) {
            return;
        }

        // 1. 去重：同一批次内按 externalId 去重
        Map<String, AdmitadCoupon> couponMap = new HashMap<>();
        for (AdmitadCoupon coupon : coupons) {
            couponMap.put(String.valueOf(coupon.getId()), coupon);
        }

        // 2. 分离 coupons 和 deals
        List<AdmitadCoupon> promoCodes = new ArrayList<>();
        List<AdmitadCoupon> deals = new ArrayList<>();

        for (AdmitadCoupon coupon : couponMap.values()) {
            if ("promocode".equalsIgnoreCase(coupon.getSpecies())) {
                promoCodes.add(coupon);
            } else {
                deals.add(coupon);
            }
        }

        // 3. 批量处理 promocodes -> Coupon
        if (!promoCodes.isEmpty()) {
            syncPromoCodesBatch(networkId, promoCodes);
        }

        // 4. 批量处理 deals -> Deal
        if (!deals.isEmpty()) {
            syncDealsBatch(networkId, deals);
        }
    }

    /**
     * 批量同步 PromoCodes 到 Coupon 表
     */
    @Transactional
    public void syncPromoCodesBatch(Long networkId, List<AdmitadCoupon> promoCodes) {
        if (promoCodes == null || promoCodes.isEmpty()) {
            return;
        }

        // 预加载已存在的 Coupons
        List<String> externalIds = promoCodes.stream().map(c -> String.valueOf(c.getId())).toList();
        List<CouponDO> existingCoupons = couponMapper.selectListByNetworkAndExternalIds(networkId, externalIds);

        Map<String, CouponDO> existingCouponMap = existingCoupons.stream()
            .collect(Collectors.toMap(CouponDO::getExternalId, c -> c));

        // 预加载 Merchants（批量查询所有关联的 merchants）
        Set<String> merchantExternalIds = promoCodes.stream()
            .filter(c -> c.getCampaign() != null)
            .map(c -> String.valueOf(c.getCampaign().getId()))
            .collect(Collectors.toSet());

        Map<String, MerchantDO> merchantMap = new HashMap<>();
        if (!merchantExternalIds.isEmpty()) {
            List<MerchantDO> merchants = merchantMapper.selectListByNetworkAndExternalIds(networkId, new ArrayList<>(merchantExternalIds));
            merchantMap = merchants.stream().collect(Collectors.toMap(MerchantDO::getExternalId, m -> m));
        }

        List<CouponDO> toInsert = new ArrayList<>();
        List<CouponDO> toUpdate = new ArrayList<>();

        for (AdmitadCoupon admitadCoupon : promoCodes) {
            String externalId = String.valueOf(admitadCoupon.getId());
            CouponDO existing = existingCouponMap.get(externalId);

            Long merchantId = null;
            if (admitadCoupon.getCampaign() != null) {
                MerchantDO merchant = merchantMap.get(String.valueOf(admitadCoupon.getCampaign().getId()));
                if (merchant != null) {
                    merchantId = merchant.getId();
                }
            }

            CouponDO coupon;
            if (existing != null) {
                coupon = existing;
                updateCoupon(coupon, networkId, merchantId, admitadCoupon);
                toUpdate.add(coupon);
            } else {
                coupon = createCoupon(networkId, merchantId, admitadCoupon);
                toInsert.add(coupon);
            }
        }

        if (!toInsert.isEmpty()) {
            couponMapper.insertBatch(toInsert);
            log.info("Batch inserted {} coupons", toInsert.size());
        }
        if (!toUpdate.isEmpty()) {
            couponMapper.updateBatch(toUpdate);
            log.info("Batch updated {} coupons", toUpdate.size());
        }

        // 创建 TrackingLinks
        for (CouponDO coupon : toInsert) {
            createOrUpdateCouponTrackingLink(coupon);
        }
        for (CouponDO coupon : toUpdate) {
            createOrUpdateCouponTrackingLink(coupon);
        }
    }

    /**
     * 批量同步 Deals 到 Deal 表
     */
    @Transactional
    public void syncDealsBatch(Long networkId, List<AdmitadCoupon> deals) {
        if (deals == null || deals.isEmpty()) {
            return;
        }

        // 预加载已存在的 Deals
        List<String> externalIds = deals.stream().map(c -> String.valueOf(c.getId())).toList();
        List<DealDO> existingDeals = dealMapper.selectListByNetworkAndExternalIds(networkId, externalIds);

        Map<String, DealDO> existingDealMap = existingDeals.stream()
            .collect(Collectors.toMap(DealDO::getExternalId, d -> d));

        // 预加载 Merchants
        Set<String> merchantExternalIds = deals.stream()
            .filter(c -> c.getCampaign() != null)
            .map(c -> String.valueOf(c.getCampaign().getId()))
            .collect(Collectors.toSet());

        Map<String, MerchantDO> merchantMap = new HashMap<>();
        if (!merchantExternalIds.isEmpty()) {
            List<MerchantDO> merchants = merchantMapper.selectListByNetworkAndExternalIds(networkId, new ArrayList<>(merchantExternalIds));
            merchantMap = merchants.stream().collect(Collectors.toMap(MerchantDO::getExternalId, m -> m));
        }

        List<DealDO> toInsert = new ArrayList<>();
        List<DealDO> toUpdate = new ArrayList<>();

        for (AdmitadCoupon admitadCoupon : deals) {
            String externalId = String.valueOf(admitadCoupon.getId());
            DealDO existing = existingDealMap.get(externalId);

            Long merchantId = null;
            if (admitadCoupon.getCampaign() != null) {
                MerchantDO merchant = merchantMap.get(String.valueOf(admitadCoupon.getCampaign().getId()));
                if (merchant != null) {
                    merchantId = merchant.getId();
                }
            }

            DealDO deal;
            if (existing != null) {
                deal = existing;
                updateDeal(deal, networkId, merchantId, admitadCoupon);
                toUpdate.add(deal);
            } else {
                deal = createDeal(networkId, merchantId, admitadCoupon);
                toInsert.add(deal);
            }
        }

        if (!toInsert.isEmpty()) {
            dealMapper.insertBatch(toInsert);
            log.info("Batch inserted {} deals", toInsert.size());
        }
        if (!toUpdate.isEmpty()) {
            dealMapper.updateBatch(toUpdate);
            log.info("Batch updated {} deals", toUpdate.size());
        }

        // 创建 TrackingLinks
        for (DealDO deal : toInsert) {
            createOrUpdateDealTrackingLink(deal);
        }
        for (DealDO deal : toUpdate) {
            createOrUpdateDealTrackingLink(deal);
        }
    }

    // ==================== 单个同步方法（向后兼容） ====================

    /**
     * 同步单个 Campaign/Merchant
     * @deprecated 使用 {@link #syncCampaignsBatch(Long, List, NetworkCredentialDO)} 替代
     */
    @Deprecated
    @Transactional
    public void syncSingleCampaign(Long networkId, AdmitadCampaign campaign, NetworkCredentialDO credential) {
        MerchantDO existingMerchant = merchantMapper.selectByNetworkAndExternalId(
            networkId, String.valueOf(campaign.getId()));

        MerchantDO merchant;
        if (existingMerchant != null) {
            merchant = existingMerchant;
            updateMerchant(merchant, campaign);
            merchantMapper.updateById(merchant);
        } else {
            merchant = createMerchant(networkId, campaign);
            merchantMapper.insert(merchant);
        }

        if (campaign.getActions() != null) {
            for (AdmitadCampaign.Action action : campaign.getActions()) {
                syncOffer(networkId, merchant.getId(), campaign, action, credential);
                this.lastSyncOffers++;
            }
        }
    }

    private MerchantDO createMerchant(Long networkId, AdmitadCampaign campaign) {
        MerchantDO merchant = new MerchantDO();
        merchant.setNetworkId(networkId);
        merchant.setExternalId(String.valueOf(campaign.getId()));
        updateMerchant(merchant, campaign);
        return merchant;
    }

    private void updateMerchant(MerchantDO merchant, AdmitadCampaign campaign) {
        merchant.setName(campaign.getName());
        merchant.setSlug(generateTrackingSlug("merchant", campaign.getName(), campaign.getId()));
        merchant.setDomain(extractDomain(campaign.getSiteUrl()));
        merchant.setLogoUrl(campaign.getLogoUrl());
        merchant.setDescription(campaign.getDescription());
        merchant.setRating(campaign.getRating());
        merchant.setStatus(mapStatus(campaign.getStatus()));

        if (campaign.getRegions() != null) {
            List<String> regions = campaign.getRegions().stream()
                .map(AdmitadCampaign.Region::getRegion)
                .collect(Collectors.toList());
            merchant.setRegions(regions);
        }

        if (campaign.getCategories() != null && !campaign.getCategories().isEmpty()) {
            String categoryIds = mapCategories(merchant.getNetworkId(), campaign.getCategories());
            merchant.setCategoryIds(categoryIds);
        }
    }

    private OfferDO syncOffer(Long networkId, Long merchantId, AdmitadCampaign campaign,
                              AdmitadCampaign.Action action, NetworkCredentialDO credential) {
        String externalId = campaign.getId() + "_" + action.getId();
        OfferDO existingOffer = offerMapper.selectByMerchantAndExternalId(merchantId, externalId);

        OfferDO offer;
        if (existingOffer != null) {
            offer = existingOffer;
            updateOffer(offer, campaign, action, credential);
            offerMapper.updateById(offer);
        } else {
            offer = createOffer(networkId, merchantId, campaign, action, credential);
            offerMapper.insert(offer);
        }

        createOrUpdateOfferTrackingLink(offer);
        return offer;
    }

    private OfferDO createOffer(Long networkId, Long merchantId, AdmitadCampaign campaign,
                                AdmitadCampaign.Action action, NetworkCredentialDO credential) {
        OfferDO offer = new OfferDO();
        offer.setNetworkId(networkId);
        offer.setMerchantId(merchantId);
        offer.setExternalId(campaign.getId() + "_" + action.getId());
        updateOffer(offer, campaign, action, credential);
        return offer;
    }

    private void updateOffer(OfferDO offer, AdmitadCampaign campaign, AdmitadCampaign.Action action,
                             NetworkCredentialDO credential) {
        offer.setName(action.getName() != null ? action.getName() : campaign.getName());
        offer.setDescription(campaign.getDescription());
        offer.setCommissionType(mapCommissionType(action.getType()));
        offer.setCommissionValue(action.getPayment());
        offer.setStatus(mapStatus(campaign.getStatus()));

        // 使用 Deeplink API 生成正确的 tracking URL
        String siteUrl = campaign.getSiteUrl();
        if (siteUrl != null && !siteUrl.isBlank() && credential != null) {
            String deeplink = admitadClient.generateDeeplink(credential, campaign.getId(), siteUrl, null);
            if (deeplink != null) {
                offer.setGotoUrl(deeplink);
            } else {
                // 降级使用商家官网 URL
                offer.setGotoUrl(siteUrl);
                log.warn("Failed to generate deeplink for campaign {}, using site URL as fallback", campaign.getId());
            }
        } else if (siteUrl != null && !siteUrl.isBlank()) {
            offer.setGotoUrl(siteUrl);
        }

        if (campaign.getCategories() != null && !campaign.getCategories().isEmpty()) {
            String categoryIds = mapCategories(offer.getNetworkId(), campaign.getCategories());
            offer.setCategoryIds(categoryIds);
        }

        if (campaign.getRegions() != null && !campaign.getRegions().isEmpty()) {
            List<String> regions = campaign.getRegions().stream()
                .map(AdmitadCampaign.Region::getRegion)
                .collect(Collectors.toList());
            offer.setRegions(regions);
        }
    }

    /**
     * 生成 TrackingLink 的 slug，统一格式：{type}-{name-slug}-{id}
     * @param type 类型前缀（merchant, offer, deal, coupon）
     * @param name 名称（用于生成可读的 slug）
     * @param id 实体 ID（保证唯一性）
     */
    private String generateTrackingSlug(String type, String name, Long id) {
        if (name == null || name.isBlank()) {
            return type + "-" + id;
        }
        String nameSlug = name.toLowerCase()
            .replaceAll("[^a-z0-9\\s-]", "")
            .replaceAll("\\s+", "-")
            .replaceAll("-+", "-")
            .replaceAll("^-|-$", "");
        // 限制名称部分长度，避免 slug 过长
        if (nameSlug.length() > 50) {
            nameSlug = nameSlug.substring(0, 50).replaceAll("-$", "");
        }
        return nameSlug.isEmpty() ? type + "-" + id : type + "-" + nameSlug + "-" + id;
    }

    private String extractDomain(String url) {
        if (url == null) return null;
        return url.replaceAll("https?://", "").replaceAll("/.*", "");
    }

    private Integer mapStatus(String status) {
        return "active".equalsIgnoreCase(status)
            ? CommonStatusEnum.ENABLE.getStatus()
            : CommonStatusEnum.DISABLE.getStatus();
    }

    private Integer mapCommissionType(String type) {
        return PayoutModelEnum.fromAdmitadType(type).getCode();
    }

    private String mapCategories(Long networkId, List<AdmitadCampaign.Category> categories) {
        return mapCategories(networkId, categories, CategoryService.DEFAULT_REGION);
    }

    private String mapCategories(Long networkId, List<AdmitadCampaign.Category> categories, String region) {
        List<Long> mappedCategoryIds = new ArrayList<>();

        for (AdmitadCampaign.Category category : categories) {
            String externalId = String.valueOf(category.getId());

            CategoryMappingDO mapping = categoryMappingMapper.selectByNetworkAndExternalId(networkId, externalId);

            if (mapping == null) {
                CategoryDO localCategory = createLocalCategory(category.getName(), region);
                categoryMapper.insert(localCategory);

                mapping = new CategoryMappingDO();
                mapping.setNetworkId(networkId);
                mapping.setExternalId(externalId);
                mapping.setExternalName(category.getName());
                mapping.setCategoryId(localCategory.getId());
                mapping.setAutoCreated(true);
                categoryMappingMapper.insert(mapping);
                log.info("Auto-created category: {} -> local id={}, region={}", category.getName(), localCategory.getId(), region);
            } else if (mapping.getCategoryId() == null) {
                CategoryDO localCategory = createLocalCategory(category.getName(), region);
                categoryMapper.insert(localCategory);
                mapping.setCategoryId(localCategory.getId());
                categoryMappingMapper.updateById(mapping);
                log.info("Auto-bound category: {} -> local id={}, region={}", category.getName(), localCategory.getId(), region);
            }

            if (mapping.getCategoryId() != null) {
                mappedCategoryIds.add(mapping.getCategoryId());
            }
        }

        return mappedCategoryIds.isEmpty() ? null :
            mappedCategoryIds.stream().map(String::valueOf).collect(Collectors.joining(","));
    }

    private CategoryDO createLocalCategory(String name, String region) {
        CategoryDO category = new CategoryDO();
        category.setParentId(0L);
        category.setName(name);
        category.setSlug(generateTrackingSlug("category", name, System.currentTimeMillis()));
        category.setLevel(1);
        category.setSort(0);
        category.setRegion(region);
        category.setStatus(CommonStatusEnum.ENABLE.getStatus());
        return category;
    }

    private Long extractWebsiteId(NetworkCredentialDO credential) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> creds = objectMapper.readValue(credential.getCredentials(), Map.class);
            Object websiteId = creds.get("websiteId");
            if (websiteId instanceof Number) {
                return ((Number) websiteId).longValue();
            } else if (websiteId instanceof String) {
                return Long.parseLong((String) websiteId);
            }
        } catch (Exception e) {
            log.error("Failed to extract websiteId from credential {}: {}", credential.getId(), e.getMessage());
        }
        return null;
    }

    private Integer mapCouponType(String species) {
        return CouponTypeEnum.fromAdmitadSpecies(species).getCode();
    }

    private void parseDiscount(CouponDO coupon, String discount) {
        if (discount == null || discount.isEmpty()) return;

        if (discount.endsWith("%")) {
            try {
                String value = discount.replace("%", "").trim();
                coupon.setDiscountValue(new BigDecimal(value));
                coupon.setDiscountType(DiscountTypeEnum.PERCENT.getCode());
                return;
            } catch (NumberFormatException ignored) {}
        }

        String numericPart = discount.replaceAll("[^0-9.]", "");
        if (!numericPart.isEmpty()) {
            try {
                coupon.setDiscountValue(new BigDecimal(numericPart));
                coupon.setDiscountType(DiscountTypeEnum.FIXED.getCode());
            } catch (NumberFormatException ignored) {}
        }
    }

    private Integer parseDiscountPercent(String discount) {
        if (discount == null || discount.isEmpty()) return null;

        if (discount.endsWith("%")) {
            try {
                String value = discount.replace("%", "").trim();
                return Integer.parseInt(value);
            } catch (NumberFormatException ignored) {}
        }
        return null;
    }

    private String mapCouponCategories(Long networkId, List<AdmitadCoupon.Category> categories) {
        return mapCouponCategories(networkId, categories, CategoryService.DEFAULT_REGION);
    }

    private String mapCouponCategories(Long networkId, List<AdmitadCoupon.Category> categories, String region) {
        List<Long> mappedCategoryIds = new ArrayList<>();

        for (AdmitadCoupon.Category category : categories) {
            String externalId = String.valueOf(category.getId());

            CategoryMappingDO mapping = categoryMappingMapper.selectByNetworkAndExternalId(networkId, externalId);

            if (mapping == null) {
                CategoryDO localCategory = createLocalCategory(category.getName(), region);
                categoryMapper.insert(localCategory);

                mapping = new CategoryMappingDO();
                mapping.setNetworkId(networkId);
                mapping.setExternalId(externalId);
                mapping.setExternalName(category.getName());
                mapping.setCategoryId(localCategory.getId());
                mapping.setAutoCreated(true);
                categoryMappingMapper.insert(mapping);
                log.info("Auto-created coupon category: {} -> local id={}, region={}", category.getName(), localCategory.getId(), region);
            } else if (mapping.getCategoryId() == null) {
                CategoryDO localCategory = createLocalCategory(category.getName(), region);
                categoryMapper.insert(localCategory);
                mapping.setCategoryId(localCategory.getId());
                categoryMappingMapper.updateById(mapping);
                log.info("Auto-bound coupon category: {} -> local id={}, region={}", category.getName(), localCategory.getId(), region);
            }

            if (mapping.getCategoryId() != null) {
                mappedCategoryIds.add(mapping.getCategoryId());
            }
        }

        return mappedCategoryIds.isEmpty() ? null :
            mappedCategoryIds.stream().map(String::valueOf).collect(Collectors.joining(","));
    }

    /**
     * 同步优惠券数据
     * @deprecated 使用 {@link #syncCoupons(NetworkCredentialDO)} 替代
     */
    @Deprecated
    public void syncCouponsLegacy(NetworkCredentialDO credential) {
        this.lastSyncCoupons = 0;
        this.lastSyncDeals = 0;
        this.lastSyncFailed = 0;
        this.lastSyncTime = LocalDateTime.now();

        Long websiteId = extractWebsiteId(credential);
        if (websiteId == null) {
            log.error("No websiteId found in credential {}", credential.getId());
            this.lastSyncFailed++;
            return;
        }

        int offset = 0;
        int limit = 100;
        int couponCount = 0;
        int dealCount = 0;

        while (true) {
            List<AdmitadCoupon> coupons = admitadClient.getCoupons(credential, websiteId, offset, limit);
            if (coupons.isEmpty()) {
                break;
            }

            for (AdmitadCoupon coupon : coupons) {
                try {
                    if ("promocode".equalsIgnoreCase(coupon.getSpecies())) {
                        syncSingleCoupon(credential.getNetworkId(), coupon);
                        couponCount++;
                        this.lastSyncCoupons++;
                    } else {
                        syncSingleDeal(credential.getNetworkId(), coupon);
                        dealCount++;
                        this.lastSyncDeals++;
                    }
                } catch (Exception e) {
                    this.lastSyncFailed++;
                    log.error("Failed to sync coupon {}: {}", coupon.getId(), e.getMessage());
                }
            }

            offset += limit;
            if (coupons.size() < limit) {
                break;
            }
        }

        log.info("Admitad coupon sync completed for network {}: {} coupons, {} deals",
            credential.getNetworkId(), couponCount, dealCount);
    }

    @Transactional
    public void syncSingleCoupon(Long networkId, AdmitadCoupon admitadCoupon) {
        String externalId = String.valueOf(admitadCoupon.getId());
        CouponDO existingCoupon = couponMapper.selectByNetworkAndExternalId(networkId, externalId);

        Long merchantId = null;
        if (admitadCoupon.getCampaign() != null) {
            MerchantDO merchant = merchantMapper.selectByNetworkAndExternalId(
                networkId, String.valueOf(admitadCoupon.getCampaign().getId()));
            if (merchant != null) {
                merchantId = merchant.getId();
            }
        }

        if (existingCoupon != null) {
            updateCoupon(existingCoupon, networkId, merchantId, admitadCoupon);
            couponMapper.updateById(existingCoupon);
            createOrUpdateCouponTrackingLink(existingCoupon);
        } else {
            CouponDO coupon = createCoupon(networkId, merchantId, admitadCoupon);
            couponMapper.insert(coupon);
            createOrUpdateCouponTrackingLink(coupon);
        }
    }

    private CouponDO createCoupon(Long networkId, Long merchantId, AdmitadCoupon admitadCoupon) {
        CouponDO coupon = new CouponDO();
        coupon.setNetworkId(networkId);
        coupon.setExternalId(String.valueOf(admitadCoupon.getId()));
        updateCoupon(coupon, networkId, merchantId, admitadCoupon);
        return coupon;
    }

    private void updateCoupon(CouponDO coupon, Long networkId, Long merchantId, AdmitadCoupon admitadCoupon) {
        coupon.setMerchantId(merchantId);
        coupon.setTitle(admitadCoupon.getName() != null ? admitadCoupon.getName() : admitadCoupon.getShortName());
        coupon.setCode(admitadCoupon.getPromocode());
        coupon.setTerms(admitadCoupon.getDescription());
        coupon.setImageUrl(admitadCoupon.getImage());
        coupon.setGotoUrl(admitadCoupon.getGotoLink());
        coupon.setExclusive(admitadCoupon.getExclusive());
        coupon.setVerified(admitadCoupon.getVerification());
        coupon.setCouponType(mapCouponType(admitadCoupon.getSpecies()));
        coupon.setStatus(CommonStatusEnum.ENABLE.getStatus());

        if (admitadCoupon.getDiscount() != null) {
            parseDiscount(coupon, admitadCoupon.getDiscount());
        }

        if (admitadCoupon.getDateStart() != null) {
            coupon.setStartTime(parseDateTime(admitadCoupon.getDateStart()));
        }
        if (admitadCoupon.getDateEnd() != null) {
            coupon.setEndTime(parseDateTime(admitadCoupon.getDateEnd()));
        }

        if (admitadCoupon.getRegions() != null && !admitadCoupon.getRegions().isEmpty()) {
            coupon.setRegions(new ArrayList<>(admitadCoupon.getRegions()));
        }

        if (admitadCoupon.getCategories() != null && !admitadCoupon.getCategories().isEmpty()) {
            String categoryIds = mapCouponCategories(networkId, admitadCoupon.getCategories());
            coupon.setCategoryIds(categoryIds);
        }
    }

    @Transactional
    public void syncSingleDeal(Long networkId, AdmitadCoupon admitadCoupon) {
        String externalId = String.valueOf(admitadCoupon.getId());
        DealDO existingDeal = dealMapper.selectByNetworkAndExternalId(networkId, externalId);

        Long merchantId = null;
        if (admitadCoupon.getCampaign() != null) {
            MerchantDO merchant = merchantMapper.selectByNetworkAndExternalId(
                networkId, String.valueOf(admitadCoupon.getCampaign().getId()));
            if (merchant != null) {
                merchantId = merchant.getId();
            }
        }

        if (existingDeal != null) {
            updateDeal(existingDeal, networkId, merchantId, admitadCoupon);
            dealMapper.updateById(existingDeal);
            createOrUpdateDealTrackingLink(existingDeal);
        } else {
            DealDO deal = createDeal(networkId, merchantId, admitadCoupon);
            dealMapper.insert(deal);
            createOrUpdateDealTrackingLink(deal);
        }
    }

    private DealDO createDeal(Long networkId, Long merchantId, AdmitadCoupon admitadCoupon) {
        DealDO deal = new DealDO();
        deal.setNetworkId(networkId);
        deal.setExternalId(String.valueOf(admitadCoupon.getId()));
        updateDeal(deal, networkId, merchantId, admitadCoupon);
        return deal;
    }

    private void updateDeal(DealDO deal, Long networkId, Long merchantId, AdmitadCoupon admitadCoupon) {
        deal.setMerchantId(merchantId);
        deal.setTitle(admitadCoupon.getName() != null ? admitadCoupon.getName() : admitadCoupon.getShortName());
        deal.setSlug(generateTrackingSlug("deal", deal.getTitle(), admitadCoupon.getId()));
        deal.setDescription(admitadCoupon.getDescription());
        deal.setImageUrl(admitadCoupon.getImage());
        deal.setGotoUrl(admitadCoupon.getGotoLink());
        deal.setExclusive(admitadCoupon.getExclusive());
        deal.setStatus(CommonStatusEnum.ENABLE.getStatus());

        if (admitadCoupon.getDiscount() != null) {
            deal.setDiscountPercent(parseDiscountPercent(admitadCoupon.getDiscount()));
        }

        if (admitadCoupon.getDateStart() != null) {
            deal.setStartTime(parseDateTime(admitadCoupon.getDateStart()));
        }
        if (admitadCoupon.getDateEnd() != null) {
            deal.setEndTime(parseDateTime(admitadCoupon.getDateEnd()));
        }

        if (admitadCoupon.getRegions() != null && !admitadCoupon.getRegions().isEmpty()) {
            deal.setRegions(new ArrayList<>(admitadCoupon.getRegions()));
        }

        if (admitadCoupon.getCategories() != null && !admitadCoupon.getCategories().isEmpty()) {
            String categoryIds = mapCouponCategories(networkId, admitadCoupon.getCategories());
            deal.setCategoryIds(categoryIds);
        }
    }

    private void createOrUpdateCouponTrackingLink(CouponDO coupon) {
        try {
            String trackingUrl = coupon.getGotoUrl();
            if (trackingUrl == null && coupon.getMerchantId() != null) {
                MerchantDO merchant = merchantMapper.selectById(coupon.getMerchantId());
                if (merchant != null && merchant.getExternalId() != null) {
                    trackingUrl = String.format(
                        "https://ad.admitad.com/g/%s/?subid={click_id}&subid1={sub1}&subid2={sub2}",
                        merchant.getExternalId());
                }
            }

            if (trackingUrl == null) {
                log.warn("Cannot create tracking link for coupon {}: no tracking URL available", coupon.getId());
                return;
            }

            String slug = generateTrackingSlug("coupon", coupon.getTitle(), coupon.getId());

            TrackingLinkCreateReqDTO reqDTO = new TrackingLinkCreateReqDTO();
            reqDTO.setTargetType(TARGET_TYPE_COUPON);
            reqDTO.setTargetId(coupon.getId());
            reqDTO.setMerchantId(coupon.getMerchantId());
            reqDTO.setSlug(slug);
            reqDTO.setTrackingUrl(trackingUrl);

            trackingLinkCommonApi.createOrUpdateTrackingLink(reqDTO);
            log.debug("Created/updated tracking link for coupon={}", coupon.getId());
        } catch (Exception e) {
            log.error("Failed to create/update tracking link for coupon {}: {}", coupon.getId(), e.getMessage());
        }
    }

    private void createOrUpdateDealTrackingLink(DealDO deal) {
        try {
            String trackingUrl = deal.getGotoUrl();
            if (trackingUrl == null && deal.getMerchantId() != null) {
                MerchantDO merchant = merchantMapper.selectById(deal.getMerchantId());
                if (merchant != null && merchant.getExternalId() != null) {
                    trackingUrl = String.format(
                        "https://ad.admitad.com/g/%s/?subid={click_id}&subid1={sub1}&subid2={sub2}",
                        merchant.getExternalId());
                }
            }

            if (trackingUrl == null) {
                log.warn("Cannot create tracking link for deal {}: no tracking URL available", deal.getId());
                return;
            }

            String slug = generateTrackingSlug("deal", deal.getTitle(), deal.getId());

            TrackingLinkCreateReqDTO reqDTO = new TrackingLinkCreateReqDTO();
            reqDTO.setTargetType(TARGET_TYPE_DEAL);
            reqDTO.setTargetId(deal.getId());
            reqDTO.setMerchantId(deal.getMerchantId());
            reqDTO.setSlug(slug);
            reqDTO.setTrackingUrl(trackingUrl);

            trackingLinkCommonApi.createOrUpdateTrackingLink(reqDTO);
            log.debug("Created/updated tracking link for deal={}", deal.getId());
        } catch (Exception e) {
            log.error("Failed to create/update tracking link for deal {}: {}", deal.getId(), e.getMessage());
        }
    }

    private void createOrUpdateOfferTrackingLink(OfferDO offer) {
        try {
            String trackingUrl = offer.getGotoUrl();
            if (trackingUrl == null) {
                MerchantDO merchant = merchantMapper.selectById(offer.getMerchantId());
                if (merchant != null && merchant.getExternalId() != null) {
                    trackingUrl = String.format(
                        "https://ad.admitad.com/g/%s/?subid={click_id}&subid1={sub1}&subid2={sub2}",
                        merchant.getExternalId());
                }
            }

            if (trackingUrl == null) {
                log.warn("Cannot create tracking link for offer {}: no tracking URL available", offer.getId());
                return;
            }

            String slug = generateTrackingSlug("offer", offer.getName(), offer.getId());

            TrackingLinkCreateReqDTO reqDTO = new TrackingLinkCreateReqDTO();
            reqDTO.setTargetType(TARGET_TYPE_OFFER);
            reqDTO.setTargetId(offer.getId());
            reqDTO.setMerchantId(offer.getMerchantId());
            reqDTO.setSlug(slug);
            reqDTO.setTrackingUrl(trackingUrl);

            trackingLinkCommonApi.createOrUpdateTrackingLink(reqDTO);
            log.debug("Created/updated tracking link for offer={}", offer.getId());
        } catch (Exception e) {
            log.error("Failed to create/update tracking link for offer {}: {}", offer.getId(), e.getMessage());
        }
    }

    private LocalDateTime parseDateTime(String dateStr) {
        if (dateStr == null || dateStr.isEmpty()) return null;
        try {
            return LocalDateTime.parse(dateStr, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        } catch (Exception e1) {
            try {
                return LocalDateTime.parse(dateStr, DATE_FORMATTER);
            } catch (Exception e2) {
                log.debug("Failed to parse date: {}", dateStr);
                return null;
            }
        }
    }

    /**
     * 同步数据（Merchant + Offer，通过 code 调用）
     */
    public AffiliateNetworkController.SyncResult syncData(String networkCode) {
        NetworkCredentialDO credential = getEnabledCredentialByNetworkCode(networkCode);
        if (credential == null) {
            return AffiliateNetworkController.SyncResult.error("No enabled credentials found for network: " + networkCode);
        }
        syncCampaigns(credential);
        Map<String, Object> stats = new HashMap<>();
        stats.put("merchants", lastSyncMerchants);
        stats.put("offers", lastSyncOffers);
        stats.put("failed", lastSyncFailed);
        return AffiliateNetworkController.SyncResult.success("Data sync completed", stats);
    }

    /**
     * 同步 Deal 数据（通过 code 调用）
     */
    public AffiliateNetworkController.SyncResult syncDeals(String networkCode) {
        NetworkCredentialDO credential = getEnabledCredentialByNetworkCode(networkCode);
        if (credential == null) {
            return AffiliateNetworkController.SyncResult.error("No enabled credentials found for network: " + networkCode);
        }
        syncCoupons(credential);
        Map<String, Object> stats = new HashMap<>();
        stats.put("deals", lastSyncDeals);
        stats.put("coupons", lastSyncCoupons);
        stats.put("failed", lastSyncFailed);
        return AffiliateNetworkController.SyncResult.success("Deal sync completed", stats);
    }

    /**
     * 同步优惠券和Deal数据（通过 code 调用）
     */
    public AffiliateNetworkController.SyncResult syncCouponsOnly(String networkCode) {
        NetworkCredentialDO credential = getEnabledCredentialByNetworkCode(networkCode);
        if (credential == null) {
            return AffiliateNetworkController.SyncResult.error("No enabled credentials found for network: " + networkCode);
        }
        syncCoupons(credential);
        Map<String, Object> stats = new HashMap<>();
        stats.put("coupons", lastSyncCoupons);
        stats.put("deals", lastSyncDeals);
        stats.put("failed", lastSyncFailed);
        return AffiliateNetworkController.SyncResult.success("Coupon sync completed", stats);
    }

    private NetworkCredentialDO getEnabledCredentialByNetworkCode(String networkCode) {
        List<NetworkCredentialDO> credentials = credentialMapper.selectEnabledByNetworkCode(networkCode);
        return credentials.isEmpty() ? null : credentials.get(0);
    }

}
