package com.river.module.affiliate.controller.admin.category;

import com.river.framework.common.pojo.CommonResult;
import com.river.module.affiliate.controller.admin.category.vo.CategoryListReqVO;
import com.river.module.affiliate.controller.admin.category.vo.CategoryRespVO;
import com.river.module.affiliate.controller.admin.category.vo.CategorySaveReqVO;
import com.river.module.affiliate.dal.dataobject.CategoryDO;
import com.river.framework.common.util.object.BeanUtils;
import com.river.module.affiliate.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.river.framework.common.pojo.CommonResult.success;

@Tag(name = "管理后台 - 分类")
@RestController
@RequestMapping("/affiliate/category")
@Validated
public class CategoryController {

    @Resource
    private CategoryService categoryService;

    @PostMapping("/create")
    @Operation(summary = "创建分类")
    @PreAuthorize("@ss.hasPermission('affiliate:category:create')")
    public CommonResult<Long> createCategory(@Valid @RequestBody CategorySaveReqVO createReqVO) {
        return success(categoryService.createCategory(BeanUtils.toBean(createReqVO, CategoryDO.class)));
    }

    @PutMapping("/update")
    @Operation(summary = "更新分类")
    @PreAuthorize("@ss.hasPermission('affiliate:category:update')")
    public CommonResult<Boolean> updateCategory(@Valid @RequestBody CategorySaveReqVO updateReqVO) {
        categoryService.updateCategory(BeanUtils.toBean(updateReqVO, CategoryDO.class));
        return success(true);
    }

    @DeleteMapping("/delete")
    @Operation(summary = "删除分类")
    @Parameter(name = "id", description = "编号", required = true)
    @PreAuthorize("@ss.hasPermission('affiliate:category:delete')")
    public CommonResult<Boolean> deleteCategory(@RequestParam("id") Long id) {
        categoryService.deleteCategory(id);
        return success(true);
    }

    @GetMapping("/get")
    @Operation(summary = "获取分类")
    @Parameter(name = "id", description = "编号", required = true, example = "1024")
    @PreAuthorize("@ss.hasPermission('affiliate:category:query')")
    public CommonResult<CategoryRespVO> getCategory(@RequestParam("id") Long id) {
        CategoryDO category = categoryService.getCategory(id);
        return success(BeanUtils.toBean(category, CategoryRespVO.class));
    }

    @GetMapping("/list")
    @Operation(summary = "获取分类列表")
    @PreAuthorize("@ss.hasPermission('affiliate:category:query')")
    public CommonResult<List<CategoryRespVO>> getCategoryList(@Valid CategoryListReqVO listReqVO) {
        List<CategoryDO> list = categoryService.getCategoryList(listReqVO);
        return success(BeanUtils.toBean(list, CategoryRespVO.class));
    }

    @GetMapping("/regions")
    @Operation(summary = "获取可用的地区列表")
    @PreAuthorize("@ss.hasPermission('affiliate:category:query')")
    public CommonResult<List<String>> getAvailableRegions() {
        return success(categoryService.getAvailableRegions());
    }
}
