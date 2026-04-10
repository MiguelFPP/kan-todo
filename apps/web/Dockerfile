FROM node:25-bookworm-slim

# Instalar dependencias necesarias para paquetes nativos
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar archivos de configuración para instalar dependencias
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/types/package.json ./packages/types/

# Instalar todas las dependencias
RUN npm install

# Copiar el resto del código
COPY . .

EXPOSE 3000

# Comando para desarrollo usando el workspace de la Web
CMD ["npm", "run", "dev", "-w", "@kan-todo/web"]
