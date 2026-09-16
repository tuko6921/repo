FROM node:20-alpine AS build
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
RUN echo '{"type":"module"}' > package.json && npm install express@4
ENV NODE_ENV=production
ENV PORT=8084
EXPOSE 8084
CMD ["node", "dist/index.js"]
