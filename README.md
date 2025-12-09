# Frontend-SICIC-INSAI

Este es el frontend de la aplicación Proyecto-INSAI, desarrollado con React y Vite. Proporciona la interfaz de usuario para la gestión de información, reportes, usuarios, inspecciones y otros módulos del sistema INSAI.

## Tecnologías principales

- React
- Vite
- CSS Modules
- Context API
- Axios (para peticiones HTTP)

## Estructura de Carpetas

- **public/**: Archivos estáticos y recursos.
- **src/**: Código fuente principal.
  - **components/**: Componentes reutilizables (modales, menús, gráficos, formularios, etc).
  - **hooks/**: Custom hooks para lógica reutilizable.
  - **pages/**: Vistas principales de cada módulo.
  - **utils/**: Utilidades y helpers.
  - **main.jsx**: Punto de entrada de la aplicación.
  - **App.jsx**: Componente raíz y rutas.

## Instalación

1. Instala las dependencias:
   ```bash
   npm install

-2 Inicia el servidor de desarrollo
   npm run dev

-3 Accede a la aplicación en el navegador en la URL indicada por Vite (por defecto http://localhost:5173).

Scripts útiles

npm run dev: Inicia el servidor de desarrollo.

npm run build: Compila la aplicación para producción.

npm run preview: Previsualiza la versión de producción.

Contribución

Haz un fork del repositorio.
Crea una rama (git checkout -b feature/nueva-funcionalidad).
Realiza tus cambios y haz commit.
Envía un pull request.
Licencia
MIT

