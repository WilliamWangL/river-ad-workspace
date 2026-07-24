package com.river.module.affiliate.service.network.rakuten;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.river.module.affiliate.controller.admin.network.AffiliateNetworkController;
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
import com.river.framework.common.biz.tracking.TrackingLinkCommonApi;
import com.river.framework.common.biz.tracking.dto.TrackingLinkCreateReqDTO;
import com.river.framework.common.enums.CommonStatusEnum;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.Resource;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Rakuten Advertising 数据同步服务
 * 
 * 同步逻辑：
 * 1. 通过 Partnerships API 获取已合作的广告商列表
 * 2. 通过 Advertisers API 补充广告商详细信息
 * 3. 通过 Commissioning Lists API 获取佣金结构（映射为 Offer）
 * 4. 自动生成 TrackingLink
 */
@Slf4j
@Service
public class RakutenSyncService {

    /** 目标类型常量 */
    private static final int TARGET_TYPE_OFFER = 2;

    @Resource
    private RakutenClient rakutenClient;

    @Resource
    private MerchantMapper merchantMapper;

    @Resource
    private OfferMapper offerMapper;

    @Resource
    private CategoryMapper categoryMapper;

    @Resource
    private CategoryMappingMapper categoryMappingMapper;

    @Resource
    private TrackingLinkCommonApi trackingLinkCommonApi;

    @Resource
    private NetworkCredentialMapper credentialMapper;

    private static final ObjectMapper objectMapper = new ObjectMapper();

    // Sync statistics
    private volatile int lastSyncMerchants = 0;
    private volatile int lastSyncOffers = 0;
    private volatile int lastSyncFailed = 0;
    private volatile LocalDateTime lastSyncTime = null;

