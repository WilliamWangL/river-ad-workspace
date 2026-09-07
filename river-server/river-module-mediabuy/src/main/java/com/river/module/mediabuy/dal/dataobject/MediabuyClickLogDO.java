package com.river.module.mediabuy.dal.dataobject;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.river.framework.tenant.core.db.TenantBaseDO;
import lombok.*;

/**
 * 媒体投放点击日志 DO
 * <p>
 * 主键使用 MySQL AUTO_INCREMENT 自增，
 * 不再使用序列，因此不需要 {@code @KeySequence} 注解。
 */
@TableName("river_mediabuy_click_log")
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MediabuyClickLogDO extends TenantBaseDO {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** Offer ID（affiliate.offer） */
    private Long offerId;

    /** Offer 名称 */
    private String offerName;

    /** 商家 ID（affiliate.merchant） */
    private Long merchantId;

    /** 商家名称（冗余，便于报表查询） */
    private String merchantName;

    /** 宏替换后的 trackLink（最终跳转链接） */
    private String trackLink;

    /** 联盟 code（如 admitad/cj/awin） */
    private String networkCode;

    /** 操作系统类型：PC/IOS/ANDROID */
    private String osType;

    /** 国家 */
    private String country;

    /** publisher_click_id（外部传入的点击 ID） */
    private String publisherClickId;

    /** click_id（系统生成的 clickId，用于归因） */
    private String clickId;

    /** subid1 */
    private String subid1;

    /** subid2 */
    private String subid2;

    /** 访问 IP */
    private String ip;

    /** User-Agent */
    private String userAgent;

    /** Referer */
    private String referer;

    /** QueryString（原始） */
    private String queryString;

}

