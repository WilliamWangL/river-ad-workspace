package com.river.module.tracking.service;

import cn.hutool.core.io.IoUtil;
import cn.hutool.core.util.StrUtil;
import com.maxmind.geoip2.DatabaseReader;
import com.maxmind.geoip2.model.CountryResponse;
import com.river.framework.common.pojo.PageResult;
import com.river.framework.tenant.core.util.TenantUtils;
import com.river.module.affiliate.dal.dataobject.MerchantDO;
import com.river.module.affiliate.dal.dataobject.OfferDO;
import com.river.module.affiliate.service.MerchantService;
import com.river.module.affiliate.service.OfferService;
import com.river.module.coupon.dal.dataobject.CouponDO;
import com.river.module.coupon.dal.dataobject.DealDO;
import com.river.module.coupon.service.CouponService;
import com.river.module.coupon.service.DealService;
import com.river.module.tracking.controller.admin.click.vo.ClickPageReqVO;
import com.river.module.tracking.dal.dataobject.ClickDO;
import com.river.module.tracking.dal.mysql.ClickMapper;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import java.io.InputStream;
import java.net.InetAddress;
import java.time.LocalDateTime;
import java.util.UUID;

import static com.river.framework.common.exception.util.ServiceExceptionUtil.exception;
import static com.river.module.tracking.enums.ErrorCodeConstants.CLICK_NOT_EXISTS;
import static com.river.module.tracking.enums.ErrorCodeConstants.TRACKING_LINK_NOT_EXISTS;

@Service
@Validated
@Slf4j
public class ClickServiceImpl implements ClickService {

    private static final String FALLBACK_URL = "https://www.google.com";

    @Resource
    private ClickMapper clickMapper;

    @Resource
    private DealService dealService;

    @Resource
    private CouponService couponService;

    @Resource
    private OfferService offerService;

    @Resource
    private MerchantService merchantService;

    /** MaxMind GeoIP2 数据库读取器，启动时加载 */
    private DatabaseReader geoIpReader;

    @PostConstruct
    public void initGeoIp() {
        try (InputStream is = getClass().getClassLoader()
                .getResourceAsStream("data/GeoLite2-Country.mmdb")) {
            if (is == null) {
                log.warn("GeoLite2-Country.mmdb not found in classpath, country resolution disabled");
                return;
            }
            geoIpReader = new DatabaseReader.Builder(is).build();
            log.info("GeoIP2 database loaded successfully");
        } catch (Exception e) {
            log.error("Failed to load GeoIP2 database", e);
        }
    }

    @PreDestroy
    public void destroyGeoIp() {
        IoUtil.close(geoIpReader);
    }

    @Override
    public ClickDO getClick(String clickId) {
        return clickMapper.selectByClickId(clickId);
    }

    @Override
    public PageResult<ClickDO> getClickPage(ClickPageReqVO pageReqVO) {
        return clickMapper.selectPage(pageReqVO);
    }

    @Override
    public String createClick(ClickDO click) {
        clickMapper.insert(click);
        return click.getClickId();
    }

    @Override
    public void validateClickExists(String clickId) {
        if (clickMapper.selectByClickId(clickId) == null) {
            throw exception(CLICK_NOT_EXISTS);
        }
    }

    @Override
    public String recordClickAndGetRedirectUrl(Integer targetType, Long targetId, String sub1, String sub2,
                                               String sub3, String sub4, String sub5,
                                               String ip, String userAgent, String referer) {
        // 1. 忽略租户过滤，查询目标实体获取 gotoUrl
        TargetInfo target = TenantUtils.executeIgnore(() -> resolveTarget(targetType, targetId));
        if (target == null) {
            throw exception(TRACKING_LINK_NOT_EXISTS);
        }

        // 2. 使用实体的租户 ID 执行后续操作（插入 Click 记录）
        return TenantUtils.execute(target.tenantId(), () -> {
            String clickId = generateClickId();

            // 解析商家名称
            String merchantName = resolveMerchantName(target.merchantId());

            // 根据 targetType 填充 dealId / couponId
            Long dealId = targetType != null && targetType == 3 ? targetId : null;
            Long couponId = targetType != null && targetType == 4 ? targetId : null;

            // 解析国家 ISO 代码
            String country = resolveCountry(ip);

            // 构建 ClickDO
            ClickDO click = ClickDO.builder()
                    .clickId(clickId)
                    .targetType(targetType)
                    .targetId(targetId)
                    .merchantId(target.merchantId())
                    .merchantName(merchantName)
                    .dealId(dealId)
                    .couponId(couponId)
                    .gotoUrl(target.gotoUrl())
                    .country(country)
                    .sub1(sub1)
                    .sub2(sub2)
                    .sub3(sub3)
                    .sub4(sub4)
                    .sub5(sub5)
                    .ip(ip)
                    .userAgent(userAgent)
                    .referer(referer)
                    .clickTime(LocalDateTime.now())
                    .build();

            clickMapper.insert(click);
            log.debug("Click recorded: clickId={}, targetType={}, targetId={}, merchantId={}, merchantName={}, country={}, gotoUrl={}, tenantId={}",
                    clickId, targetType, targetId, target.merchantId(), merchantName, country, target.gotoUrl(), target.tenantId());

            // 构建最终跳转 URL
            return buildFinalUrl(target.gotoUrl(), clickId, sub1, sub2, sub3, sub4, sub5);
        });
    }

