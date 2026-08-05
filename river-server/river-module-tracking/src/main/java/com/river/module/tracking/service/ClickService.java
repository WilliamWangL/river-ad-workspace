package com.river.module.tracking.service;

import com.river.framework.common.pojo.PageResult;
import com.river.module.tracking.controller.admin.click.vo.ClickPageReqVO;
import com.river.module.tracking.dal.dataobject.ClickDO;

public interface ClickService {

    ClickDO getClick(String clickId);

    PageResult<ClickDO> getClickPage(ClickPageReqVO pageReqVO);

    String createClick(ClickDO click);

    void validateClickExists(String clickId);

    /**
     * 记录点击并获取重定向 URL
     *
     * @param targetType  目标类型: 1=商家, 2=Offer, 3=Deal, 4=优惠券
     * @param targetId   目标实体 ID
     * @param sub1       Sub ID 1
     * @param sub2       Sub ID 2
     * @param sub3       Sub ID 3
     * @param sub4       Sub ID 4
     * @param sub5       Sub ID 5
     * @param ip         客户端 IP
     * @param userAgent  User-Agent
     * @param referer     Referer
     * @return 重定向 URL
     */
    String recordClickAndGetRedirectUrl(Integer targetType, Long targetId, String sub1, String sub2,
                                        String sub3, String sub4, String sub5,
                                        String ip, String userAgent, String referer);

}
