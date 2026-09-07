package com.river.module.mediabuy.service;

import com.river.framework.common.util.json.JsonUtils;
import com.river.framework.tenant.core.aop.TenantIgnore;
import com.river.framework.ip.core.Area;
import com.river.framework.ip.core.enums.AreaTypeEnum;
import com.river.framework.ip.core.utils.AreaUtils;
import com.river.framework.ip.core.utils.IPUtils;
import com.river.module.affiliate.dal.dataobject.AffiliateNetworkDO;
import com.river.module.affiliate.dal.dataobject.MerchantDO;
import com.river.module.affiliate.dal.dataobject.OfferDO;
import com.river.module.affiliate.service.AffiliateNetworkService;
import com.river.module.affiliate.service.MerchantService;
import com.river.module.mediabuy.dal.dataobject.MediabuyClickLogDO;
import com.river.module.mediabuy.dal.mysql.MediabuyClickLogMapper;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Service
@Validated
public class MediabuyClickLogServiceImpl implements MediabuyClickLogService {

    /**
     * 独立文件：mediabuy 点击行日志（JSON 一行一条），由 logback 单独 appender 输出。
     */
    private static final Logger CLICK_FILE_LOG = LoggerFactory.getLogger("com.river.module.mediabuy.click");

    @Resource
    private MediabuyClickLogMapper clickLogMapper;

    @Resource
    private AffiliateNetworkService affiliateNetworkService;

    @Resource
    private MerchantService merchantService;

    @Override
    @TenantIgnore // public click log: tenantId comes from offer itself
    public String recordClick(OfferDO offer, String publisherClickId, String subid1, String subid2, HttpServletRequest request) {
        // publisherClickId：外部传入；clickId：系统生成，用于归因
        String clickId = generateClickId();
        String trackLink = replaceMacros(offer.getGotoUrl(), clickId, subid1, subid2);
        AffiliateNetworkDO network = offer.getNetworkId() != null ? affiliateNetworkService.getNetwork(offer.getNetworkId()) : null;
        MerchantDO merchant = offer.getMerchantId() != null ? merchantService.getMerchant(offer.getMerchantId()) : null;
        String ip = getClientIp(request);

        MediabuyClickLogDO log = MediabuyClickLogDO.builder()
                .offerId(offer.getId())
                .offerName(offer.getName())
                .merchantId(offer.getMerchantId())
                .merchantName(merchant != null ? merchant.getName() : null)
                .trackLink(trackLink)
                .networkCode(network != null ? network.getCode() : null)
                .osType(detectOsType(request.getHeader("User-Agent")))
                .publisherClickId(publisherClickId)
                .clickId(clickId)
                .subid1(subid1)
                .subid2(subid2)
                .country(parseCountryByIp(ip))
                .ip(ip)
                .userAgent(request.getHeader("User-Agent"))
                .referer(request.getHeader("Referer"))
                .queryString(request.getQueryString())
                .build();
        log.setTenantId(offer.getTenantId());
        clickLogMapper.insert(log);

        CLICK_FILE_LOG.info(JsonUtils.toJsonString(buildClickFilePayload(log)));
        return trackLink;
    }

    private Map<String, Object> buildClickFilePayload(MediabuyClickLogDO log) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", log.getId());
        m.put("tenantId", log.getTenantId());
        m.put("offerId", log.getOfferId());
        m.put("offerName", log.getOfferName());
        m.put("merchantId", log.getMerchantId());
        m.put("merchantName", log.getMerchantName());
        m.put("clickId", log.getClickId());
        m.put("publisherClickId", log.getPublisherClickId());
        m.put("subid1", log.getSubid1());
        m.put("subid2", log.getSubid2());
        m.put("ip", log.getIp());
        m.put("country", log.getCountry());
        m.put("osType", log.getOsType());
        m.put("networkCode", log.getNetworkCode());
        m.put("referer", log.getReferer());
        m.put("userAgent", log.getUserAgent());
        m.put("queryString", log.getQueryString());
        m.put("trackLink", log.getTrackLink());
        m.put("createTime", log.getCreateTime());
        return m;
    }

    private String generateClickId() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 26).toUpperCase();
    }

    private String parseCountryByIp(String ip) {
        if (ip == null || ip.isBlank()) {
            return null;
        }
        try {
            Area area = IPUtils.getArea(ip);
            if (area == null || area.getId() == null) {
                return null;
            }
            Integer countryId = AreaUtils.getParentIdByType(area.getId(), AreaTypeEnum.COUNTRY);
            if (countryId == null) { // 有些 IP 直接返回国家节点
                countryId = area.getType() != null && area.getType().equals(AreaTypeEnum.COUNTRY.getType()) ? area.getId() : null;
            }
            Area country = countryId != null ? AreaUtils.getArea(countryId) : null;
            return country != null ? country.getName() : null;
        } catch (Exception e) {
            return null;
        }
    }

    private String replaceMacros(String url, String clickId, String subid1, String subid2) {
        if (url == null || url.isBlank()) {
            return url;
        }
        String replaced = url
                .replace("{click_id}", safe(clickId))
                .replace("{subid1}", safe(subid1))
                .replace("{subid2}", safe(subid2))
                .replace("${click_id}", safe(clickId))
                .replace("${subid1}", safe(subid1))
                .replace("${subid2}", safe(subid2));
        // 如果原 URL 不含任何宏替换符（替换前后完全一致），则自动把 clickId 作为
        // subid 查询参数追加到 URL，确保归因仍可由 clickId 串联回我们系统。
        if (replaced.equals(url) && clickId != null && !clickId.isBlank()) {
            String separator = url.contains("?") ? "&" : "?";
            replaced = url + separator + "subid=" + clickId;
        }
        return replaced;
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }

    private String detectOsType(String userAgent) {
        if (userAgent == null) {
            return "PC";
        }
        String ua = userAgent.toLowerCase();
        if (ua.contains("android")) {
            return "ANDROID";
        }
        if (ua.contains("iphone") || ua.contains("ipad") || ua.contains("ios")) {
            return "IOS";
        }
        return "PC";
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }

}

