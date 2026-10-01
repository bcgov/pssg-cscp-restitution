# ##################################################################################################
#                                                                                                 #
#   RESTITUTION-UI: Angular Single Page Application (SPA) served by Caddy                         #
#                                                                                                 #
#   LOCAL BUILD & RUN INSTRUCTIONS                                                                #
#   --------------------------------------------------------------------------------------------  #
#   1. Build the Docker image:                                                                    #
#        docker build \                                                                           #
#          -t restitution-ui:local \                                                              #
#          -f restitution-app/ClientApp/Dockerfile \                                              #
#          --build-arg BUILD_IMAGE_NAME=restitution-ui \                                          #
#          --build-arg BUILD_VERSION=local-dev \                                                  #
#          .                                                                                      #
#                                                                                                 #
#   2. Run the container:                                                                         #
#        docker run --rm -it -p 2015:2015 restitution-ui:local                                    #
#                                                                                                 #
#   3. Inspect the running container (in another terminal):                                       #
#        docker exec -it <container_id_or_name> bash                                              #
#        whoami            # should print 'appuser'                                               #
#        touch /site/testfile  # should succeed                                                   #
#        printenv BUILD_IMAGE_NAME                                                                #
#        printenv BUILD_VERSION                                                                   #
#                                                                                                 #
#   ARCHITECTURE & BUILD OVERVIEW                                                                 #
#   --------------------------------------------------------------------------------------------  #
#   - Multi-stage Docker build: Node.js for Angular build, Caddy for serving SPA                  #
#   - This image contains only the Angular SPA (no .NET backend)                                  #
#   - Angular is built in the build stage, output is served by Caddy from /site                   #
#   - Runtime container runs as non-root user (appuser) for security                              #
#   - All files in /site are owned by appuser:appgroup                                            #
#   - Build metadata (BUILD_IMAGE_NAME, BUILD_VERSION) available as env vars                      #
#                                                                                                 #
#   TECHNOLOGIES                                                                                  #
#   --------------------------------------------------------------------------------------------  #
#   - Frontend: Angular (in restitution-app/ClientApp)                                            #
#   - Web Server: Caddy                                                                           #
#   - Build: Docker builds frontend separately                                                    #
#                                                                                                 #
# ##################################################################################################
# Create build image layer
FROM node:22.23.3-alpine@sha256:0a7108bf6c7bf5de370ffb1a3ed6be93d405b43ff159f681a8d18c0e2bc2e402 AS build

# Install python3, make, and g++ for node-gyp/node-sass
#RUN apk add --no-cache python3 make g++
# Update needed for package.json to replace node-sass with sass (Dart Sass), once that is done,
# this python install is not required in Dockerfile.

# Build args for traceability
ARG BUILD_IMAGE_NAME
ARG BUILD_VERSION

COPY ./restitution-app/ClientApp ./restitution-app/ClientApp
WORKDIR /restitution-app/ClientApp

# Installing dependencies with npm install (npm ci has compatibility issues with Node 22)
RUN npm install --legacy-peer-deps --ignore-scripts

# Adding Node.js memory optimization for large Angular builds, not needed for this build size
#ENV NODE_OPTIONS="--max-old-space-size=8192"

# Build Angular app
RUN npm run buildprod

# Create runtime image layer, copy build image contents into this image
FROM caddy:2.11.4-alpine@sha256:6aeddd44c3078b0f9a35206472a11420648a79c184603ef95957d0a20044cb2b AS final
RUN apk update && apk upgrade --no-cache

# Strip the file capability the base Caddy image ships on the binary. Caddy binds 2015 (non-privileged),
# so cap_net_bind_service is unneeded, and its presence blocks exec under allowPrivilegeEscalation:false (no_new_privs).
RUN apk add --no-cache libcap && setcap -r /usr/bin/caddy && getcap /usr/bin/caddy || true

# Build args for traceability
ARG BUILD_IMAGE_NAME
ARG BUILD_VERSION

# Create non-root user and group
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

# Set as environment variables
ENV BUILD_IMAGE_NAME=${BUILD_IMAGE_NAME}
ENV BUILD_VERSION=${BUILD_VERSION}

COPY ./restitution-app/ClientApp/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /restitution-app/ClientApp/dist/browser/ /site

# Add version files
RUN echo "${BUILD_IMAGE_NAME}" > /site/build_image_name.txt && echo "${BUILD_VERSION}" > /site/version.txt

ENV BASE_URL=/restwebforms
ENV API_URL=restitution-api-svc:8080

# Set ownership and switch to non-root user
RUN chown -R appuser:appgroup /site
USER appuser

EXPOSE 2015