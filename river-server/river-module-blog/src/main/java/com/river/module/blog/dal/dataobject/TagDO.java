package com.river.module.blog.dal.dataobject;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.river.framework.tenant.core.db.TenantBaseDO;
import lombok.*;

@TableName("river_blog_tag")
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TagDO extends TenantBaseDO {

    @TableId
    private Long id;

    private String name;

    private String slug;

    private Integer postCount;

    private Integer status;
}
