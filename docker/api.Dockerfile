# syntax=docker/dockerfile:1.7
# ==============================================================================
# PABLO AI SOCIAL AGENT — API (NestJS) production image
# Multi-stage build: install once at the workspace root, build the shared
# package + api, then ship a slim runtime image with only production deps.
# ==============================================================================

FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate
WORKDIR /workspace

FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared/package.json packages/shared/package.json
COPY apps/api/package.json apps/api/package.json
RUN pnpm install --frozen-lockfile --filter @pablo/api... --filter @pablo/shared

FROM deps AS build
COPY packages/shared packages/shared
COPY apps/api apps/api
RUN pnpm --filter @pablo/shared build
RUN pnpm --filter @pablo/api exec prisma generate
RUN pnpm --filter @pablo/api build

FROM base AS runtime
ENV NODE_ENV=production
WORKDIR /workspace

COPY --from=build /workspace/package.json /workspace/pnpm-workspace.yaml ./
COPY --from=build /workspace/packages/shared ./packages/shared
COPY --from=build /workspace/apps/api/package.json ./apps/api/package.json
COPY --from=build /workspace/apps/api/dist ./apps/api/dist
COPY --from=build /workspace/apps/api/prisma ./apps/api/prisma
COPY --from=build /workspace/apps/api/node_modules ./apps/api/node_modules
COPY --from=build /workspace/node_modules ./node_modules

RUN mkdir -p /workspace/apps/api/uploads/images

WORKDIR /workspace/apps/api
EXPOSE 4000

COPY docker/scripts/api-entrypoint.sh /usr/local/bin/api-entrypoint.sh
RUN chmod +x /usr/local/bin/api-entrypoint.sh

ENTRYPOINT ["/usr/local/bin/api-entrypoint.sh"]
CMD ["node", "dist/main.js"]
