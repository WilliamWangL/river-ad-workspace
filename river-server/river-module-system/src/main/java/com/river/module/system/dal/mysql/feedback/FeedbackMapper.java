package com.river.module.system.dal.mysql.feedback;

import com.river.framework.mybatis.core.mapper.BaseMapperX;
import com.river.module.system.dal.dataobject.feedback.FeedbackDO;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface FeedbackMapper extends BaseMapperX<FeedbackDO> {
}
