package com.river.module.mediabuy.service;

import com.river.module.affiliate.dal.dataobject.OfferDO;

/**
 * Offer 缓存服务（Redis）
 */
public interface OfferCacheService {

    OfferDO getOffer(Long offerId);

}

