FROM node:20-alpine as build

WORKDIR /app
COPY package.json ./

# Instalacion de dependencias
RUN npm install
# Copia del código fuente
COPY . .

# Por defecto apunta al backend local en el puerto 8000
ARG VITE_API_URL="http://localhost:8000/api"
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ==========================================
# Etapa 2: Servidor de Producción (Nginx)
# ==========================================
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]