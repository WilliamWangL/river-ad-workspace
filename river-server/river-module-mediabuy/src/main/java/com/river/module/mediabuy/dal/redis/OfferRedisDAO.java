package com.river.module.mediabuy.dal.redis;

import com.river.framework.common.util.json.JsonUtils;
import com.river.module.affiliate.dal.dataobject.OfferDO;
import jakarta.annotation.Resource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Repository;

import java.util.concurrent.TimeUnit;

import static com.river.module.mediabuy.dal.redis.RedisKeyConstants.OFFER;

/**
 * {@link OfferDO} 的缓存 DAO
 * <p>
 * 缓存 key 仅使用 offerId（offerId 全局唯一），
 * 便于在仅持有 offerId 的场景下直接命中缓存，避免回查 DB 取 tenantId。
 */
@Repository
public class OfferRedisDAO {

    @Resource
    private StringRedisTemplate stringRedisTemplate;

    /**
     * Offer 缓存 TTL（秒）
     */
    @Value("${river.mediabuy.offer-cache-seconds:864000}")
    private long offerCacheSeconds;

    public OfferDO get(Long offerId) {
        String redisKey = formatKey(offerId);
        return JsonUtils.parseObject(stringRedisTemplate.opsForValue().get(redisKey), OfferDO.class);
    }

    public void set(OfferDO offer) {
        String redisKey = formatKey(offer.getId());
        // 清理多余字段，避免缓存
        offer.setUpdater(null).setUpdateTime(null).setCreateTime(null).setCreator(null).setDeleted(null);
        stringRedisTemplate.opsForValue().set(redisKey, JsonUtils.toJsonString(offer), offerCacheSeconds, TimeUnit.SECONDS);
    }

    public void delete(Long offerId) {
        stringRedisTemplate.delete(formatKey(offerId));
    }

    private static String formatKey(Long offerId) {
        return String.format(OFFER, offerId);
    }

}
