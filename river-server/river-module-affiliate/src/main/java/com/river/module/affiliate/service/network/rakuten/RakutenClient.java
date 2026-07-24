package com.river.module.affiliate.service.network.rakuten;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.river.module.affiliate.dal.dataobject.NetworkCredentialDO;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.Map;

/**
 * Rakuten Advertising API 客户端
 * 
 * 认证方式: Bearer Token (API Key)，从 publisher dashboard 获取
 * Base URL: https://api.rakutenadvertising.com
 * 
 * 凭证 JSON 格式:
 * {
 *   "apiKey": "your-api-key",
 *   "publisherId": "your-publisher-id"  // 可选
 * }
 */
@Slf4j
@Component
public class RakutenClient {

    private static final String BASE_URL = "https://api.rakutenadvertising.com";
    private static final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * 获取广告商列表
     * API: GET /v2/advertisers
     *
     * @param credential 凭证
     * @param page       页码
     * @param perPage    每页数量
     * @param keyword    关键词（可选）
     * @param country    国家代码（可选）
     * @return 广告商列表
     */
    public AdvertiserResponse getAdvertisers(NetworkCredentialDO credential, int page, int perPage,
                                              String keyword, String country) {
        String token = getApiKey(credential);

        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(BASE_URL + "/v2/advertisers")
                .queryParam("page", page)
                .queryParam("per_page", perPage);

        if (keyword != null && !keyword.isBlank()) {
            builder.queryParam("keyword", keyword);
        }
        if (country != null && !country.isBlank()) {
            builder.queryParam("country", country);
        }

        HttpHeaders headers = buildAuthHeaders(token);

        try {
            ResponseEntity<AdvertiserResponse> response = restTemplate.exchange(
                    builder.toUriString(), HttpMethod.GET, new HttpEntity<>(headers), AdvertiserResponse.class);

            if (response.getBody() != null) {
                log.info("Fetched {} advertisers from Rakuten (page={})", 
                        response.getBody().getData() != null ? response.getBody().getData().size() : 0, page);
                return response.getBody();
            }
        } catch (Exception e) {
            log.error("Failed to fetch advertisers from Rakuten: {}", e.getMessage());
        }

        return new AdvertiserResponse();
    }

    /**
     * 获取已合作的广告商列表（Partnerships API）
     * API: GET /v1/partnerships
     *
     * @param credential 凭证
     * @param page       页码
     * @param perPage    每页数量
     * @return 合作伙伴列表
     */
    public PartnershipResponse getPartnerships(NetworkCredentialDO credential, int page, int perPage) {
        String token = getApiKey(credential);

        String url = String.format("%s/v1/partnerships?page=%d&per_page=%d", BASE_URL, page, perPage);

        HttpHeaders headers = buildAuthHeaders(token);

        try {
            ResponseEntity<PartnershipResponse> response = restTemplate.exchange(
                    url, HttpMethod.GET, new HttpEntity<>(headers), PartnershipResponse.class);

            if (response.getBody() != null) {
                log.info("Fetched {} partnerships from Rakuten (page={})",
                        response.getBody().getData() != null ? response.getBody().getData().size() : 0, page);
                return response.getBody();
            }
        } catch (Exception e) {
            log.error("Failed to fetch partnerships from Rakuten: {}", e.getMessage());
        }

        return new PartnershipResponse();
    }

    /**
     * 获取广告商的佣金列表
     * API: GET /v1/commissioning_lists?advertiser_id={id}
     *
     * @param credential   凭证
     * @param advertiserId 广告商 ID
     * @param page         页码
     * @param perPage      每页数量
     * @return 佣金列表
     */
    public CommissionListResponse getCommissionLists(NetworkCredentialDO credential, Long advertiserId,
                                                      int page, int perPage) {
        String token = getApiKey(credential);

        String url = String.format("%s/v1/commissioning_lists?advertiser_id=%d&page=%d&per_page=%d",
                BASE_URL, advertiserId, page, perPage);

        HttpHeaders headers = buildAuthHeaders(token);

        try {
            ResponseEntity<CommissionListResponse> response = restTemplate.exchange(
                    url, HttpMethod.GET, new HttpEntity<>(headers), CommissionListResponse.class);

            if (response.getBody() != null) {
                log.info("Fetched {} commission lists for advertiser {} from Rakuten",
                        response.getBody().getData() != null ? response.getBody().getData().size() : 0,
                        advertiserId);
                return response.getBody();
            }
        } catch (Exception e) {
            log.error("Failed to fetch commission lists from Rakuten for advertiser {}: {}",
                    advertiserId, e.getMessage());
        }

        return new CommissionListResponse();
    }

