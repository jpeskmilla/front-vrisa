# VriSA - Sistema de Monitoreo de Riesgos Ambientales

![VriSA Status](https://img.shields.io/badge/Status-Active-success)
![React](https://img.shields.io/badge/React-18.x-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC?logo=tailwind-css)

**VriSA** es una plataforma integral para el monitoreo, gestión y análisis de la calidad del aire. Conecta a ciudadanos, investigadores, administradores de estaciones e instituciones ambientales en un ecosistema unificado para la visualización de datos en tiempo real y la gestión de redes de sensores.

---

## Características Principales

### Dashboard y Analítica
- **Monitoreo en Tiempo Real:** Visualización del índice AQI y contaminantes (PM2.5, PM10, CO, NO2, SO2, O3).
- **Gráficos Interactivos:** Históricos y tendencias utilizando `Recharts`.
- **Mapas Georreferenciados:** Ubicación de estaciones activas usando `React-Leaflet`.
- **Reportes:** Generación y descarga de informes en PDF (Calidad, Tendencias, Alertas).

### Gestión de Roles y Seguridad
El sistema implementa un control de acceso basado en roles (RBAC) robusto:
- **Super Admin:** Gestión global de instituciones y aprobaciones de investigadores independientes.
- **Institución:** Gestión de redes de estaciones y validación de investigadores asociados.
- **Admin de Estación:** Gestión técnica, registro de sensores y bitácoras de mantenimiento.
- **Investigador:** Acceso a datos históricos y herramientas de análisis.
- **Ciudadano:** Acceso público a mapas de calor y estado actual del aire.

### Gestión Técnica
- **Sensores:** Registro de dispositivos, control de calibración y números de serie.
- **Mantenimiento:** Bitácora digital de mantenimientos con soporte para subir certificados de calibración (PDF).

---

## Stack Tecnológico

El proyecto está construido con una arquitectura moderna y escalable:

*   **Core:** [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
*   **Estilos:** [Tailwind CSS](https://tailwindcss.com/) (Diseño responsivo y custom theme)
*   **Enrutamiento:** React Router DOM (Rutas protegidas y layouts)
*   **Mapas:** Leaflet / React-Leaflet
*   **Gráficos:** Recharts
*   **Iconos:** Lucide React
*   **HTTP Client:** Fetch API wrapper personalizado (`apiFetch`) con manejo de JWT.
*   **Calidad de Código:** ESLint + Prettier

---

## Estructura del Proyecto

El proyecto sigue una arquitectura modular separando la lógica de negocio (`app`) de los recursos reutilizables (`shared`).

# VRISA Frontend

Aplicación web frontend desarrollada con React y Tailwind CSS.

## Dependencias

- Node.js (versión 18 o superior)
- npm o yarn

## Instalación

1. Clona el repositorio

```bash
git clone https://github.com/jpeskmilla/front-vrisa.git
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

La aplicación estará disponible en `http://localhost:8088`

## Comandos Utiles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la build de producción
- `npm run lint` - Ejecuta el linter para verificar el código

> Nota: dado que se está trabajando desde un contenedor de Docker, se necesita utilizar estos comandos desde dentro del contenedor, por ejemplo `docker-compose exec frontend npm install lucide-react`

## Levantar el proyecto en contenedor de Docker
Si es la primera vez, debe construirse la imagen
```
docker compose up --build -d
```

En proximas veces, no es necesario reconstruir la imagen
```
docker compose up -d
```

## Acceso a la página de inicio o login
Una vez se tenga el contenedor del frontend levantado, se puede acceder a la página de inicio con: http://localhost:8088/

> _Nota_: es importante utilizar localhost en lugar de algo como [ip-directa]:8088, porque el CORS del backend valida que la IP de entrada solo sea alguna asociada con localhost. De otra manera rechazará la conexión.
