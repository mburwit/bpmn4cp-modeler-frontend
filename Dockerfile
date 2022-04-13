FROM nginx:1.18.0-alpine

ENV HOST="localhost" \
    PORT=80 \
    SSL_PORT=443 \
    CONTEXT_PATH="/" \
    KEYCLOAK_ENABLED="false" \
    KEYCLOAK_URL="https://localhost/auth/" \
    KEYCLOAK_REALM="realm" \
    KEYCLOAK_CLIENT_ID="client_id" \
    KEYCLOAK_REQUIRED_ROLE="role" \
    REPOSITORY_HOST="localhost" \
    REPOSITORY_PROTOCOL="https" \
    REPOSITORY_PORT=443 \
    REPOSITORY_PATH="/"

USER root

# install openssl
RUN apk update && apk add openssl && apk add nano

# Add entrypoint scripts to container and make them executable
ADD docker/docker-entrypoint.d/* /docker-entrypoint.d/
RUN find /docker-entrypoint.d/. -name "*.sh" | xargs chmod +x

ADD docker/nginx/templates /etc/nginx/templates
ADD target/bpmn4cp-modeler /share/nginx/html/

# expose the port
EXPOSE $PORT
EXPOSE $SSL_PORT