package com.river.module.coupon.dal.mysql;

import cn.hutool.core.collection.CollUtil;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.river.framework.mybatis.core.mapper.BaseMapperX;
import com.river.module.coupon.dal.dataobject.DealCategoryDO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Update;

import java.util.Collection;
import java.util.List;

@Mapper
public interface DealCategoryMapper extends BaseMapperX<DealCategoryDO> {

    /**
     * 复活已软删的关联（自定义 SQL 不经过 @TableLogic 的 deleted=0 过滤，
     * 以便复用 uk_deal_category 唯一键对应的既有行）
     */
    @Update("UPDATE river_coupon_deal_category SET deleted = 0, update_time = NOW() "
            + "WHERE deal_id = #{dealId} AND category_id = #{categoryId}")
    int reviveDealCategory(@Param("dealId") Long dealId, @Param("categoryId") Long categoryId);

    /**
     * 同步 Deal 的分类关联：软删旧关联后复活/插入新关联
     */
    default void replaceDealCategories(Long dealId, List<Long> categoryIds) {
        if (dealId == null) {
            return;
        }
        // 软删除该 deal 现有关联（MP 内置 update 自动追加 deleted=0 条件）
        update(null, new LambdaUpdateWrapper<DealCategoryDO>()
                .eq(DealCategoryDO::getDealId, dealId)
                .set(DealCategoryDO::getDeleted, true));
        if (CollUtil.isEmpty(categoryIds)) {
            return;
        }
        for (Long categoryId : categoryIds) {
            // 先尝试复活已软删的行，未命中说明是新关联则插入
            if (reviveDealCategory(dealId, categoryId) == 0) {
                DealCategoryDO link = new DealCategoryDO();
                link.setDealId(dealId);
                link.setCategoryId(categoryId);
                insert(link);
            }
        }
    }

    /**
     * 批量查询 deal 关联的分类 ID
     */
    default List<DealCategoryDO> selectListByDealIds(Collection<Long> dealIds) {
        if (CollUtil.isEmpty(dealIds)) {
            return List.of();
        }
        return selectList(DealCategoryDO::getDealId, dealIds);
    }

}
