# 開発用Dockerfile: Mavenイメージでそのまま起動する
FROM maven:3.9-eclipse-temurin-21

WORKDIR /app

# 依存関係を先に解決してレイヤーキャッシュを効かせる
COPY pom.xml .
RUN mvn -B -q dependency:go-offline

# アプリケーションコードをコピー（開発時は docker-compose で src/ をマウント）
COPY src ./src

EXPOSE 8080

# Spring Bootを起動（ソース変更後は docker compose restart backend で反映）
CMD ["mvn", "spring-boot:run"]
