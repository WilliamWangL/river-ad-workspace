package com.river.module.mediabuy.service;

import com.river.framework.tenant.core.aop.TenantIgnore;
import com.river.module.affiliate.dal.dataobject.OfferDO;
import com.river.module.affiliate.service.OfferService;
import com.river.module.mediabuy.dal.redis.OfferRedisDAO;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

/**
 * Offer 缓存服务实现：标准 cache-aside 模式
 * <ol>
 *     <li>先查 Redis 缓存，命中直接返回</li>
 *     <li>未命中则查询数据库</li>
 *     <li>查到则写入 Redis 后返回</li>
 * </ol>
 */
@Service
@Validated
public class OfferCacheServiceImpl implements OfferCacheService {

    @Resource
    private OfferService offerService;

    @Resource
    private OfferRedisDAO offerRedisDAO;

    @Override
    @TenantIgnore // mediabuy 跳转链路不带租户上下文，offerId 为全局唯一主键
    public OfferDO getOffer(Long offerId) {
        // 1. 先查 Redis 缓存
        OfferDO cached = offerRedisDAO.get(offerId);
        if (cached != null) {
            return cached;
        }

        // 2. 缓存未命中，查询数据库
        OfferDO offer = offerService.getOffer(offerId);
        if (offer == null) {
            return null;
        }

        // 3. 写入缓存后返回
        offerRedisDAO.set(offer);
        return offer;
    }

}
