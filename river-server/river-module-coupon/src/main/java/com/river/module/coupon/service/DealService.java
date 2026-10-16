package com.river.module.coupon.service;

import com.river.framework.common.pojo.PageResult;
import com.river.module.coupon.controller.admin.deal.vo.DealPageReqVO;
import com.river.module.coupon.controller.app.vo.AppDealSitemapRespVO;
import com.river.module.coupon.dal.dataobject.DealDO;

import java.util.List;

public interface DealService {

    Long createDeal(DealDO deal);

    void updateDeal(DealDO deal);

    void deleteDeal(Long id);

    DealDO getDeal(Long id);

    List<DealDO> getDealList();

    PageResult<DealDO> getDealPage(DealPageReqVO pageReqVO);

    void validateDealExists(Long id);

    DealDO getDealBySlug(String slug);

    int updateExpiredDeals();

    /** 统计 ENABLE 状态的 Deal 总数（供 sitemap 分片计算） */
    Long getSitemapDealCount();

    /** 轻量分页查询 sitemap 所需字段（仅 id/slug/updateTime，按 id 升序） */
    PageResult<AppDealSitemapRespVO> getSitemapDealPage(Integer pageNo, Integer pageSize);

    /** 热门 Deal（非 feed 导入的运营 deal，供 sitemap 主文件），仅 id/slug/updateTime */
    List<AppDealSitemapRespVO> getSitemapHotDeals(int limit);

}
