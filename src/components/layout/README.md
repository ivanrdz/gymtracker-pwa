# src/components/layout/

Componentes que forman la estructura visual principal de la aplicación.

## `Layout.jsx`

Componente raíz del layout. Envuelve todas las páginas protegidas (es el `element` del `<Route>` padre en `main.jsx`).

**Estructura:**
```
<div class="app-shell">
  <Sidebar />
  <main class="main-content">
    <Topbar />
    <div class="page-container">
      <Outlet />   ← aquí renderizan las páginas hijas
    </div>
  </main>
  <BottomNav />
</div>
```

**Responsabilidades:**
- Aplica el tema (`data-theme` en `<html>`) cuando cambia
- Cierra el sidebar al hacer click fuera de él
- Maneja el estado de sidebar abierto/cerrado en móvil

---

## Sidebar

Menú lateral deslizable (en móvil) o visible en pantallas grandes.

**Contenido:**
- Logo / nombre de la app
- Navegación por secciones (mismas que el bottom nav)
- Email del usuario autenticado
- Botón de cerrar sesión (llama `signOut()` del contexto)
- ThemeToggle

**Rutas de navegación:**
| Icono | Etiqueta | Ruta |
|-------|----------|------|
| LayoutDashboard | Inicio | `/` |
| Dumbbell | Rutinas | `/rutina` |
| Play | Sesión | `/sesion` |
| BarChart3 | Progreso | `/progreso` |
| History | Historial | `/historial` |
| BookOpen | Catálogo | `/catalogo` |
| Share2 | Compartir | `/compartir` |

---

## Topbar

Barra superior fija. Contiene:
- Botón hamburguesa para abrir/cerrar el sidebar en móvil
- Título de la sección actual
- Botón de logout (icono)

---

## BottomNav

Barra de navegación inferior (tab bar de móvil). Muestra solo las rutas principales para no saturar el espacio. Resalta la ruta activa con `useLocation()`.
