package com.river.module.affiliate.controller.admin.network;

import com.river.framework.common.pojo.CommonResult;
import com.river.framework.common.pojo.PageResult;
import com.river.module.affiliate.controller.admin.network.vo.AffiliateNetworkPageReqVO;
import com.river.module.affiliate.controller.admin.network.vo.AffiliateNetworkRespVO;
import com.river.module.affiliate.controller.admin.network.vo.AffiliateNetworkSaveReqVO;
import com.river.module.affiliate.dal.dataobject.AffiliateNetworkDO;
import com.river.framework.common.util.object.BeanUtils;
import com.river.module.affiliate.dal.dataobject.NetworkCredentialDO;
import com.river.module.affiliate.dal.mysql.NetworkCredentialMapper;
import com.river.module.affiliate.service.AffiliateNetworkService;
import com.river.module.affiliate.service.network.admitad.AdmitadSyncService;
import com.river.module.affiliate.service.network.rakuten.RakutenSyncService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.river.framework.common.pojo.CommonResult.success;
import cn.hutool.core.util.StrUtil;

@Tag(name = "管理后台 - 联盟网络")
@RestController
@RequestMapping("/affiliate/network")
@Validated
@Slf4j
public class AffiliateNetworkController {

    @Resource
    private AffiliateNetworkService networkService;

    @Resource
    private AdmitadSyncService admitadSyncService;

    @Resource
    private RakutenSyncService rakutenSyncService;

    @Resource
    private NetworkCredentialMapper credentialMapper;

    @PostMapping("/create")
    @Operation(summary = "创建联盟网络")
    @PreAuthorize("@ss.hasPermission('affiliate:network:create')")
    public CommonResult<Long> createNetwork(@Valid @RequestBody AffiliateNetworkSaveReqVO createReqVO) {
        return success(networkService.createNetwork(BeanUtils.toBean(createReqVO, AffiliateNetworkDO.class)));
    }

    @PutMapping("/update")
    @Operation(summary = "更新联盟网络")
    @PreAuthorize("@ss.hasPermission('affiliate:network:update')")
    public CommonResult<Boolean> updateNetwork(@Valid @RequestBody AffiliateNetworkSaveReqVO updateReqVO) {
        networkService.updateNetwork(BeanUtils.toBean(updateReqVO, AffiliateNetworkDO.class));
        return success(true);
    }

    @DeleteMapping("/delete")
    @Operation(summary = "删除联盟网络")
    @Parameter(name = "id", description = "编号", required = true)
    @PreAuthorize("@ss.hasPermission('affiliate:network:delete')")
    public CommonResult<Boolean> deleteNetwork(@RequestParam("id") Long id) {
        networkService.deleteNetwork(id);
        return success(true);
    }

    @GetMapping("/get")
    @Operation(summary = "获取联盟网络")
    @Parameter(name = "id", description = "编号", required = true, example = "1024")
    @PreAuthorize("@ss.hasPermission('affiliate:network:query')")
    public CommonResult<AffiliateNetworkRespVO> getNetwork(@RequestParam("id") Long id) {
        AffiliateNetworkDO network = networkService.getNetwork(id);
        return success(BeanUtils.toBean(network, AffiliateNetworkRespVO.class));
    }

    @GetMapping("/list")
    @Operation(summary = "获取联盟网络列表")
    @PreAuthorize("@ss.hasPermission('affiliate:network:query')")
    public CommonResult<List<AffiliateNetworkRespVO>> getNetworkList() {
        List<AffiliateNetworkDO> list = networkService.getNetworkList();
        return success(BeanUtils.toBean(list, AffiliateNetworkRespVO.class));
    }

    @GetMapping("/page")
    @Operation(summary = "获取联盟网络分页")
    @PreAuthorize("@ss.hasPermission('affiliate:network:query')")
    public CommonResult<PageResult<AffiliateNetworkRespVO>> getNetworkPage(@Valid AffiliateNetworkPageReqVO pageReqVO) {
        PageResult<AffiliateNetworkDO> pageResult = networkService.getNetworkPage(pageReqVO);
        return success(BeanUtils.toBean(pageResult, AffiliateNetworkRespVO.class));
    }

