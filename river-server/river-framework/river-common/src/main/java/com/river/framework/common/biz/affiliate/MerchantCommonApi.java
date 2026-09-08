package com.river.framework.common.biz.affiliate;

import com.river.framework.common.biz.affiliate.dto.MerchantSimpleRespDTO;

import java.util.Collection;
import java.util.List;

/**
 * 商家 API 接口
 */
public interface MerchantCommonApi {

    /**
     * 根据编号获得商家
     *
     * @param id 商家编号
     * @return 商家信息
     */
    MerchantSimpleRespDTO getMerchant(Long id);

    /**
     * 根据编号列表获得商家列表
     *
     * @param ids 商家编号列表
     * @return 商家信息列表
     */
    List<MerchantSimpleRespDTO> getMerchantList(Collection<Long> ids);

}
