# Configurar cron-job.org para auto-resolver partidos

El endpoint `/api/live` detecta partidos con status `FT` en la respuesta de
API-Football y los resuelve automáticamente (actualiza `partidos` + distribuye
puntos en quinielas). Para que esto funcione sin intervención manual, hay que
llamarlo periódicamente desde un cron externo gratuito.

## URL y parámetros

| Campo     | Valor                                                            |
|-----------|------------------------------------------------------------------|
| URL       | `https://mundial-pulse-react-sooty.vercel.app/api/live`         |
| Método    | `GET`                                                            |
| Frecuencia| Cada **5 minutos**                                               |
| Auth      | ninguna — el endpoint es público                                 |

> **Nota sobre la caché:** el endpoint guarda una caché de 60 segundos en
> Supabase. Llamadas más frecuentes que eso son ignoradas (se sirve el cache).
> 5 minutos es el balance correcto entre detección rápida de FT y no gastar
> cuota de API-Football innecesariamente.

---

## Pasos para registrarse en cron-job.org (gratis, sin tarjeta)

1. Entrá a **https://cron-job.org** → "Sign up free"
2. Registrate con email (sin tarjeta de crédito)
3. Confirmá el email y entrá al dashboard
4. Click en **"Create cronjob"**
5. Completá el formulario:
   - **Title:** `Mundial Pulse — auto-resolve live matches`
   - **URL:** `https://mundial-pulse-react-sooty.vercel.app/api/live`
   - **Schedule:** seleccioná `Every 5 minutes`
     - O configuralo manualmente: cada minuto divisible por 5 (0, 5, 10, ...)
   - **Request method:** GET
   - **Timeout:** 30 seconds
6. Click **"Create"**

El cron queda activo de inmediato. cron-job.org envía un GET cada 5 minutos.

---

## Cómo funciona internamente

```
cron-job.org GET /api/live (cada 5 min)
         │
         ▼
api/live.js
  ├─ cache < 60s? → devuelve cache (sin llamar API)
  └─ cache vencido?
       │
       ▼
    GET https://v3.football.api-sports.io/fixtures?live=all
       │
       ├─ filtra league.id === 1 (World Cup)
       ├─ liveNow  (1H/2H/HT/ET/BT/P/SUSP/INT) → guarda en cache → responde
       └─ justFinished (FT/AET/PEN) → AUTO-RESOLVE (side effect)
              │
              ├─ cruza con tabla `partidos` (nombre EN↔ES)
              ├─ UPDATE partidos SET estado='finalizado', resultado_local/visitante
              └─ FOREACH quinielas → calcula pts (3=exacto / 1=tendencia) → UPDATE
```

---

## Verificar que funciona

Después de que termine un partido:

1. Esperá hasta el próximo ciclo de 5 minutos del cron
2. Entrá a **Vercel → proyecto → Functions → api/live → logs**
3. Buscá la línea:
   ```
   [AUTO-RESOLVE] Argentina vs Austria → 2-1 | partido #39 | quinielas actualizadas: 14 { exactos: 2, tendencia: 7, fallidos: 5 }
   ```
4. En Supabase → tabla `partidos` → verificá que `estado = 'finalizado'`
5. En Supabase → tabla `quinielas` → verificá que `puntos` aumentó

---

## Test manual (sin esperar un partido real)

Para verificar que el auto-resolve funciona antes del primer partido:

```bash
curl -X GET \
  "https://mundial-pulse-react-sooty.vercel.app/api/live?_ft_test=1&home=Argentina&away=Austria&gh=2&ga=1" \
  -H "x-admin-secret: TU_ADMIN_SECRET"
```

Esto inyecta un fixture FT sintético de Argentina-Austria 2-1 y ejecuta el
resolve completo. Revisá los logs de Vercel para confirmar `[AUTO-RESOLVE]`.

> ⚠️ Si Argentina-Austria ya está `finalizado` en la DB, la llamada de test
> es idempotente (no hace nada, no duplica puntos). Podés resetear el estado
> en Supabase para volver a probar.