    @PostMapping("/sync-data")
    @Operation(summary = "同步商家和Offer数据")
    @Parameter(name = "networkId", description = "联盟网络ID", required = false)
    @Parameter(name = "code", description = "联盟编码", required = false)
    @PreAuthorize("@ss.hasPermission('affiliate:network:sync')")
    public CommonResult<SyncResult> syncData(
            @RequestParam(required = false) String networkId,
            @RequestParam(required = false) String code) {
        log.info("[syncData] Request received - networkId: {}, code: {}", networkId, code);

        // 参数校验：至少一个不为空
        if (StrUtil.isAllEmpty(networkId, code)) {
            return success(SyncResult.error("At least one of networkId or code is required"));
        }

        String finalCode = code;

        // networkId 优先：解析出 code
        if (StrUtil.isNotEmpty(networkId)) {
            try {
                Long id = Long.parseLong(networkId);
                AffiliateNetworkDO network = networkService.getNetwork(id);
                if (network == null) {
                    log.warn("[syncData] Network not found - networkId: {}", networkId);
                    return success(SyncResult.error("Network not found: " + networkId));
                }
                finalCode = network.getCode();
            } catch (NumberFormatException e) {
                log.warn("[syncData] Invalid networkId format: {}", networkId);
                return success(SyncResult.error("Invalid networkId format"));
            }
        }

        // 调用同步逻辑（Merchant + Offer），根据 code 路由到对应的 SyncService
        SyncResult result = dispatchSyncData(finalCode);
        return success(result);
    }

    @PostMapping("/sync-coupons")
    @Operation(summary = "同步优惠券和Deal数据")
    @Parameter(name = "networkId", description = "联盟网络ID", required = false)
    @Parameter(name = "code", description = "联盟编码", required = false)
    @PreAuthorize("@ss.hasPermission('affiliate:network:sync')")
    public CommonResult<SyncResult> syncCoupons(
            @RequestParam(required = false) String networkId,
            @RequestParam(required = false) String code) {
        log.info("[syncCoupons] Request received - networkId: {}, code: {}", networkId, code);

        // 参数校验：至少一个不为空
        if (StrUtil.isAllEmpty(networkId, code)) {
            return success(SyncResult.error("At least one of networkId or code is required"));
        }

        String finalCode = code;

        // networkId 优先：解析出 code
        if (StrUtil.isNotEmpty(networkId)) {
            try {
                Long id = Long.parseLong(networkId);
                AffiliateNetworkDO network = networkService.getNetwork(id);
                if (network == null) {
                    log.warn("[syncCoupons] Network not found - networkId: {}", networkId);
                    return success(SyncResult.error("Network not found: " + networkId));
                }
                finalCode = network.getCode();
            } catch (NumberFormatException e) {
                log.warn("[syncCoupons] Invalid networkId format: {}", networkId);
                return success(SyncResult.error("Invalid networkId format"));
            }
        }

        // 调用同步逻辑（Coupon + Deal），根据 code 路由
        SyncResult result = dispatchSyncCoupons(finalCode);
        return success(result);
    }

