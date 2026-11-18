# GymTracker Pro

PWA para llevar un registro completo del progreso en el gimnasio. Permite a coaches crear rutinas personalizadas para sus clientes, registrar sesiones de entrenamiento, y visualizar la progresión de cargas a lo largo del tiempo.

## Funcionalidades

### Autenticación
- Login con email y contraseña (vía Supabase Auth)
- Sin registro público — los usuarios los crea el coach manualmente en el dashboard de Supabase
- Sesión persistente: al reabrir la app no se pide login nuevamente

### Rutinas
- Crear rutinas personalizadas con múltiples días
- Elegir tipo de rutina: Full Body, Upper/Lower, PPL (Push/Pull/Legs), Weider, o Bloque Compuesto
- Configurar ejercicios por día: series, repeticiones, notas de técnica
- Rutinas preset: incluye un bloque de 5 días de ejercicios compuestos (Glúteo / Torso A / Cuádriceps / Torso B / Pierna general)
- Iniciar y activar rutinas (pueden coexistir varias activas)
- Marcar rutinas como completadas

### Sesiones de entrenamiento
- Registrar la sesión del día seleccionando el día de la rutina activa
- Registrar peso y repeticiones por serie en cada ejercicio
- Ver el historial de la última sesión para ese ejercicio
- Ver el PR (récord personal) de cada ejercicio
- Gráfica de progresión de peso por ejercicio
- Timer de descanso entre series (presets: 30s, 60s, 90s, 120s)
- Foto de la sesión (desde cámara o galería)
- Compartir imagen de la sesión (canvas 1080×1080)
- Editar sesión ya registrada del mismo día

### Dashboard (inicio)
- Resumen de la rutina activa: % de cumplimiento general
- Contadores: sesiones completas, parciales y faltadas
- Grilla de cumplimiento por semana/día
- Gráfica de progresión de cargas (Recharts)
- Mapas corporales: músculos trabajados hoy y en la semana
- Selector de rutina cuando hay más de una activa

### Historial
- Lista de todas las rutinas con sus estadísticas
- Últimas 5 sesiones por rutina con detalle de ejercicios y pesos

### Progreso físico
- Registro de peso corporal inicial y final
- Fotos de inicio y fin de rutina
- Barra de progreso de tiempo transcurrido
- Botón para marcar rutina como completada (disponible al llegar al 80%)

### Catálogo de ejercicios
- Listado de ejercicios precargados por grupo muscular
- Crear, editar y eliminar ejercicios personalizados
- Filtrar por grupo muscular

### Compartir rutinas (Coach → Cliente)
- El coach puede enviar una copia de su rutina a otro usuario por email
- El cliente recibe la rutina en su bandeja y puede aceptarla o rechazarla
- Se guarda una snapshot del estado actual de la rutina al momento de compartir

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19 + Vite 6 |
| PWA | vite-plugin-pwa (manifest + service worker autoUpdate) |
| Routing | React Router v7 |
| Backend / DB | Supabase (Auth + PostgreSQL) |
| Schema DB | `gymtracker` (multi-schema: un proyecto Supabase, múltiples apps) |
| Estilo | CSS puro en `src/index.css` (variables CSS para tema claro/oscuro) |
| Gráficas | Recharts |
| Iconos | Lucide React |
| Deploy | Vercel |

## Estructura de carpetas

```
pwaEjercicio/
├── public/images/          # Imágenes de ejercicios
├── src/
│   ├── main.jsx            # Entry point, rutas, AuthGate
│   ├── index.css           # Todos los estilos globales
│   ├── lib/                # Cliente Supabase
│   ├── context/            # Estado global (AppContext)
│   ├── components/
│   │   ├── layout/         # Layout principal, sidebar, topbar
│   │   └── ui/             # Componentes reutilizables
│   ├── data/               # Catálogo de ejercicios, tipos de rutina, presets
│   └── pages/              # Una página por ruta
├── .env                    # Variables de entorno (no en git)
├── vite.config.js          # Configuración Vite + PWA
└── package.json
```

## Variables de entorno

Crear archivo `.env` en la raíz (no se sube a git):

```
VITE_SUPABASE_URL=https://<tu-proyecto>.supabase.co
VITE_SUPABASE_KEY=<publishable key>
```

En Vercel, agregar las mismas variables con tipo **Config** (no Secret), ya que el prefijo `VITE_` las expone al navegador intencionalmente.

## Base de datos (Supabase)

Schema: `gymtracker`

Tablas principales:
- `routines` — rutinas del usuario (estructura completa en `routine_data jsonb`)
- `sessions` — sesiones registradas con `records jsonb`
- `routine_shares` — invitaciones coach→cliente con `routine_snapshot jsonb`

RLS habilitado en todas las tablas. Los usuarios solo ven sus propios datos.

## Notas de desarrollo importantes

- Todos los IDs generados en el cliente deben ser UUIDs válidos (`crypto.randomUUID()`). Supabase rechaza silenciosamente IDs con formato incorrecto en columnas `uuid`.
- Las actualizaciones de estado en contextos asíncronos deben usar la forma funcional `setState(prev => ...)` para evitar closures con estado desactualizado.
- Los ejercicios personalizados (`customExercises`) se guardan en `localStorage`, no en Supabase (no existe tabla para ellos todavía).
