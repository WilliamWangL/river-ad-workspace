package com.river.module.affiliate.service.region;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.river.module.affiliate.controller.app.region.vo.RegionRespVO;
import com.river.module.affiliate.dal.mysql.MerchantMapper;
import com.river.module.affiliate.dal.dataobject.MerchantDO;
import com.river.module.coupon.dal.mysql.CouponMapper;
import com.river.module.coupon.dal.dataobject.CouponDO;
import com.river.module.coupon.dal.mysql.DealMapper;
import com.river.module.coupon.dal.dataobject.DealDO;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

import static com.river.framework.common.util.region.RegionUtils.GLOBAL_CODE;

/**
 * 地区查询服务实现
 */
@Slf4j
@Service
public class RegionServiceImpl implements RegionService {

    @Resource
    private MerchantMapper merchantMapper;

    @Resource
    private DealMapper dealMapper;

    @Resource
    private CouponMapper couponMapper;

    /** ISO 国家代码到名称的映射 */
    private static final Map<String, String> COUNTRY_NAMES = Map.ofEntries(
        Map.entry("US", "United States"),
        Map.entry("GB", "United Kingdom"),
        Map.entry("DE", "Germany"),
        Map.entry("FR", "France"),
        Map.entry("ES", "Spain"),
        Map.entry("IT", "Italy"),
        Map.entry("NL", "Netherlands"),
        Map.entry("AU", "Australia"),
        Map.entry("CA", "Canada"),
        Map.entry("BR", "Brazil"),
        Map.entry("MX", "Mexico"),
        Map.entry("RU", "Russia"),
        Map.entry("IN", "India"),
        Map.entry("CN", "China"),
        Map.entry("JP", "Japan"),
        Map.entry("KR", "South Korea"),
        Map.entry("PL", "Poland"),
        Map.entry("UA", "Ukraine"),
        Map.entry("BY", "Belarus"),
        Map.entry("KZ", "Kazakhstan"),
        Map.entry(GLOBAL_CODE, "Global")
    );

    @Override
    public List<RegionRespVO> getAvailableRegions() {
        Set<String> regionCodes = new HashSet<>();

        // 收集所有地区代码
        collectRegionsFromMerchant(regionCodes);
        collectRegionsFromDeal(regionCodes);
        collectRegionsFromCoupon(regionCodes);

        // 转换为结果列表
        List<RegionRespVO> result = new ArrayList<>();

        // 添加 GLOBAL 选项到首位
        result.add(new RegionRespVO(GLOBAL_CODE, "Global"));

        // 添加各个国家，按字母顺序排序
        regionCodes.stream()
            .filter(code -> !GLOBAL_CODE.equals(code))
            .sorted()
            .forEach(code -> {
                String name = COUNTRY_NAMES.getOrDefault(code, code);
                result.add(new RegionRespVO(code, name));
            });

        return result;
    }

    /**
     * 收集商家地区代码
     */
    private void collectRegionsFromMerchant(Set<String> regionCodes) {
        try {
            List<MerchantDO> list = merchantMapper.selectList(selectDistinctRegions());
            for (MerchantDO merchant : list) {
                if (merchant != null && merchant.getRegions() != null) {
                    regionCodes.addAll(merchant.getRegions());
                }
            }
        } catch (Exception e) {
            log.warn("Failed to collect regions from merchant table", e);
        }
    }

    /**
     * 收集 Deal 地区代码
     */
    private void collectRegionsFromDeal(Set<String> regionCodes) {
        try {
            List<DealDO> list = dealMapper.selectList(selectDistinctRegions());
            for (DealDO deal : list) {
                if (deal != null && deal.getRegions() != null) {
                    regionCodes.addAll(deal.getRegions());
                }
            }
        } catch (Exception e) {
            log.warn("Failed to collect regions from deal table", e);
        }
    }

    /**
     * 收集 Coupon 地区代码
     */
    private void collectRegionsFromCoupon(Set<String> regionCodes) {
        try {
            List<CouponDO> list = couponMapper.selectList(selectDistinctRegions());
            for (CouponDO coupon : list) {
                if (coupon != null && coupon.getRegions() != null) {
                    regionCodes.addAll(coupon.getRegions());
                }
            }
        } catch (Exception e) {
            log.warn("Failed to collect regions from coupon table", e);
        }
    }

    /**
     * 构建 DB 端去重的 regions 查询，避免大表全字段全量加载导致 OOM
     */
    private <T> QueryWrapper<T> selectDistinctRegions() {
        QueryWrapper<T> wrapper = new QueryWrapper<>();
        wrapper.select("DISTINCT regions");
        return wrapper;
    }
}
