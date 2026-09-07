package com.river.module.coupon.controller.app;

import com.river.framework.common.biz.affiliate.MerchantCommonApi;
import com.river.framework.common.biz.affiliate.dto.MerchantSimpleRespDTO;
import com.river.framework.common.pojo.CommonResult;
import com.river.framework.common.pojo.PageResult;
import com.river.framework.common.util.collection.CollectionUtils;
import com.river.framework.common.util.object.BeanUtils;
import com.river.module.coupon.controller.admin.deal.vo.DealPageReqVO;
import com.river.module.coupon.controller.app.vo.AppDealPageReqVO;
import com.river.module.coupon.controller.app.vo.AppDealMerchantRespVO;
import com.river.module.coupon.controller.app.vo.AppDealRespVO;
import com.river.module.coupon.dal.dataobject.DealDO;
import com.river.module.coupon.service.DealService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import jakarta.annotation.security.PermitAll;
import jakarta.validation.Valid;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import static com.river.framework.common.pojo.CommonResult.success;

@Tag(name = "用户 App - Deal")
@RestController
@RequestMapping("/coupon/deal")
@Validated
@PermitAll
public class AppDealController {

    @Resource
    private DealService dealService;

    @Resource
    private MerchantCommonApi merchantApi;

    @GetMapping("/page")
    @Operation(summary = "获取 Deal 分页")
    public CommonResult<PageResult<AppDealRespVO>> getDealPage(
            @Valid AppDealPageReqVO pageReqVO) {
        DealPageReqVO adminPageReqVO = BeanUtils.toBean(pageReqVO, DealPageReqVO.class);
        PageResult<DealDO> pageResult = dealService.getDealPage(adminPageReqVO);

        List<AppDealRespVO> result = convertToAppVOList(pageResult.getList());
        return success(new PageResult<>(result, pageResult.getTotal()));
    }

    @GetMapping("/get-by-slug")
    @Operation(summary = "根据 slug 获取 Deal 详情")
    @Parameter(name = "slug", description = "Deal slug", required = true, example = "50-off-everything")
    public CommonResult<AppDealRespVO> getDealBySlug(@RequestParam("slug") String slug) {
        DealDO deal = dealService.getDealBySlug(slug);
        if (deal == null) {
            return success(null);
        }
        AppDealRespVO vo = BeanUtils.toBean(deal, AppDealRespVO.class);
        MerchantSimpleRespDTO merchant = merchantApi.getMerchant(deal.getMerchantId());
        if (merchant != null) {
            vo.setMerchant(BeanUtils.toBean(merchant, AppDealMerchantRespVO.class));
            vo.setMerchantName(merchant.getName());
            vo.setMerchantLogo(merchant.getLogoUrl());
        }
        return success(vo);
    }

    /**
     * 将Deal DO列表转换为App VO列表，包含商家信息
     */
    private List<AppDealRespVO> convertToAppVOList(List<DealDO> deals) {
        if (deals == null || deals.isEmpty()) {
            return List.of();
        }

        // 批量获取商家信息，避免 N+1 问题
        List<Long> merchantIds = deals.stream()
                .map(DealDO::getMerchantId)
                .distinct()
                .toList();
        List<MerchantSimpleRespDTO> merchants = merchantApi.getMerchantList(merchantIds);
        Map<Long, MerchantSimpleRespDTO> merchantMap = CollectionUtils.convertMap(merchants, MerchantSimpleRespDTO::getId);

        // 转换结果
        return deals.stream().map(deal -> {
            AppDealRespVO vo = BeanUtils.toBean(deal, AppDealRespVO.class);
            MerchantSimpleRespDTO merchant = merchantMap.get(deal.getMerchantId());
            if (merchant != null) {
                vo.setMerchant(BeanUtils.toBean(merchant, AppDealMerchantRespVO.class));
                vo.setMerchantName(merchant.getName());
                vo.setMerchantLogo(merchant.getLogoUrl());
            }
            return vo;
        }).toList();
    }

}