    @PostMapping("/sync-deals")
    @Operation(summary = "同步Deal数据")
    @Parameter(name = "networkId", description = "联盟网络ID", required = false)
    @Parameter(name = "code", description = "联盟编码", required = false)
    @PreAuthorize("@ss.hasPermission('affiliate:network:sync')")
    public CommonResult<SyncResult> syncDeals(
            @RequestParam(required = false) String networkId,
            @RequestParam(required = false) String code) {
        log.info("[syncDeals] Request received - networkId: {}, code: {}", networkId, code);

        // 参数校验：至少一个不为空
        if (StrUtil.isAllEmpty(networkId, code)) {
            return success(SyncResult.error("At least one of networkId or code is required"));
        }

        String finalCode = code;

        // networkId 优先：解析出 code
        if (StrUtil.isNotEmpty(networkId)) {
            try {
                Long id = Long.parseLong(networkId);
                AffiliateNetworkDO network = networkService.getNetwork(id);
                if (network == null) {
                    log.warn("[syncDeals] Network not found - networkId: {}", networkId);
                    return success(SyncResult.error("Network not found: " + networkId));
                }
                finalCode = network.getCode();
            } catch (NumberFormatException e) {
                log.warn("[syncDeals] Invalid networkId format: {}", networkId);
                return success(SyncResult.error("Invalid networkId format"));
            }
        }

        // 调用同步逻辑（Deal only），根据 code 路由
        SyncResult result = dispatchSyncCoupons(finalCode);
        return success(result);
    }

    @PostMapping("/sync-coupons-only")
    @Operation(summary = "同步优惠券数据")
    @Parameter(name = "networkId", description = "联盟网络ID", required = false)
    @Parameter(name = "code", description = "联盟编码", required = false)
    @PreAuthorize("@ss.hasPermission('affiliate:network:sync')")
    public CommonResult<SyncResult> syncCouponsOnly(
            @RequestParam(required = false) String networkId,
            @RequestParam(required = false) String code) {
        log.info("[syncCouponsOnly] Request received - networkId: {}, code: {}", networkId, code);

        // 参数校验：至少一个不为空
        if (StrUtil.isAllEmpty(networkId, code)) {
            return success(SyncResult.error("At least one of networkId or code is required"));
        }

        String finalCode = code;

        // networkId 优先：解析出 code
        if (StrUtil.isNotEmpty(networkId)) {
            try {
                Long id = Long.parseLong(networkId);
                AffiliateNetworkDO network = networkService.getNetwork(id);
                if (network == null) {
                    log.warn("[syncCouponsOnly] Network not found - networkId: {}", networkId);
                    return success(SyncResult.error("Network not found: " + networkId));
                }
                finalCode = network.getCode();
            } catch (NumberFormatException e) {
                log.warn("[syncCouponsOnly] Invalid networkId format: {}", networkId);
                return success(SyncResult.error("Invalid networkId format"));
            }
        }

        // 调用同步逻辑（Coupon only），根据 code 路由
        SyncResult result = dispatchSyncCoupons(finalCode);
        return success(result);
    }

    // ==================== 内部路由方法 ====================

    /**
     * 根据网络 code 路由到对应的 SyncService
     */
    private SyncResult dispatchSyncData(String networkCode) {
        if ("rakuten".equalsIgnoreCase(networkCode)) {
            return rakutenSyncService.syncData(networkCode);
        }
        // 默认使用 Admitad
        return admitadSyncService.syncData(networkCode);
    }

    /**
     * 根据网络 code 路由到对应的 Coupon/Deal SyncService
     * 注：Rakuten 暂无 Coupon API，Coupon/Deal 同步仅走 Admitad
     */
    private SyncResult dispatchSyncCoupons(String networkCode) {
        // Rakuten 无 Coupon/Deal API，统一走 Admitad
        return admitadSyncService.syncCouponsOnly(networkCode);
    }

    /**
     * 统一同步结果响应 DTO
     */
    public static class SyncResult {
        private boolean success;
        private String message;
        private Map<String, Object> data;

        public static SyncResult success(String message, Map<String, Object> data) {
            SyncResult result = new SyncResult();
            result.success = true;
            result.message = message;
            result.data = data;
            return result;
        }

        public static SyncResult error(String message) {
            SyncResult result = new SyncResult();
            result.success = false;
            result.message = message;
            result.data = null;
            return result;
        }

        public boolean isSuccess() {
            return success;
        }

        public String getMessage() {
            return message;
        }

        public Map<String, Object> getData() {
            return data;
        }
    }
}
