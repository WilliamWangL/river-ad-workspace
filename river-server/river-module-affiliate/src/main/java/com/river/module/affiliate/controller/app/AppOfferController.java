package com.river.module.affiliate.controller.app;

import com.river.framework.common.pojo.CommonResult;
import com.river.module.affiliate.controller.app.vo.AppOfferRespVO;
import com.river.module.affiliate.dal.dataobject.OfferDO;
import com.river.module.affiliate.service.OfferService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import jakarta.annotation.security.PermitAll;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

import static com.river.framework.common.pojo.CommonResult.success;

@Tag(name = "用户 App - Offer")
@RestController
@RequestMapping("/affiliate/offer")
@Validated
@PermitAll
public class AppOfferController {

    @Resource
    private OfferService offerService;

    @GetMapping("/list-by-merchant")
    @Operation(summary = "获取商家的 Offer 列表（按地区筛选）")
    @Parameter(name = "merchantId", description = "商家 ID", required = true, example = "1024")
    @Parameter(name = "region", description = "地区代码（ISO）", example = "US")
    public CommonResult<List<AppOfferRespVO>> getOffersByMerchant(
            @RequestParam("merchantId") Long merchantId,
            @RequestParam(value = "region", required = false) String region) {
        List<OfferDO> offers = offerService.getOfferListByMerchantAndRegion(merchantId, region);
        return success(convertToAppVOList(offers));
    }

    private List<AppOfferRespVO> convertToAppVOList(List<OfferDO> list) {
        if (list == null || list.isEmpty()) {
            return Collections.emptyList();
        }
        return list.stream().map(this::convertToAppVO).toList();
    }

    private AppOfferRespVO convertToAppVO(OfferDO offer) {
        if (offer == null) {
            return null;
        }
        AppOfferRespVO vo = new AppOfferRespVO();
        vo.setId(offer.getId());
        vo.setMerchantId(offer.getMerchantId());
        vo.setName(offer.getName());
        vo.setDescription(offer.getDescription());
        vo.setCommissionType(offer.getCommissionType());
        vo.setCommissionValue(offer.getCommissionValue());
        vo.setCurrency(offer.getCurrency());
        vo.setRegions(offer.getRegions() != null ? offer.getRegions() : Collections.emptyList());
        vo.setGotoUrl(offer.getGotoUrl());
        return vo;
    }

}
