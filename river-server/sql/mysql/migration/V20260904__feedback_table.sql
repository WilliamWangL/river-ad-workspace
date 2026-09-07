-- 用户意见/反馈表
CREATE TABLE IF NOT EXISTS `river_system_feedback` (
  `id`          bigint       NOT NULL AUTO_INCREMENT COMMENT '主键 ID',
  `source_type` varchar(32)  NOT NULL DEFAULT 'general' COMMENT '反馈来源类型：deal / blog / offer / general',
  `source_page` varchar(256) NOT NULL DEFAULT '' COMMENT '来源页面标识（如 slug 或 URL）',
  `name`        varchar(64)  NOT NULL DEFAULT '' COMMENT '提交人姓名',
  `email`       varchar(128) NOT NULL DEFAULT '' COMMENT '邮箱（选填）',
  `message`     text         NOT NULL         COMMENT '反馈内容',
  `status`      tinyint      NOT NULL DEFAULT 0 COMMENT '处理状态：0-待处理 1-已处理',
  `remark`      varchar(512) NOT NULL DEFAULT '' COMMENT '处理备注',
  `tenant_id`   bigint       NOT NULL DEFAULT 0 COMMENT '租户 ID',
  `creator`     varchar(64)           DEFAULT '' COMMENT '创建者',
  `create_time` datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updater`     varchar(64)           DEFAULT '' COMMENT '更新者',
  `update_time` datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted`     bit(1)       NOT NULL DEFAULT b'0' COMMENT '是否删除',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户意见/反馈表';
