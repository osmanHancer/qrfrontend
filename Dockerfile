# Frontend Dockerfile
FROM node:18-alpine as build

WORKDIR /app

# Package dosyalarını kopyala
COPY package*.json ./

# Dependencies yükle
RUN npm ci

# Source kodunu kopyala
COPY . .

# Production build
RUN npm run build

# Nginx ile serve et
FROM nginx:alpine

# Build dosyalarını kopyala
COPY --from=build /app/dist/qrfrontend /usr/share/nginx/html

# Nginx konfigürasyonu
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
