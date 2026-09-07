package com.river.module.affiliate.service.network.admitad;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class AdmitadCampaign {

    private Long id;

    private String name;

    @JsonProperty("site_url")
    private String siteUrl;

    private String description;

    @JsonProperty("image")
    private String logoUrl;

    private String status;

    /** 合作关系状态：active/pending/declined/suspended */
    @JsonProperty("connection_status")
    private String connectionStatus;

    @JsonProperty("rating")
    private BigDecimal rating;

    @JsonProperty("avg_money_transfer_time")
    private Integer avgMoneyTransferTime;

    @JsonProperty("avg_hold_time")
    private Integer avgHoldTime;

    private List<Category> categories;

    private List<Region> regions;

    private List<Action> actions;

    @Data
    public static class Category {
        private Long id;
        private String name;
    }

    @Data
    public static class Region {
        private String region;
    }

    @Data
    public static class Action {
        private Long id;
        private String name;
        private String type;
        private BigDecimal payment;
        @JsonProperty("payment_size")
        private String paymentSize;
        private Boolean hold;
    }

}
