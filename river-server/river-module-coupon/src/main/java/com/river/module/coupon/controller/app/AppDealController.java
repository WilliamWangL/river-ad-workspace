package com.river.module.coupon.controller.app;

import com.river.framework.common.enums.CommonStatusEnum;
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
import com.river.module.coupon.controller.app.vo.AppDealSitemapRespVO;
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
        DealPageReqVO adminPageReqVO = BeanUtils.toBean(pageReqVO, DealPageReqVO.class,
                info -> info.setStatus(CommonStatusEnum.ENABLE.getStatus()));
        PageResult<DealDO> pageResult = dealService.getDealPage(adminPageReqVO);

        List<AppDealRespVO> result = convertToAppVOList(pageResult.getList());
        return success(new PageResult<>(result, pageResult.getTotal()));
    }

    @GetMapping("/sitemap-count")
    @Operation(summary = "获取 Sitemap Deal 总数（ENABLE 状态）")
    @PermitAll
    public CommonResult<Long> getSitemapDealCount() {
        return success(dealService.getSitemapDealCount());
    }

    @GetMapping("/sitemap-page")
    @Operation(summary = "获取 Sitemap Deal 轻量分页（仅 slug 与更新时间，按 id 升序）")
    @PermitAll
    public CommonResult<PageResult<AppDealSitemapRespVO>> getSitemapDealPage(
            @RequestParam(value = "pageNo", defaultValue = "1", required = false) Integer pageNo,
            @RequestParam(value = "pageSize", defaultValue = "5000", required = false) Integer pageSize) {
        // 单次上限防止滥用（50k 行轻量字段约 5MB 响应）
        int cappedSize = Math.min(Math.max(pageSize != null ? pageSize : 5000, 1), 50000);
        int safePageNo = Math.max(pageNo != null ? pageNo : 1, 1);
        return success(dealService.getSitemapDealPage(safePageNo, cappedSize));
    }

    @GetMapping("/sitemap-hot")
    @Operation(summary = "获取热门 Deal（非 feed 导入的运营 deal，供 sitemap 主文件）")
    @PermitAll
    public CommonResult<List<AppDealSitemapRespVO>> getSitemapHotDeals(
            @RequestParam(value = "limit", defaultValue = "5000", required = false) Integer limit) {
        int capped = Math.min(Math.max(limit != null ? limit : 5000, 1), 50000);
        return success(dealService.getSitemapHotDeals(capped));
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
