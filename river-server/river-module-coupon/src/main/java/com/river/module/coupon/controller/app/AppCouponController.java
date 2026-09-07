package com.river.module.coupon.controller.app;

import com.river.framework.common.biz.affiliate.MerchantCommonApi;
import com.river.framework.common.biz.affiliate.dto.MerchantSimpleRespDTO;
import com.river.framework.common.pojo.CommonResult;
import com.river.framework.common.pojo.PageResult;
import com.river.framework.common.util.collection.CollectionUtils;
import com.river.framework.common.util.object.BeanUtils;
import com.river.module.coupon.controller.admin.coupon.vo.CouponPageReqVO;
import com.river.module.coupon.controller.app.vo.AppCouponPageReqVO;
import com.river.module.coupon.controller.app.vo.AppCouponMerchantRespVO;
import com.river.module.coupon.controller.app.vo.AppCouponRespVO;
import com.river.module.coupon.dal.dataobject.CouponDO;
import com.river.module.coupon.service.CouponService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import jakarta.annotation.security.PermitAll;
import jakarta.validation.Valid;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import static com.river.framework.common.pojo.CommonResult.success;

@Tag(name = "用户 App - 优惠券")
@RestController
@RequestMapping("/coupon/coupon")
@Validated
@PermitAll
public class AppCouponController {

    @Resource
    private CouponService couponService;

    @Resource
    private MerchantCommonApi merchantApi;

    @GetMapping("/page")
    @Operation(summary = "获取优惠券分页")
    public CommonResult<PageResult<AppCouponRespVO>> getCouponPage(
            @Valid AppCouponPageReqVO pageReqVO) {
        CouponPageReqVO adminPageReqVO = BeanUtils.toBean(pageReqVO, CouponPageReqVO.class);
        PageResult<CouponDO> pageResult = couponService.getCouponPage(adminPageReqVO);

        List<AppCouponRespVO> result = convertToAppVOList(pageResult.getList());
        return success(new PageResult<>(result, pageResult.getTotal()));
    }

    /**
     * 将优惠券DO列表转换为App VO列表，包含商家信息
     */
    private List<AppCouponRespVO> convertToAppVOList(List<CouponDO> coupons) {
        if (coupons == null || coupons.isEmpty()) {
            return List.of();
        }

        // 批量获取商家信息，避免 N+1 问题
        List<Long> merchantIds = coupons.stream()
                .map(CouponDO::getMerchantId)
                .distinct()
                .toList();
        List<MerchantSimpleRespDTO> merchants = merchantApi.getMerchantList(merchantIds);
        Map<Long, MerchantSimpleRespDTO> merchantMap = CollectionUtils.convertMap(merchants, MerchantSimpleRespDTO::getId);

        // 转换结果
        return coupons.stream().map(coupon -> {
            AppCouponRespVO vo = BeanUtils.toBean(coupon, AppCouponRespVO.class);
            vo.setDescription(coupon.getTerms());
            MerchantSimpleRespDTO merchant = merchantMap.get(coupon.getMerchantId());
            if (merchant != null) {
                vo.setMerchant(BeanUtils.toBean(merchant, AppCouponMerchantRespVO.class));
                vo.setMerchantName(merchant.getName());
                vo.setMerchantLogo(merchant.getLogoUrl());
            }
            return vo;
        }).toList();
    }

}
