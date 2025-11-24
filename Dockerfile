FROM node:20-alpine

WORKDIR /app
COPY package.json ./

# Instalar dependencias y copiar el código fuente
RUN npm install
COPY . .

# Exponer el puerto interno de Vite (5173)
EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]