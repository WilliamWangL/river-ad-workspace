package com.river.module.affiliate.dal.dataobject;

import com.river.framework.tenant.core.db.TenantBaseDO;
import com.river.module.affiliate.enums.PayoutModelEnum;
import com.river.module.affiliate.enums.OfferStatusEnum;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.river.framework.mybatis.core.type.StringListTypeHandler;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * Offer/广告 DO
 */
@TableName(value="river_affiliate_offer",autoResultMap = true)
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OfferDO extends TenantBaseDO {

    @TableId
    private Long id;

    /** 关联商家 ID */
    private Long merchantId;

    /** 关联联盟网络 ID */
    private Long networkId;

    /** 联盟侧 Offer ID */
    private String externalId;

    /** Offer 名称 */
    private String name;

    /** Offer 描述 */
    private String description;

    /** 佣金类型 {@link PayoutModelEnum} */
    private Integer commissionType;

    /** 佣金数值 */
    private BigDecimal commissionValue;

    /** 佣金货币 */
    private String currency;

    /** Cookie 有效期（天） */
    private Integer cookieDays;

    /** 追踪跳转URL（完整URL，存储时已拼接参数） */
    private String gotoUrl;

    /** 落地页 URL */
    private String landingUrl;

    /** 状态 {@link OfferStatusEnum} */
    private Integer status;

    /** 支持的地区（ISO 代码列表） */
    @TableField(typeHandler = StringListTypeHandler.class)
    private List<String> regions;

    /** 分类 ID 列表（JSON 数组） */
    private String categoryIds;

    /** 标签（JSON 数组） */
    private String tags;

    /** 图片 URL */
    private String imageUrl;

    /** EPC（每次点击收益） */
    private BigDecimal epc;

    /** 转化率 */
    private BigDecimal conversionRate;

    /** 是否编辑推荐 */
    private Boolean featured;

    /** 热度分数 */
    private Integer hotScore;
}
