package com.river.module.affiliate.dal.mysql;

import com.river.framework.mybatis.core.mapper.BaseMapperX;
import com.river.framework.mybatis.core.query.LambdaQueryWrapperX;
import com.river.module.affiliate.controller.admin.category.vo.CategoryListReqVO;
import com.river.module.affiliate.dal.dataobject.CategoryDO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface CategoryMapper extends BaseMapperX<CategoryDO> {

    default List<CategoryDO> selectList(CategoryListReqVO reqVO) {
        return selectList(new LambdaQueryWrapperX<CategoryDO>()
                .likeIfPresent(CategoryDO::getName, reqVO.getName())
                .eqIfPresent(CategoryDO::getStatus, reqVO.getStatus())
                .eqIfPresent(CategoryDO::getParentId, reqVO.getParentId())
                .eqIfPresent(CategoryDO::getRegion, reqVO.getRegion())
                .orderByAsc(CategoryDO::getSort)
                .orderByAsc(CategoryDO::getId));
    }

    /**
     * 根据地区查询分类列表
     */
    default List<CategoryDO> selectListByRegion(String region) {
        return selectList(new LambdaQueryWrapperX<CategoryDO>()
                .eq(CategoryDO::getRegion, region)
                .orderByAsc(CategoryDO::getSort)
                .orderByAsc(CategoryDO::getId));
    }

    /**
     * 根据父分类和地区查询子分类
     */
    default List<CategoryDO> selectListByParentIdAndRegion(Long parentId, String region) {
        return selectList(new LambdaQueryWrapperX<CategoryDO>()
                .eq(CategoryDO::getParentId, parentId)
                .eq(CategoryDO::getRegion, region)
                .orderByAsc(CategoryDO::getSort)
                .orderByAsc(CategoryDO::getId));
    }

    /**
     * 根据 slug 和地区查询分类
     */
    default CategoryDO selectBySlugAndRegion(String slug, String region) {
        return selectOne(new LambdaQueryWrapperX<CategoryDO>()
                .eq(CategoryDO::getSlug, slug)
                .eq(CategoryDO::getRegion, region));
    }

    /**
     * 仅根据 slug 跨地区查询分类（slug+region 为复合唯一，取第一条）
     */
    default CategoryDO selectFirstBySlug(String slug) {
        List<CategoryDO> list = selectList(new LambdaQueryWrapperX<CategoryDO>()
                .eq(CategoryDO::getSlug, slug)
                .orderByAsc(CategoryDO::getId)
                .last("LIMIT 1"));
        return list.isEmpty() ? null : list.get(0);
    }

    /**
     * 查询某地区下分类数量
     */
    default Long selectCountByRegion(String region) {
        return selectCount(new LambdaQueryWrapperX<CategoryDO>()
                .eq(CategoryDO::getRegion, region));
    }

    /**
     * 查询所有不同的地区列表
     */
    default List<CategoryDO> selectDistinctRegions() {
        return selectList(new LambdaQueryWrapperX<CategoryDO>()
                .select(CategoryDO::getRegion)
                .groupBy(CategoryDO::getRegion));
    }

}
