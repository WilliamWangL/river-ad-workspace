package com.river.module.affiliate.controller.app;

import com.river.framework.common.enums.CommonStatusEnum;
import com.river.framework.common.pojo.CommonResult;
import com.river.framework.common.pojo.PageResult;
import com.river.framework.common.util.object.BeanUtils;
import com.river.module.affiliate.controller.admin.merchant.vo.MerchantPageReqVO;
import com.river.module.affiliate.controller.app.vo.AppMerchantPageReqVO;
import com.river.module.affiliate.controller.app.vo.AppMerchantRespVO;
import com.river.module.affiliate.dal.dataobject.MerchantDO;
import com.river.module.affiliate.service.MerchantService;
import com.river.module.coupon.api.statistics.CouponStatisticsApi;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import jakarta.annotation.security.PermitAll;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import jakarta.validation.Valid;

import static com.river.framework.common.pojo.CommonResult.success;

@Tag(name = "用户 App - 商家")
@RestController
@RequestMapping("/affiliate/merchant")
@Validated
@PermitAll
public class AppMerchantController {

    @Resource
    private MerchantService merchantService;

    @Resource
    private CouponStatisticsApi couponStatisticsApi;

    @GetMapping("/list")
    @Operation(summary = "获取商家列表")
    public CommonResult<List<AppMerchantRespVO>> getMerchantList(
            @RequestParam(value = "region", required = false) String region) {
        List<MerchantDO> list = merchantService.getMerchantListByRegion(region);
        return success(convertToAppVOList(list));
    }

    @GetMapping("/page")
    @Operation(summary = "获取商家分页")
    public CommonResult<PageResult<AppMerchantRespVO>> getMerchantPage(
            @Valid AppMerchantPageReqVO pageReqVO) {
        PageResult<MerchantDO> pageResult = merchantService.getMerchantPage(BeanUtils.toBean(pageReqVO,
                MerchantPageReqVO.class,info->{
                info.setStatus(CommonStatusEnum.ENABLE.getStatus());
        }));
        return success(convertToAppVOPage(pageResult));
    }

    @GetMapping("/get-by-slug")
    @Operation(summary = "根据 slug 获取商家详情")
    @Parameter(name = "slug", description = "商家 slug", required = true, example = "amazon")
    public CommonResult<AppMerchantRespVO> getMerchantBySlug(@RequestParam("slug") String slug) {
        MerchantDO merchant = merchantService.getMerchantBySlug(slug);
        if (merchant == null) {
            return success(null);
        }
        return success(convertToAppVO(merchant));
    }

    private AppMerchantRespVO convertToAppVO(MerchantDO merchant) {
        if (merchant == null) {
            return null;
        }
        Long dealCount = couponStatisticsApi.getDealCountByMerchantId(merchant.getId());
        Long couponCount = couponStatisticsApi.getCouponCountByMerchantId(merchant.getId());

        AppMerchantRespVO vo = new AppMerchantRespVO();
        vo.setId(merchant.getId());
        vo.setName(merchant.getName());
        vo.setSlug(merchant.getSlug());
        vo.setDomain(merchant.getDomain());
        vo.setLogoUrl(merchant.getLogoUrl());
        vo.setDescription(merchant.getDescription());
        vo.setIntro(merchant.getIntro());
        vo.setAbout(merchant.getAbout());
        vo.setRating(merchant.getRating());
        vo.setRegions(merchant.getRegions() != null ? merchant.getRegions() : Collections.emptyList());
        vo.setDealCount(dealCount != null ? dealCount.intValue() : 0);
        vo.setCouponCount(couponCount != null ? couponCount.intValue() : 0);

        return vo;
    }

    private List<AppMerchantRespVO> convertToAppVOList(List<MerchantDO> list) {
        if (list == null || list.isEmpty()) {
            return Collections.emptyList();
        }
        List<Long> merchantIds = list.stream().map(MerchantDO::getId).toList();
        Map<Long, Long> dealCounts = couponStatisticsApi.getDealCountsByMerchantIds(merchantIds);
        Map<Long, Long> couponCounts = couponStatisticsApi.getCouponCountsByMerchantIds(merchantIds);

        return list.stream().map(merchant -> {
            AppMerchantRespVO vo = new AppMerchantRespVO();
            vo.setId(merchant.getId());
            vo.setName(merchant.getName());
            vo.setSlug(merchant.getSlug());
            vo.setDomain(merchant.getDomain());
            vo.setLogoUrl(merchant.getLogoUrl());
            vo.setDescription(merchant.getDescription());
            vo.setIntro(merchant.getIntro());
            vo.setAbout(merchant.getAbout());
            vo.setRating(merchant.getRating());
            vo.setRegions(merchant.getRegions() != null ? merchant.getRegions() : Collections.emptyList());
            Long dealCount = dealCounts.getOrDefault(merchant.getId(), 0L);
            Long couponCount = couponCounts.getOrDefault(merchant.getId(), 0L);
            vo.setDealCount(dealCount.intValue());
            vo.setCouponCount(couponCount.intValue());

            return vo;
        }).toList();
    }

    private PageResult<AppMerchantRespVO> convertToAppVOPage(PageResult<MerchantDO> pageResult) {
        if (pageResult == null || pageResult.getList() == null) {
            return PageResult.empty();
        }
        List<AppMerchantRespVO> voList = convertToAppVOList(pageResult.getList());
        return new PageResult<>(voList, pageResult.getTotal());
    }

}