    /**
     * 生成推广链接
     * API: GET /v1/get_links?advertiser_id={id}&url={url}
     *
     * @param credential   凭证
     * @param advertiserId 广告商 ID
     * @param targetUrl    目标 URL
     * @param subId        子 ID（可选，用于跟踪）
     * @return 生成的推广链接
     */
    public String getLink(NetworkCredentialDO credential, Long advertiserId, String targetUrl, String subId) {
        String token = getApiKey(credential);

        if (targetUrl == null || targetUrl.isBlank()) {
            log.error("Cannot get link: targetUrl is required");
            return null;
        }

        UriComponentsBuilder builder = UriComponentsBuilder
                .fromHttpUrl(BASE_URL + "/v1/get_links")
                .queryParam("advertiser_id", advertiserId)
                .queryParam("url", targetUrl);

        if (subId != null && !subId.isBlank()) {
            builder.queryParam("sub_id", subId);
        }

        HttpHeaders headers = buildAuthHeaders(token);

        try {
            ResponseEntity<LinkResponse> response = restTemplate.exchange(
                    builder.toUriString(), HttpMethod.GET, new HttpEntity<>(headers), LinkResponse.class);

            if (response.getBody() != null && response.getBody().getUrl() != null) {
                String link = response.getBody().getUrl();
                log.debug("Generated Rakuten link for advertiser {}: {}", advertiserId, link);
                return link;
            }
        } catch (Exception e) {
            log.error("Failed to get link from Rakuten for advertiser {}: {}", advertiserId, e.getMessage());
        }

        return null;
    }

    // ==================== 内部方法 ====================

    private HttpHeaders buildAuthHeaders(String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));
        return headers;
    }

    private String getApiKey(NetworkCredentialDO credential) {
        Map<String, String> creds = parseCredentials(credential.getCredentials());
        String apiKey = creds.get("apiKey");
        if (apiKey == null || apiKey.isBlank()) {
            throw new RuntimeException("Rakuten apiKey is missing in credential " + credential.getId());
        }
        return apiKey;
    }

    @SuppressWarnings("unchecked")
    private Map<String, String> parseCredentials(String credentialsJson) {
        try {
            return objectMapper.readValue(credentialsJson, Map.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Rakuten credentials", e);
        }
    }

    // ==================== 响应 DTO ====================

    @Data
    public static class AdvertiserResponse {
        private List<RakutenAdvertiser> data;
        private Pagination pagination;
    }

    @Data
    public static class PartnershipResponse {
        private List<Partnership> data;
        private Pagination pagination;
    }

    @Data
    public static class CommissionListResponse {
        private List<RakutenCommissionList> data;
        private Pagination pagination;
    }

    @Data
    public static class LinkResponse {
        private String url;
        @JsonProperty("advertiser_id")
        private Long advertiserId;
    }

    @Data
    public static class Partnership {
        @JsonProperty("advertiser_id")
        private Long advertiserId;
        @JsonProperty("advertiser_name")
        private String advertiserName;
        private String status;
        @JsonProperty("approved_date")
        private String approvedDate;
        private String url;
        @JsonProperty("logo_url")
        private String logoUrl;
        private String description;
    }

    @Data
    public static class Pagination {
        @JsonProperty("current_page")
        private Integer currentPage;
        @JsonProperty("total_pages")
        private Integer totalPages;
        @JsonProperty("total_count")
        private Integer totalCount;
        @JsonProperty("per_page")
        private Integer perPage;
    }
}
