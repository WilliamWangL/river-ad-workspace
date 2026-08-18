package com.river.module.mediabuy.service;

import com.river.framework.common.util.http.JsRedirectUtil;
import com.river.module.affiliate.dal.dataobject.OfferDO;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import static com.river.framework.common.exception.util.ServiceExceptionUtil.exception;
import static com.river.module.mediabuy.enums.ErrorCodeConstants.OFFER_NOT_EXISTS;
import static com.river.module.mediabuy.enums.ErrorCodeConstants.OFFER_GOTO_URL_EMPTY;

@Service
@Validated
public class MediabuyJumpServiceImpl implements MediabuyJumpService {

    @Resource
    private OfferCacheService offerCacheService;

    @Resource
    private MediabuyClickLogService clickLogService;

    @Override
    public String buildJs200(Long offerId, String publisherClickId, String subid1, String subid2, HttpServletRequest request) {
        OfferDO offer = offerCacheService.getOffer(offerId);
        if (offer == null) {
            throw exception(OFFER_NOT_EXISTS);
        }
        if (offer.getGotoUrl() == null || offer.getGotoUrl().isBlank()) {
            throw exception(OFFER_GOTO_URL_EMPTY);
        }

        String trackLink = clickLogService.recordClick(offer, publisherClickId, subid1, subid2, request);

        return JsRedirectUtil.buildRedirectHtml(trackLink);
    }

}

