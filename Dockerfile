### STAGE 1: Build timeline ###
FROM node:14-alpine AS build-app
# Install git and clone app
RUN apk update && apk add git && npm install -g npm@latest
# clone app and checkout relevant branch
WORKDIR /usr/src/app/modeler
RUN git clone --recurse-submodules https://github.com/mburwit/bpmn4cp-modeler-frontend.git /usr/src/app/modeler \
    && git checkout LUX && cd /usr/src/app/modeler && git checkout LUX
# install, build and link timeline lib
RUN npm ci
RUN npm run build:prod -- --base-href / --deploy-url /

### STAGE 2: Run ###
FROM nginx:alpine
# default ENVs
ENV CONTEXT_PATH="/" \
    AUTH_ENABLED="false" \
    REPOSITORY_HOST="localhost" \
    REPOSITORY_PROTOCOL="http" \
    REPOSITORY_PORT=8080 \
    REPOSITORY_PATH="/" \
    REPOSITORY_AUTH="false" \
    REPOSITORY_AUTH_USER="username" \
    REPOSITORY_AUTH_PASSWORD="password"
# Add entrypoint scripts to container and make them executable
ADD docker/docker-entrypoint.d/* /docker-entrypoint.d/
RUN find /docker-entrypoint.d/. -name "*.sh" | xargs chmod +x
# Add nginx configuration
COPY --from=build-app /usr/src/app/modeler/docker/nginx/* /etc/nginx/
# Add the build app
COPY --from=build-app /usr/src/app/modeler/target/bpmn4cp-modeler /share/nginx/html/