package com.river.module.affiliate.dal.dataobject;

import com.river.framework.tenant.core.db.TenantBaseDO;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.river.framework.mybatis.core.type.StringListTypeHandler;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * 商家/广告主 DO
 */
@TableName(value = "river_affiliate_merchant", autoResultMap = true)
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MerchantDO extends TenantBaseDO {

    @TableId
    private Long id;

    /** 关联的联盟网络 ID */
    private Long networkId;

    /** 联盟侧商家 ID */
    private String externalId;

    /** 商家名称 */
    private String name;

    /** URL友好标识 */
    private String slug;

    /** 商家域名 */
    private String domain;

    /** Logo URL */
    private String logoUrl;

    /** 商家描述（联盟同步的原始描述，作为简介/详情的回退值） */
    private String description;

    /** 商家简介（短文本，用于详情页头部摘要，为空时回退到 description） */
    private String intro;

    /** 商家描述（长富文本，用于详情页底部，为空时回退到 description） */
    private String about;

    /** 商家评级（1-5） */
    private BigDecimal rating;

    /** 状态：0-停用，1-启用 */
    private Integer status;

    /** 支持的国家/地区（ISO 代码列表） */
    @TableField(typeHandler = StringListTypeHandler.class)
    private List<String> regions;

    /** 分类 ID 列表（JSON 数组） */
    private String categoryIds;
}