    /**
     * 获取最近同步统计
     */
    public Map<String, Object> getLastSyncStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("merchants", lastSyncMerchants);
        stats.put("offers", lastSyncOffers);
        stats.put("failed", lastSyncFailed);
        stats.put("lastSyncTime", lastSyncTime);
        return stats;
    }

    /**
     * 同步广告商和 Offer 数据
     * 
     * @param credential 网络凭证
     */
    public void syncData(NetworkCredentialDO credential) {
        // Reset statistics
        this.lastSyncMerchants = 0;
        this.lastSyncOffers = 0;
        this.lastSyncFailed = 0;
        this.lastSyncTime = LocalDateTime.now();

        // 1. 通过 Partnerships API 获取已合作广告商
        syncPartnerships(credential);

        log.info("Rakuten sync completed for network {}: {} merchants, {} offers",
                credential.getNetworkId(), lastSyncMerchants, lastSyncOffers);
    }

    /**
     * 通过 Partnerships API 同步已合作广告商
     */
    private void syncPartnerships(NetworkCredentialDO credential) {
        int page = 1;
        int perPage = 100;
        int totalSynced = 0;

        while (true) {
            RakutenClient.PartnershipResponse response = rakutenClient.getPartnerships(credential, page, perPage);
            List<RakutenClient.Partnership> partnerships = response.getData();

            if (partnerships == null || partnerships.isEmpty()) {
                break;
            }

            // 批量同步
            syncPartnershipsBatch(credential.getNetworkId(), partnerships, credential);
            totalSynced += partnerships.size();
            this.lastSyncMerchants += partnerships.size();

            // 检查是否还有更多页
            if (response.getPagination() != null) {
                RakutenClient.Pagination pagination = response.getPagination();
                if (page >= pagination.getTotalPages() || partnerships.size() < perPage) {
                    break;
                }
            } else if (partnerships.size() < perPage) {
                break;
            }

            page++;
        }

        log.info("Rakuten partnership sync: {} partnerships synced", totalSynced);
    }

    /**
     * 批量同步 Partnerships（广告商 + Offers）
     */
    @Transactional
    public void syncPartnershipsBatch(Long networkId, List<RakutenClient.Partnership> partnerships,
                                       NetworkCredentialDO credential) {
        if (partnerships == null || partnerships.isEmpty()) {
            return;
        }

        // 1. 去重
        Map<Long, RakutenClient.Partnership> partnershipMap = new HashMap<>();
        for (RakutenClient.Partnership p : partnerships) {
            partnershipMap.put(p.getAdvertiserId(), p);
        }

        // 2. 预加载已存在的商家
        List<String> externalIds = partnershipMap.keySet().stream()
                .map(String::valueOf).toList();
        List<MerchantDO> existingMerchants = merchantMapper.selectListByNetworkAndExternalIds(networkId, externalIds);
        Map<String, MerchantDO> existingMerchantMap = existingMerchants.stream()
                .collect(Collectors.toMap(MerchantDO::getExternalId, m -> m));

        // 3. 分类：toInsert 和 toUpdate
        List<MerchantDO> toInsert = new ArrayList<>();
        List<MerchantDO> toUpdate = new ArrayList<>();
        Map<Long, MerchantDO> advertiserMerchantMap = new HashMap<>();

        for (RakutenClient.Partnership partnership : partnershipMap.values()) {
            String externalId = String.valueOf(partnership.getAdvertiserId());
            MerchantDO existing = existingMerchantMap.get(externalId);

            MerchantDO merchant;
            if (existing != null) {
                merchant = existing;
                updateMerchant(merchant, partnership);
                toUpdate.add(merchant);
            } else {
                merchant = createMerchant(networkId, partnership);
                toInsert.add(merchant);
            }
            advertiserMerchantMap.put(partnership.getAdvertiserId(), merchant);
        }

        // 4. 批量插入/更新 Merchants
        if (!toInsert.isEmpty()) {
            merchantMapper.insertBatch(toInsert);
            log.info("Rakuten: Batch inserted {} merchants", toInsert.size());
        }
        if (!toUpdate.isEmpty()) {
            merchantMapper.updateBatch(toUpdate);
            log.info("Rakuten: Batch updated {} merchants", toUpdate.size());
        }

        // 5. 获取每个广告商的 Commission Lists（Offers）
        for (Map.Entry<Long, MerchantDO> entry : advertiserMerchantMap.entrySet()) {
            Long advertiserId = entry.getKey();
            MerchantDO merchant = entry.getValue();

            try {
                syncCommissionLists(networkId, merchant, advertiserId, credential);
            } catch (Exception e) {
                this.lastSyncFailed++;
                log.error("Failed to sync commission lists for advertiser {}: {}", advertiserId, e.getMessage());
            }
        }
    }

    /**
     * 同步广告商的佣金列表（映射为 Offer）
     */
    private void syncCommissionLists(Long networkId, MerchantDO merchant, Long advertiserId,
                                      NetworkCredentialDO credential) {
        int page = 1;
        int perPage = 50;

        while (true) {
            RakutenClient.CommissionListResponse response =
                    rakutenClient.getCommissionLists(credential, advertiserId, page, perPage);
            List<RakutenCommissionList> commissionLists = response.getData();

            if (commissionLists == null || commissionLists.isEmpty()) {
                break;
            }

            syncCommissionListsBatch(networkId, merchant, commissionLists, credential);

            if (response.getPagination() != null) {
                RakutenClient.Pagination pagination = response.getPagination();
                if (page >= pagination.getTotalPages() || commissionLists.size() < perPage) {
                    break;
                }
            } else if (commissionLists.size() < perPage) {
                break;
            }

            page++;
        }
    }

    /**
     * 批量同步佣金列表到 Offer 表
     */
    @Transactional
    public void syncCommissionListsBatch(Long networkId, MerchantDO merchant,
                                          List<RakutenCommissionList> commissionLists,
                                          NetworkCredentialDO credential) {
        if (commissionLists == null || commissionLists.isEmpty()) {
            return;
        }

        // 1. 去重
        Map<String, RakutenCommissionList> listMap = new HashMap<>();
        for (RakutenCommissionList cl : commissionLists) {
            listMap.put(String.valueOf(cl.getId()), cl);
        }

        // 2. 预加载已存在的 Offers
        List<String> externalIds = listMap.keySet().stream().toList();
        List<OfferDO> existingOffers = offerMapper.selectListByNetworkAndExternalIds(networkId, externalIds);
        Map<String, OfferDO> existingOfferMap = existingOffers.stream()
                .collect(Collectors.toMap(OfferDO::getExternalId, o -> o));

        List<OfferDO> toInsert = new ArrayList<>();
        List<OfferDO> toUpdate = new ArrayList<>();

        for (RakutenCommissionList cl : listMap.values()) {
            String externalId = String.valueOf(cl.getId());
            OfferDO existing = existingOfferMap.get(externalId);

            OfferDO offer;
            if (existing != null) {
                offer = existing;
                updateOffer(offer, merchant, cl, credential);
                toUpdate.add(offer);
            } else {
                offer = createOffer(networkId, merchant, cl, credential);
                toInsert.add(offer);
            }
        }

        // 3. 批量插入/更新
        if (!toInsert.isEmpty()) {
            offerMapper.insertBatch(toInsert);
            log.info("Rakuten: Batch inserted {} offers", toInsert.size());
        }
        if (!toUpdate.isEmpty()) {
            offerMapper.updateBatch(toUpdate);
            log.info("Rakuten: Batch updated {} offers", toUpdate.size());
        }

        // 4. 创建 TrackingLinks
        for (OfferDO offer : toInsert) {
            createOrUpdateOfferTrackingLink(offer);
        }
        for (OfferDO offer : toUpdate) {
            createOrUpdateOfferTrackingLink(offer);
        }

        this.lastSyncOffers += listMap.size();
    }

    // ==================== Merchant CRUD ====================

    private MerchantDO createMerchant(Long networkId, RakutenClient.Partnership partnership) {
        MerchantDO merchant = new MerchantDO();
        merchant.setNetworkId(networkId);
        merchant.setExternalId(String.valueOf(partnership.getAdvertiserId()));
        updateMerchant(merchant, partnership);
        return merchant;
    }

    private void updateMerchant(MerchantDO merchant, RakutenClient.Partnership partnership) {
        merchant.setName(partnership.getAdvertiserName());
        merchant.setSlug(generateSlug("merchant", partnership.getAdvertiserName(), partnership.getAdvertiserId()));
        merchant.setDomain(extractDomain(partnership.getUrl()));
        merchant.setLogoUrl(partnership.getLogoUrl());
        merchant.setDescription(partnership.getDescription());
        merchant.setStatus(mapPartnershipStatus(partnership.getStatus()));
        // 默认全球区域
        merchant.setRegions(List.of("GLOBAL"));
    }

    // ==================== Offer CRUD ====================

    private OfferDO createOffer(Long networkId, MerchantDO merchant,
                                 RakutenCommissionList cl, NetworkCredentialDO credential) {
        OfferDO offer = new OfferDO();
        offer.setNetworkId(networkId);
        offer.setMerchantId(merchant.getId());
        offer.setExternalId(String.valueOf(cl.getId()));
        updateOffer(offer, merchant, cl, credential);
        return offer;
    }

    private void updateOffer(OfferDO offer, MerchantDO merchant, RakutenCommissionList cl,
                              NetworkCredentialDO credential) {
        offer.setName(cl.getOfferName() != null ? cl.getOfferName() :
                cl.getAdvertiserName() + " - " + cl.getCommissionType());
        offer.setDescription(null);
        offer.setCommissionType(PayoutModelEnum.fromRakutenType(cl.getCommissionType()).getCode());
        offer.setCommissionValue(cl.getCommissionRate() != null ? cl.getCommissionRate() : BigDecimal.ZERO);
        offer.setCurrency(cl.getCurrency() != null ? cl.getCurrency() : "USD");
        offer.setCookieDays(cl.getCookieDuration() != null ? cl.getCookieDuration() : 30);
        offer.setStatus(mapStatus(cl.getStatus()));

        // 使用 Click URL 或通过 Get Links API 生成推广链接
        if (cl.getClickUrl() != null && !cl.getClickUrl().isBlank()) {
            offer.setGotoUrl(cl.getClickUrl());
        } else if (merchant.getDomain() != null && credential != null) {
            String targetUrl = "https://" + merchant.getDomain();
            String link = rakutenClient.getLink(credential, Long.valueOf(merchant.getExternalId()), targetUrl, null);
            offer.setGotoUrl(link != null ? link : targetUrl);
        }

        offer.setLandingUrl(cl.getLandingUrl());

        // 地区
        if (cl.getCountries() != null && !cl.getCountries().isEmpty()) {
            offer.setRegions(new ArrayList<>(cl.getCountries()));
        }

        // 分类映射
        if (cl.getCategories() != null && !cl.getCategories().isEmpty()) {
            String categoryIds = mapCategories(offer.getNetworkId(), cl.getCategories());
            offer.setCategoryIds(categoryIds);
        }
    }

    // ==================== Tracking Link ====================

    private void createOrUpdateOfferTrackingLink(OfferDO offer) {
        try {
            String trackingUrl = offer.getGotoUrl();
            if (trackingUrl == null) {
                MerchantDO merchant = merchantMapper.selectById(offer.getMerchantId());
                if (merchant != null && merchant.getDomain() != null) {
                    trackingUrl = "https://" + merchant.getDomain();
                }
            }

            if (trackingUrl == null) {
                log.warn("Cannot create tracking link for Rakuten offer {}: no URL available", offer.getId());
                return;
            }

            String slug = generateSlug("offer", offer.getName(), offer.getId());

            TrackingLinkCreateReqDTO reqDTO = new TrackingLinkCreateReqDTO();
            reqDTO.setTargetType(TARGET_TYPE_OFFER);
            reqDTO.setTargetId(offer.getId());
            reqDTO.setSlug(slug);
            reqDTO.setTrackingUrl(trackingUrl);

            trackingLinkCommonApi.createOrUpdateTrackingLink(reqDTO);
            log.debug("Created/updated Rakuten tracking link for offer={}", offer.getId());
        } catch (Exception e) {
            log.error("Failed to create/update Rakuten tracking link for offer {}: {}", offer.getId(), e.getMessage());
        }
    }

    // ==================== Category Mapping ====================

    private String mapCategories(Long networkId, List<RakutenCommissionList.Category> categories) {
        return mapCategories(networkId, categories, CategoryService.DEFAULT_REGION);
    }

    private String mapCategories(Long networkId, List<RakutenCommissionList.Category> categories, String region) {
        List<Long> mappedCategoryIds = new ArrayList<>();

        for (RakutenCommissionList.Category category : categories) {
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
                log.info("Rakuten: Auto-created category: {} -> local id={}, region={}",
                        category.getName(), localCategory.getId(), region);
            } else if (mapping.getCategoryId() == null) {
                CategoryDO localCategory = createLocalCategory(category.getName(), region);
                categoryMapper.insert(localCategory);
                mapping.setCategoryId(localCategory.getId());
                categoryMappingMapper.updateById(mapping);
                log.info("Rakuten: Auto-bound category: {} -> local id={}, region={}",
                        category.getName(), localCategory.getId(), region);
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
        category.setSlug(generateSlug("category", name, System.currentTimeMillis()));
        category.setLevel(1);
        category.setSort(0);
        category.setRegion(region);
        category.setStatus(CommonStatusEnum.ENABLE.getStatus());
        return category;
    }

    // ==================== Utility ====================

    private String generateSlug(String type, String name, Long id) {
        if (name == null || name.isBlank()) {
            return type + "-" + id;
        }
        String nameSlug = name.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
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

    private Integer mapPartnershipStatus(String status) {
        if (status == null) return CommonStatusEnum.ENABLE.getStatus();
        return switch (status.toLowerCase()) {
            case "approved", "active" -> CommonStatusEnum.ENABLE.getStatus();
            default -> CommonStatusEnum.DISABLE.getStatus();
        };
    }

    // ==================== Public API wrappers ====================

    /**
     * 同步数据（通过 code 调用）
     */
    public AffiliateNetworkController.SyncResult syncData(String networkCode) {
        NetworkCredentialDO credential = getEnabledCredentialByNetworkCode(networkCode);
        if (credential == null) {
            return AffiliateNetworkController.SyncResult.error(
                    "No enabled credentials found for network: " + networkCode);
        }
        syncData(credential);
        Map<String, Object> stats = new HashMap<>();
        stats.put("merchants", lastSyncMerchants);
        stats.put("offers", lastSyncOffers);
        stats.put("failed", lastSyncFailed);
        return AffiliateNetworkController.SyncResult.success("Rakuten data sync completed", stats);
    }

    private NetworkCredentialDO getEnabledCredentialByNetworkCode(String networkCode) {
        List<NetworkCredentialDO> credentials = credentialMapper.selectEnabledByNetworkCode(networkCode);
        return credentials.isEmpty() ? null : credentials.get(0);
    }
}
