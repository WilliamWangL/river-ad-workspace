# 构建阶段
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /build

# 第一层：只复制 pom.xml 文件下载依赖（变化少，缓存命中率高）
COPY pom.xml .
COPY river-dependencies/pom.xml river-dependencies/
COPY river-framework/pom.xml river-framework/
COPY river-framework/river-common/pom.xml river-framework/river-common/
COPY river-framework/river-spring-boot-starter-biz-data-permission/pom.xml river-framework/river-spring-boot-starter-biz-data-permission/
COPY river-framework/river-spring-boot-starter-biz-ip/pom.xml river-framework/river-spring-boot-starter-biz-ip/
COPY river-framework/river-spring-boot-starter-biz-tenant/pom.xml river-framework/river-spring-boot-starter-biz-tenant/
COPY river-framework/river-spring-boot-starter-excel/pom.xml river-framework/river-spring-boot-starter-excel/
COPY river-framework/river-spring-boot-starter-job/pom.xml river-framework/river-spring-boot-starter-job/
COPY river-framework/river-spring-boot-starter-monitor/pom.xml river-framework/river-spring-boot-starter-monitor/
COPY river-framework/river-spring-boot-starter-mq/pom.xml river-framework/river-spring-boot-starter-mq/
COPY river-framework/river-spring-boot-starter-mybatis/pom.xml river-framework/river-spring-boot-starter-mybatis/
COPY river-framework/river-spring-boot-starter-protection/pom.xml river-framework/river-spring-boot-starter-protection/
COPY river-framework/river-spring-boot-starter-redis/pom.xml river-framework/river-spring-boot-starter-redis/
COPY river-framework/river-spring-boot-starter-security/pom.xml river-framework/river-spring-boot-starter-security/
COPY river-framework/river-spring-boot-starter-web/pom.xml river-framework/river-spring-boot-starter-web/
COPY river-framework/river-spring-boot-starter-websocket/pom.xml river-framework/river-spring-boot-starter-websocket/
COPY river-framework/river-spring-boot-starter-test/pom.xml river-framework/river-spring-boot-starter-test/
COPY river-module-system/pom.xml river-module-system/
COPY river-module-infra/pom.xml river-module-infra/
COPY river-module-affiliate/pom.xml river-module-affiliate/
COPY river-module-tracking/pom.xml river-module-tracking/
COPY river-module-coupon/pom.xml river-module-coupon/
COPY river-module-blog/pom.xml river-module-blog/
COPY river-module-campaign/pom.xml river-module-campaign/
COPY river-module-stats/pom.xml river-module-stats/
COPY river-module-mediabuy/pom.xml river-module-mediabuy/
COPY river-server/pom.xml river-server/

# 下载依赖（仅当 pom.xml 变化时重新执行）
# 使用 || true 忽略本地模块依赖错误，重要的是外部依赖被缓存
RUN --mount=type=cache,target=/root/.m2/repository \
    mvn dependency:resolve -pl river-server -am -B || true && \
    mvn dependency:resolve-plugins -pl river-server -am -B || true

# 第二层：复制源代码并编译
COPY . .
RUN --mount=type=cache,target=/root/.m2/repository \
    mvn package -Dmaven.test.skip=true -pl river-server -am -B

# 运行阶段
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=builder /build/river-server/target/river-server.jar app.jar

RUN mkdir -p /app/logs

ENV TZ=Asia/Shanghai
ENV JAVA_OPTS="-Xms512m -Xmx512m -Djava.security.egd=file:/dev/./urandom"
ENV SPRING_PROFILES_ACTIVE=prod
ENV ARGS=""

EXPOSE 48080

CMD ["sh", "-c", "java ${JAVA_OPTS} -jar app.jar ${ARGS}"]
