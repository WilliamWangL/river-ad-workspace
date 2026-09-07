package com.river.module.mediabuy.dal.redis;

/**
 * Mediabuy Redis Key 常量
 */
public interface RedisKeyConstants {

    /**
     * Offer 缓存
     * <p>
     * KEY 格式：mediabuy:offer:{offerId}
     * VALUE：OfferDO JSON
     */
    String OFFER = "mediabuy:offer:%s";

}

