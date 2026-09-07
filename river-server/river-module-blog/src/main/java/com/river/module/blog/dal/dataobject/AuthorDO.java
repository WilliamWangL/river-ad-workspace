package com.river.module.blog.dal.dataobject;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.river.framework.tenant.core.db.TenantBaseDO;
import lombok.*;

@TableName("river_blog_author")
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthorDO extends TenantBaseDO {

    @TableId
    private Long id;

    private String name;

    private String slug;

    private String avatarUrl;

    private String bio;

    private Integer status;
}
