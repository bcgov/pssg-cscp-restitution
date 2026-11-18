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
FROM node:22.23.1-alpine@sha256:16e22a550f3863206a3f701448c45f7912c6896a62de43add43bb9c86130c3e2 AS build

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

# Caddy builder: rebuild Caddy with golang.org/x/net pinned above the version Caddy ships.
# Caddy 2.11.9 bundles x/net v0.60.0, which has CVE-2026-78661 (fixed in 0.62.0).
FROM caddy:2.11.9-builder@sha256:f9beaa5ddbe7df6f26ebbcf9cbf44e05a1917b9bba464f0c3229038d7e2e6e13 AS caddy-builder
RUN xcaddy build --replace golang.org/x/net=golang.org/x/net@v0.63.0

# Create runtime image layer, copy build image contents into this image
FROM caddy:2.11.9-alpine@sha256:003a97808e781aa9f7e75cc2f43d34d461099031faf5e20faefb9f61126836f0 AS final
RUN apk update && apk upgrade --no-cache
COPY --from=caddy-builder /usr/bin/caddy /usr/bin/caddy

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