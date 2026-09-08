package com.river.module.affiliate.api.merchant;

import com.river.framework.common.biz.affiliate.MerchantCommonApi;
import com.river.framework.common.biz.affiliate.dto.MerchantSimpleRespDTO;
import com.river.framework.common.util.object.BeanUtils;
import com.river.module.affiliate.dal.dataobject.MerchantDO;
import com.river.module.affiliate.dal.mysql.MerchantMapper;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;

/**
 * 商家 API 实现类
 */
@Service
public class MerchantApiImpl implements MerchantCommonApi {

    @Resource
    private MerchantMapper merchantMapper;

    @Override
    public MerchantSimpleRespDTO getMerchant(Long id) {
        MerchantDO merchant = merchantMapper.selectById(id);
        return BeanUtils.toBean(merchant, MerchantSimpleRespDTO.class);
    }

    @Override
    public List<MerchantSimpleRespDTO> getMerchantList(Collection<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return List.of();
        }
        List<MerchantDO> merchants = merchantMapper.selectBatchIds(ids);
        return BeanUtils.toBean(merchants, MerchantSimpleRespDTO.class);
    }

}
