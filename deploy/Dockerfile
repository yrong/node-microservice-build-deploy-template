FROM node:8-alpine
RUN mkdir -p /build
COPY build /build
ENV LOG_PATH /logs
ENV RUNTIME_PATH /runtime
ENV NODE_CONFIG_DIR /config
ENV LICENSE_PATH /license
ENV NODE_ENV production
WORKDIR /build
CMD ["node", "server.js"]