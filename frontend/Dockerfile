FROM node:20-alpine AS base

# Зависимости
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Сборка
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Продакшен
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Копируем публичные файлы
COPY --from=builder /app/public ./public

# Копируем собранный standalone и статику
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Проксирование API (если нужно)
# Next.js может брать URL к API из ENV
# Но вызовы с клиента пойдут на хост (например, localhost:8000/api)
# Рекомендуется использовать Nginx или настраивать пути.
# Для простоты:
EXPOSE 3000

CMD ["node", "server.js"]
