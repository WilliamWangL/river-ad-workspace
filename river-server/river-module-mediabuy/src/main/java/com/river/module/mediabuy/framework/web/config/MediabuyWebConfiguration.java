package com.river.module.mediabuy.framework.web.config;

import com.river.framework.swagger.config.RiverSwaggerAutoConfiguration;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
public class MediabuyWebConfiguration {

    @Bean
    public GroupedOpenApi mediabuyGroupedOpenApi() {
        return RiverSwaggerAutoConfiguration.buildGroupedOpenApi("mediabuy");
    }

}

