package com.river.module.coupon.dal.dataobject;

import com.river.framework.tenant.core.db.TenantBaseDO;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.river.framework.mybatis.core.type.StringListTypeHandler;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@TableName(value = "river_coupon_coupon", autoResultMap = true)
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouponDO extends TenantBaseDO {

    @TableId
    private Long id;

    private Long merchantId;

    private Long offerId;

    /** 联盟网络 ID */
    private Long networkId;

    /** 联盟原始 ID */
    private String externalId;

    /** 优惠券标题 */
    private String title;

    private String code;

    /** SEO 页面标题（为空时回退到 title） */
    private String metaTitle;

    /** SEO meta 描述（为空时回退到 terms） */
    private String metaDescription;

    private Integer discountType;

    private BigDecimal discountValue;

    private BigDecimal minPurchase;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private String terms;

    /** 适用地区（ISO 代码列表） */
    @TableField(typeHandler = StringListTypeHandler.class)
    private List<String> regions;

    /** 分类 ID（逗号分隔） */
    private String categoryIds;

    /** 图片 URL */
    private String imageUrl;

    /** 跳转链接 */
    private String gotoUrl;

    /** 是否独家 */
    private Boolean exclusive;

    /** 类型：1=promocode, 2=sale, 3=deal */
    private Integer couponType;

    private Integer source;

    private Boolean verified;

    private Integer hotScore;

    private Integer status;
}
