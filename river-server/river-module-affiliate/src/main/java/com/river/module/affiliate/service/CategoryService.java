package com.river.module.affiliate.service;

import com.river.module.affiliate.controller.admin.category.vo.CategoryListReqVO;
import com.river.module.affiliate.dal.dataobject.CategoryDO;
import jakarta.validation.Valid;

import java.util.List;

/**
 * 分类 Service 接口
 */
public interface CategoryService {

    /** 默认地区代码 */
    String DEFAULT_REGION = "00";

    /**
     * 创建分类
     *
     * @param category 分类
     * @return 编号
     */
    Long createCategory(@Valid CategoryDO category);

    /**
     * 更新分类
     *
     * @param category 分类
     */
    void updateCategory(@Valid CategoryDO category);

    /**
     * 删除分类
     *
     * @param id 编号
     */
    void deleteCategory(Long id);

    /**
     * 获得分类
     *
     * @param id 编号
     * @return 分类
     */
    CategoryDO getCategory(Long id);

    /**
     * 获得分类列表
     *
     * @return 分类列表
     */
    List<CategoryDO> getCategoryList();

    /**
     * 获得分类列表
     *
     * @param listReqVO 列表查询
     * @return 分类列表
     */
    List<CategoryDO> getCategoryList(CategoryListReqVO listReqVO);

    /**
     * 获得子分类列表
     *
     * @param parentId 父分类编号
     * @return 子分类列表
     */
    List<CategoryDO> getCategoryListByParentId(Long parentId);

    /**
     * 获得子分类列表（按地区过滤）
     *
     * @param parentId 父分类编号
     * @param region   地区代码，为空或找不到时回退默认地区
     * @return 子分类列表
     */
    List<CategoryDO> getCategoryListByParentId(Long parentId, String region);

    /**
     * 校验分类是否存在
     *
     * @param id 编号
     */
    void validateCategoryExists(Long id);

    /**
     * 获取分类树
     *
     * @return 分类树列表
     */
    List<CategoryDO> getCategoryTree();

    /**
     * 获取分类树（按地区过滤，找不到则回退默认地区）
     *
     * @param region 地区代码
     * @return 分类树列表
     */
    List<CategoryDO> getCategoryTree(String region);

    /**
     * 根据 slug 获取分类
     *
     * @param slug 分类标识
     * @return 分类
     */
    CategoryDO getCategoryBySlug(String slug);

    /**
     * 根据 slug 获取分类（按地区，找不到则回退默认地区）
     *
     * @param slug   分类标识
     * @param region 地区代码
     * @return 分类
     */
    CategoryDO getCategoryBySlug(String slug, String region);

    /**
     * 获取分类的祖先链路（面包屑）
     *
     * @param categoryId 分类编号
     * @return 祖先分类列表（从根到当前）
     */
    List<CategoryDO> getCategoryAncestors(Long categoryId);

    /**
     * 获取所有可用的地区列表
     *
     * @return 地区代码列表
     */
    List<String> getAvailableRegions();

}
