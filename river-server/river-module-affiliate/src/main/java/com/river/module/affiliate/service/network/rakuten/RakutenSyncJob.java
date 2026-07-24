package com.river.module.affiliate.service.network.rakuten;

import com.river.framework.quartz.core.handler.JobHandler;
import com.river.framework.tenant.core.job.TenantJob;
import com.river.module.affiliate.dal.dataobject.NetworkCredentialDO;
import com.river.module.affiliate.dal.mysql.NetworkCredentialMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import jakarta.annotation.Resource;
import java.util.List;

/**
 * Rakuten Advertising 定时同步任务
 */
@Slf4j
@Component("rakutenSyncJob")
public class RakutenSyncJob implements JobHandler {

    private static final String NETWORK_CODE = "rakuten";

    @Resource
    private NetworkCredentialMapper credentialMapper;

    @Resource
    private RakutenSyncService rakutenSyncService;

    @Override
    @TenantJob
    public String execute(String param) throws Exception {
        log.info("[RakutenSyncJob] Starting Rakuten sync job");

        List<NetworkCredentialDO> credentials = credentialMapper.selectEnabledByNetworkCode(NETWORK_CODE);

        if (credentials.isEmpty()) {
            log.info("[RakutenSyncJob] No enabled Rakuten credentials found");
            return "No credentials";
        }

        int successCount = 0;
        for (NetworkCredentialDO credential : credentials) {
            try {
                log.info("[RakutenSyncJob] Syncing for network credential id={}", credential.getId());
                rakutenSyncService.syncData(credential);
                successCount++;
            } catch (Exception e) {
                log.error("[RakutenSyncJob] Failed to sync for credential id={}: {}",
                        credential.getId(), e.getMessage());
            }
        }

        String result = String.format("Synced %d/%d credentials", successCount, credentials.size());
        log.info("[RakutenSyncJob] {}", result);
        return result;
    }
}
