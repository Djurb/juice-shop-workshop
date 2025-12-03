# Use a secure, supported Node.js base image
FROM node:20.19.4-bookworm as installer
COPY . /juice-shop
WORKDIR /juice-shop
RUN npm i -g typescript ts-node
RUN npm install --omit=dev --unsafe-perm
RUN npm dedupe
RUN rm -rf frontend/node_modules
RUN rm -rf frontend/.angular
RUN rm -rf frontend/src/assets
RUN mkdir logs
RUN chown -R 65532 logs
RUN chgrp -R 0 ftp/ frontend/dist/ logs/ data/ i18n/
RUN chmod -R g=u ftp/ frontend/dist/ logs/ data/ i18n/
RUN rm data/chatbot/botDefaultTrainingData.json || true
RUN rm ftp/legal.md || true
RUN rm i18n/*.json || true

ARG CYCLONEDX_NPM_VERSION=latest
RUN npm install -g @cyclonedx/cyclonedx-npm@$CYCLONEDX_NPM_VERSION
RUN npm run sbom

# workaround for libxmljs startup error
FROM node:20.19.4-bookworm as libxmljs-builder
WORKDIR /juice-shop
# Upgrade system packages and install build tools
RUN apt-get update && apt-get upgrade -y && apt-get install -y build-essential python3 && rm -rf /var/lib/apt/lists/*
COPY --from=installer /juice-shop/node_modules ./node_modules
RUN rm -rf node_modules/libxmljs2/build && \
  cd node_modules/libxmljs2 && \
  npm run build

# Use a secure distroless image for final stage
FROM gcr.io/distroless/nodejs20-debian12
ARG BUILD_DATE
ARG VCS_REF
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.source="https://github.com/somerset-inc/juice-shop-goof"
LABEL io.snyk.containers.image.dockerfile="/Dockerfile"
WORKDIR /juice-shop
COPY --from=installer --chown=65532:0 /juice-shop .
COPY --chown=65532:0 --from=libxmljs-builder /juice-shop/node_modules/libxmljs2 ./node_modules/libxmljs2
USER 65532
EXPOSE 3000
CMD ["/juice-shop/build/app.js"]

# End of Dockerfile
