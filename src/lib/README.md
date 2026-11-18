# src/lib/

Utilidades y clientes de servicios externos.

## `supabase.js`

Instancia única del cliente de Supabase, exportada como `supabase`.

```js
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(url, key, { db: { schema: 'gymtracker' } })
```

**Puntos importantes:**
- Se conecta al schema `gymtracker` (no al schema público `public`). Esto permite usar un solo proyecto de Supabase para múltiples aplicaciones futuras.
- Las credenciales vienen de variables de entorno `VITE_SUPABASE_URL` y `VITE_SUPABASE_KEY`.
- Para que el schema `gymtracker` funcione, debe estar agregado en el dashboard de Supabase en: **Data API → Exposed schemas** y **Extra search path**.
- Importar siempre desde `'../lib/supabase'` (o la ruta relativa correspondiente). No crear instancias adicionales.

## Dependencia

```json
"@supabase/supabase-js": "^2.49.4"
```
