FROM node:25-bookworm-slim

# Instalar dependencias del sistema necesarias para Prisma en Debian
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar archivos de configuración para instalar dependencias
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/types/package.json ./packages/types/

# Instalar todas las dependencias del monorepo
RUN npm install

# Copiar el resto del código
COPY . .

# Generar el cliente de Prisma
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma

EXPOSE 4000

# Comando para desarrollo usando el workspace de la API
CMD ["npm", "run", "dev", "-w", "@kan-todo/api"]
