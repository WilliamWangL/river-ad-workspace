package com.river.module.affiliate.service;

import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.util.StrUtil;
import com.river.module.affiliate.controller.admin.category.vo.CategoryListReqVO;
import com.river.module.affiliate.dal.dataobject.CategoryDO;
import com.river.module.affiliate.dal.mysql.CategoryMapper;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import static com.river.framework.common.exception.util.ServiceExceptionUtil.exception;
import static com.river.module.affiliate.enums.ErrorCodeConstants.*;

@Service
@Validated
public class CategoryServiceImpl implements CategoryService {

    @Resource
    private CategoryMapper categoryMapper;

    @Override
    public Long createCategory(CategoryDO category) {
        validateParentCategory(category.getParentId());
        // 设置默认 region
        if (StrUtil.isBlank(category.getRegion())) {
            category.setRegion(DEFAULT_REGION);
        }
        validateCategorySlugUnique(null, category.getSlug(), category.getRegion());
        categoryMapper.insert(category);
        return category.getId();
    }

    @Override
    public void updateCategory(CategoryDO category) {
        validateCategoryExists(category.getId());
        validateParentCategory(category.getParentId());
        if (StrUtil.isBlank(category.getRegion())) {
            category.setRegion(DEFAULT_REGION);
        }
        validateCategorySlugUnique(category.getId(), category.getSlug(), category.getRegion());
        categoryMapper.updateById(category);
    }

    @Override
    public void deleteCategory(Long id) {
        validateCategoryExists(id);
        if (CollUtil.isNotEmpty(getCategoryListByParentId(id))) {
            throw exception(CATEGORY_EXISTS_CHILDREN);
        }
        categoryMapper.deleteById(id);
    }

    @Override
    public CategoryDO getCategory(Long id) {
        return categoryMapper.selectById(id);
    }

    @Override
    public List<CategoryDO> getCategoryList() {
        return categoryMapper.selectList();
    }

    @Override
    public List<CategoryDO> getCategoryList(CategoryListReqVO listReqVO) {
        return categoryMapper.selectList(listReqVO);
    }

    @Override
    public List<CategoryDO> getCategoryListByParentId(Long parentId) {
        return categoryMapper.selectList(CategoryDO::getParentId, parentId);
    }

    @Override
    public List<CategoryDO> getCategoryListByParentId(Long parentId, String region) {
        String effectiveRegion = resolveRegion(region);
        return categoryMapper.selectListByParentIdAndRegion(parentId, effectiveRegion);
    }

    @Override
    public void validateCategoryExists(Long id) {
        if (categoryMapper.selectById(id) == null) {
            throw exception(CATEGORY_NOT_EXISTS);
        }
    }

    private void validateParentCategory(Long parentId) {
        if (parentId == null || Objects.equals(parentId, 0L)) {
            return;
        }
        if (categoryMapper.selectById(parentId) == null) {
            throw exception(CATEGORY_PARENT_NOT_EXISTS);
        }
    }

    private void validateCategorySlugUnique(Long id, String slug, String region) {
        if (StrUtil.isBlank(slug)) {
            return;
        }
        CategoryDO category = categoryMapper.selectBySlugAndRegion(slug, region);
        if (category == null) {
            return;
        }
        if (id == null || !category.getId().equals(id)) {
            throw exception(CATEGORY_SLUG_DUPLICATE);
        }
    }

    @Override
    public List<CategoryDO> getCategoryTree() {
        return categoryMapper.selectList();
    }

    @Override
    public List<CategoryDO> getCategoryTree(String region) {
        String effectiveRegion = resolveRegion(region);
        return categoryMapper.selectListByRegion(effectiveRegion);
    }

    @Override
    public CategoryDO getCategoryBySlug(String slug) {
        return categoryMapper.selectOne(CategoryDO::getSlug, slug);
    }

    @Override
    public CategoryDO getCategoryBySlug(String slug, String region) {
        if (StrUtil.isBlank(slug)) {
            return null;
        }
        String effectiveRegion = resolveRegion(region);
        // 先查目标地区
        CategoryDO category = categoryMapper.selectBySlugAndRegion(slug, effectiveRegion);
        // 找不到则回退默认地区
        if (category == null && !DEFAULT_REGION.equals(effectiveRegion)) {
            category = categoryMapper.selectBySlugAndRegion(slug, DEFAULT_REGION);
        }
        // 仍找不到则跨地区兜底，避免其他地区分类链接被判定 404
        if (category == null) {
            category = categoryMapper.selectFirstBySlug(slug);
        }
        return category;
    }

    @Override
    public List<CategoryDO> getCategoryAncestors(Long categoryId) {
        List<CategoryDO> ancestors = new ArrayList<>();
        CategoryDO current = categoryMapper.selectById(categoryId);
        while (current != null && !Objects.equals(current.getParentId(), 0L)) {
            current = categoryMapper.selectById(current.getParentId());
            if (current != null) {
                ancestors.add(0, current);
            }
        }
        return ancestors;
    }

    @Override
    public List<String> getAvailableRegions() {
        return categoryMapper.selectDistinctRegions().stream()
                .map(CategoryDO::getRegion)
                .filter(StrUtil::isNotBlank)
                .distinct()
                .collect(Collectors.toList());
    }

    /**
     * 解析地区代码：为空则返回默认地区，
     * 如果指定地区没有分类数据，回退到默认地区
     */
    private String resolveRegion(String region) {
        if (StrUtil.isBlank(region)) {
            return DEFAULT_REGION;
        }
        // 如果指定地区有数据，使用指定地区
        Long count = categoryMapper.selectCountByRegion(region);
        if (count != null && count > 0) {
            return region;
        }
        // 否则回退默认地区
        return DEFAULT_REGION;
    }

}
