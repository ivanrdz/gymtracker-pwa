# src/

Código fuente principal de la aplicación.

## Archivos raíz

### `main.jsx`
Entry point de React. Define:
- `<BrowserRouter>` con React Router v7
- Árbol de rutas: `<Route element={<Layout />}>` envuelve todas las páginas protegidas
- Componente `AuthGate`: redirige a `/login` si no hay sesión activa, redirige a `/` si ya hay sesión y se intenta acceder a `/login`
- Rutas disponibles: `/` (Home), `/sesion`, `/rutina`, `/historial`, `/progreso`, `/catalogo`, `/compartir`, `/login`

### `index.css`
Todos los estilos globales de la aplicación en un solo archivo. Incluye:
- Variables CSS para el sistema de colores (tema claro/oscuro via `prefers-color-scheme`)
- Estilos base, componentes reutilizables (cards, buttons, chips, badges)
- Estilos específicos por componente y página
- Estilos de autenticación (login, auth-loading spinner)
- Estilos de la interfaz de compartir rutinas

## Subcarpetas

| Carpeta | Contenido |
|---------|-----------|
| `lib/` | Cliente de Supabase |
| `context/` | Estado global con React Context |
| `components/layout/` | Layout principal (sidebar + topbar + nav) |
| `components/ui/` | Componentes visuales reutilizables |
| `data/` | Datos estáticos: ejercicios, tipos de rutina, rutinas preset |
| `pages/` | Una página por cada ruta de la aplicación |
