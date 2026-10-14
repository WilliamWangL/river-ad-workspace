package com.river.module.coupon.service;

import cn.hutool.core.util.NumberUtil;
import com.river.framework.common.enums.CommonStatusEnum;
import com.river.framework.common.pojo.PageParam;
import com.river.framework.common.pojo.PageResult;
import com.river.framework.common.util.object.BeanUtils;
import com.river.framework.mybatis.core.query.LambdaQueryWrapperX;
import com.river.module.coupon.controller.admin.deal.vo.DealPageReqVO;
import com.river.module.coupon.controller.app.vo.AppDealSitemapRespVO;
import com.river.module.coupon.dal.dataobject.DealDO;
import com.river.module.coupon.dal.mysql.DealCategoryMapper;
import com.river.module.coupon.dal.mysql.DealMapper;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static com.river.framework.common.exception.util.ServiceExceptionUtil.exception;
import static com.river.module.coupon.enums.ErrorCodeConstants.*;

@Service
@Validated
public class DealServiceImpl implements DealService {

    @Resource
    private DealMapper dealMapper;

    @Resource
    private DealCategoryMapper dealCategoryMapper;

    @Override
    public Long createDeal(DealDO deal) {
        if (deal.getSlug() == null || deal.getSlug().isBlank()) {
            deal.setSlug(generateUniqueSlug(deal.getTitle()));
        }
        validateSlugUnique(null, deal.getSlug());
        validateNetworkExternalIdUnique(null, deal.getNetworkId(), deal.getExternalId());
        dealMapper.insert(deal);
        dealCategoryMapper.replaceDealCategories(deal.getId(), parseCategoryIds(deal.getCategoryIds()));
        return deal.getId();
    }

    @Override
    public void updateDeal(DealDO deal) {
        validateDealExists(deal.getId());
        if (deal.getSlug() != null && !deal.getSlug().isBlank()) {
            validateSlugUnique(deal.getId(), deal.getSlug());
        }
        validateNetworkExternalIdUnique(deal.getId(), deal.getNetworkId(), deal.getExternalId());
        dealMapper.updateById(deal);
        // 仅当显式传入 categoryIds 时同步关联表（部分更新不覆盖既有分类）
        if (deal.getCategoryIds() != null) {
            dealCategoryMapper.replaceDealCategories(deal.getId(), parseCategoryIds(deal.getCategoryIds()));
        }
    }

    @Override
    public void deleteDeal(Long id) {
        validateDealExists(id);
        dealMapper.deleteById(id);
        dealCategoryMapper.replaceDealCategories(id, List.of());
    }

    @Override
    public DealDO getDeal(Long id) {
        return dealMapper.selectById(id);
    }

    @Override
    public List<DealDO> getDealList() {
        return dealMapper.selectList();
    }

    @Override
    public PageResult<DealDO> getDealPage(DealPageReqVO pageReqVO) {
        return dealMapper.selectPage(pageReqVO);
    }

    @Override
    public Long getSitemapDealCount() {
        return dealMapper.selectCount(new LambdaQueryWrapperX<DealDO>()
                .eq(DealDO::getStatus, CommonStatusEnum.ENABLE.getStatus()));
    }

    @Override
    public PageResult<AppDealSitemapRespVO> getSitemapDealPage(Integer pageNo, Integer pageSize) {
        PageParam pageParam = new PageParam();
        pageParam.setPageNo(pageNo);
        pageParam.setPageSize(pageSize);
        PageResult<DealDO> pageResult = dealMapper.selectSitemapPage(pageParam);
        return new PageResult<>(BeanUtils.toBean(pageResult.getList(), AppDealSitemapRespVO.class),
                pageResult.getTotal());
    }

    @Override
    public void validateDealExists(Long id) {
        if (dealMapper.selectById(id) == null) {
            throw exception(DEAL_NOT_EXISTS);
        }
    }

    @Override
    public DealDO getDealBySlug(String slug) {
        return dealMapper.selectBySlug(slug);
    }

    private void validateSlugUnique(Long id, String slug) {
        DealDO existing = dealMapper.selectBySlug(slug);
        if (existing != null && !existing.getId().equals(id)) {
            throw exception(DEAL_SLUG_DUPLICATE);
        }
    }

    /**
     * 校验联盟网络原始 ID 是否已存在（仅同步场景传入）
     */
    private void validateNetworkExternalIdUnique(Long id, Long networkId, String externalId) {
        if (networkId == null || externalId == null) {
            return;
        }
        DealDO existing = dealMapper.selectByNetworkAndExternalId(networkId, externalId);
        if (existing != null && !existing.getId().equals(id)) {
            throw exception(DEAL_NETWORK_EXTERNAL_DUPLICATE);
        }
    }

    /**
     * 将逗号分隔的 categoryIds 解析为去重的分类 ID 列表
     */
    private List<Long> parseCategoryIds(String categoryIds) {
        if (categoryIds == null || categoryIds.isBlank()) {
            return List.of();
        }
        return Arrays.stream(categoryIds.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty() && NumberUtil.isLong(s))
                .map(Long::valueOf)
                .distinct()
                .toList();
    }

    /**
     * 根据标题生成唯一 slug，冲突时追加数字后缀
     */
    private String generateUniqueSlug(String title) {
        String slug = generateSlug(title);
        if (dealMapper.selectBySlug(slug) == null) {
            return slug;
        }
        for (int suffix = 2; suffix < 100; suffix++) {
            String candidate = slug + "-" + suffix;
            if (dealMapper.selectBySlug(candidate) == null) {
                return candidate;
            }
        }
        return slug + "-" + System.currentTimeMillis();
    }

    /**
     * 将标题转换为 slug（小写字母/数字/连字符，最长 50 字符）
     */
    private String generateSlug(String title) {
        if (title == null || title.isBlank()) {
            return "deal-" + System.currentTimeMillis();
        }
        String slug = title.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
        if (slug.length() > 50) {
            slug = slug.substring(0, 50).replaceAll("-$", "");
        }
        return slug.isEmpty() ? "deal-" + System.currentTimeMillis() : slug;
    }

    @Override
    public int updateExpiredDeals() {
        DealDO updateObj = new DealDO().setStatus(CommonStatusEnum.DISABLE.getStatus());
        return dealMapper.update(updateObj,
                new com.river.framework.mybatis.core.query.LambdaQueryWrapperX<DealDO>()
                        .eq(DealDO::getStatus, CommonStatusEnum.ENABLE.getStatus())
                        .isNotNull(DealDO::getEndTime)
                        .lt(DealDO::getEndTime, LocalDateTime.now())
                        .eq(DealDO::getDeleted, false));
    }

}
