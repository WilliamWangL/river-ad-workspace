package com.river.module.blog.dal.dataobject;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import org.apache.ibatis.type.Alias;
import com.river.framework.tenant.core.db.TenantBaseDO;
import com.river.module.blog.enums.PostStatusEnum;
import com.river.module.blog.enums.PostTypeEnum;
import lombok.*;

import java.time.LocalDateTime;

@Alias("BlogPostDO")
@TableName("river_blog_post")
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BlogPostDO extends TenantBaseDO {

    @TableId
    private Long id;

    private Long authorId;

    private String title;

    private String slug;

    private String content;

    private String excerpt;

    private String coverImage;

    /**
     * @see PostTypeEnum
     */
    private Integer type;

    /**
     * @see PostStatusEnum
     */
    private Integer status;

    private LocalDateTime publishedAt;

    private String metaTitle;

    private String metaDescription;

    private String canonicalUrl;

    private Integer viewCount;

    private Boolean featured;
}
