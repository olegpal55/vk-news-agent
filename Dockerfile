FROM node:20-alpine

WORKDIR /app

# Устанавливаем зависимости (кэшируем слой)
COPY package*.json ./
RUN npm ci --only=production

# Копируем исходники
COPY . .

# Сборка TypeScript
RUN npm run build

# Создаем папку для БД
RUN mkdir -p /app/data

EXPOSE 3000

CMD ["node", "dist/main"]