    /**
     * 解析目标实体，获取 gotoUrl、merchantId、tenantId
     *
     * @param targetType 1=商家, 2=Offer, 3=Deal, 4=优惠券
     * @param targetId   实体 ID
     * @return 目标信息，实体不存在返回 null
     */
    private TargetInfo resolveTarget(Integer targetType, Long targetId) {
        if (targetType == null || targetId == null) {
            return null;
        }
        switch (targetType) {
            case 1: { // Merchant
                MerchantDO merchant = merchantService.getMerchant(targetId);
                if (merchant == null) return null;
                String gotoUrl = merchant.getDomain() != null ? "https://" + merchant.getDomain() : FALLBACK_URL;
                return new TargetInfo(gotoUrl, targetId, merchant.getTenantId());
            }
            case 2: { // Offer
                OfferDO offer = offerService.getOffer(targetId);
                if (offer == null) return null;
                return new TargetInfo(offer.getGotoUrl(), offer.getMerchantId(), offer.getTenantId());
            }
            case 3: { // Deal
                DealDO deal = dealService.getDeal(targetId);
                if (deal == null) return null;
                return new TargetInfo(deal.getGotoUrl(), deal.getMerchantId(), deal.getTenantId());
            }
            case 4: { // Coupon
                CouponDO coupon = couponService.getCoupon(targetId);
                if (coupon == null) return null;
                return new TargetInfo(coupon.getGotoUrl(), coupon.getMerchantId(), coupon.getTenantId());
            }
            default:
                return null;
        }
    }

    /**
     * 解析商家名称
     */
    private String resolveMerchantName(Long merchantId) {
        if (merchantId == null) {
            return null;
        }
        try {
            MerchantDO merchant = TenantUtils.executeIgnore(() -> merchantService.getMerchant(merchantId));
            return merchant != null ? merchant.getName() : null;
        } catch (Exception e) {
            log.warn("Failed to resolve merchant name for merchantId={}: {}", merchantId, e.getMessage());
            return null;
        }
    }

    /**
     * 通过 MaxMind GeoIP2 解析 IP 对应的 ISO 国家代码（如 US、CN、GB）
     */
    private String resolveCountry(String ip) {
        if (StrUtil.isBlank(ip) || geoIpReader == null) {
            return null;
        }
        try {
            InetAddress ipAddress = InetAddress.getByName(ip);
            CountryResponse response = geoIpReader.country(ipAddress);
            if (response != null && response.getCountry() != null) {
                return response.getCountry().getIsoCode();
            }
            return null;
        } catch (Exception e) {
            log.debug("Failed to resolve country for IP {}: {}", ip, e.getMessage());
            return null;
        }
    }

    private String generateClickId() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 26).toUpperCase();
    }

    /**
     * 构建最终跳转 URL
     * 1. 如果 URL 包含占位符，替换它们
     * 2. 如果 URL 不包含占位符，追加参数
     */
    private String buildFinalUrl(String url, String clickId,
                                 String sub1, String sub2, String sub3,
                                 String sub4, String sub5) {
        if (url == null) {
            return FALLBACK_URL;
        }

        boolean hasPlaceholder = url.contains("{click_id}") ||
                                 url.contains("{sub1}") ||
                                 url.contains("{sub2}");

        if (hasPlaceholder) {
            url = url.replace("{click_id}", clickId);
            url = url.replace("{sub1}", StrUtil.nullToEmpty(sub1));
            url = url.replace("{sub2}", StrUtil.nullToEmpty(sub2));
            url = url.replace("{sub3}", StrUtil.nullToEmpty(sub3));
            url = url.replace("{sub4}", StrUtil.nullToEmpty(sub4));
            url = url.replace("{sub5}", StrUtil.nullToEmpty(sub5));
        } else {
            StringBuilder params = new StringBuilder();
            params.append("subid=").append(clickId);
            if (StrUtil.isNotBlank(sub1)) {
                params.append("&subid1=").append(sub1);
            }
            if (StrUtil.isNotBlank(sub2)) {
                params.append("&subid2=").append(sub2);
            }
            if (StrUtil.isNotBlank(sub3)) {
                params.append("&subid3=").append(sub3);
            }
            if (StrUtil.isNotBlank(sub4)) {
                params.append("&subid4=").append(sub4);
            }
            if (StrUtil.isNotBlank(sub5)) {
                params.append("&subid5=").append(sub5);
            }
            url = url + (url.contains("?") ? "&" : "?") + params;
        }

        return url;
    }

    /** 目标实体解析结果 */
    private record TargetInfo(String gotoUrl, Long merchantId, Long tenantId) {}

}
