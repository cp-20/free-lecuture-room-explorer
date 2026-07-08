FROM node:24-bookworm-slim AS frontend-build

WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

FROM caddy:2-alpine

WORKDIR /srv

COPY Caddyfile /etc/caddy/Caddyfile
COPY certs/ /usr/local/share/ca-certificates/free-lecture-room-explorer/
COPY certs/ /srv/certs/
RUN update-ca-certificates

COPY --from=frontend-build /app/dist /srv/app

EXPOSE 8787
