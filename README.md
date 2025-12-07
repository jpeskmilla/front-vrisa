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

> Nota: dado que se está trabajando desde un contenedor de Docker, se necesita utilizar estos comandos desde dentro del contenedor, por ejemplo `docker-compose exec frontend npm install lucide-react`

## Levantar el proyecto en contenedor de Docker
```
# Si es la primera vez, debe construirse la imagen
docker compose up --build -d
# En proximas veces, no es necesario reconstruir la imagen
docker compose up -d
```

## Acceso a la página de inicio o login
Una vez se tenga el contenedor del frontend levantado, se puede acceder a la página de inicio con: http://localhost:8088/

> _Nota_: es importante utilizar localhost en lugar de algo como [ip-directa]:8088, porque el CORS del backend valida que la IP de entrada solo sea alguna asociada con localhost. De otra manera rechazará la conexión.
