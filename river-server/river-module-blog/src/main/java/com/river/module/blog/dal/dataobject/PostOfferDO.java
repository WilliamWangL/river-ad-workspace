package com.river.module.blog.dal.dataobject;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.river.framework.tenant.core.db.TenantBaseDO;
import lombok.*;

@TableName("river_blog_post_offer")
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostOfferDO extends TenantBaseDO {

    @TableId
    private Long id;

    private Long postId;

    private Long offerId;

    private String anchorText;

    private Integer position;
}
