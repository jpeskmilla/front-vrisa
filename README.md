# VRISA Frontend

Aplicación web frontend desarrollada con React y Tailwind CSS.

## Dependencias

- Node.js (versión 18 o superior)
- npm o yarn

## Instalación

1. Clona el repositorio

```bash
git clone <url-del-repositorio>
cd front-vrisa
```

2. Instala las dependencias

```bash
npm install
```

3. Inicia el servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## Comandos Utiles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la build de producción
- `npm run lint` - Ejecuta el linter para verificar el código


## Levantar el proyecto en contenedor de Docker
```
docker compose -p vrisa up -d
```