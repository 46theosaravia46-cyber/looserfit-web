# Plan de Implementación Multi-Marca: Looser Fit + Looser Sport

---
## 🗺️ ESTADO DE PROGRESO (leer esto primero al retomar)

| Sección | Estado | Fecha |
|---|---|---|
| SECCIÓN 1 — Fundaciones: Brand + Constantes + DECISIONS.md | ✅ COMPLETA | 2026-08-02 |
| SECCIÓN 2 — Backend: agregar `brand` a todos los modelos | ✅ COMPLETA | 2026-08-02 |
| SECCIÓN 3 — Backend: Middleware detectBrand + Services | ✅ COMPLETA | 2026-08-02 |
| SECCIÓN 4 — Frontend: BrandProvider + Ruteo Multi-Marca | ✅ COMPLETA | 2026-08-03 |
| SECCIÓN 5 — Frontend: UI de Sport (Navbar, Logo, Home) | ✅ COMPLETA | 2026-08-03 |
| SECCIÓN 6 — Admin: Selector de Marca + Filtrado | ✅ COMPLETA | 2026-08-03 |
| SECCIÓN 7 — Migración de Datos + Coming Soon de Sport | ✅ COMPLETA | 2026-08-03 |
| SECCIÓN 8 — Pulido Final y Verificación | ✅ COMPLETA | 2026-08-03 |

## 🎉 PLAN COMPLETO — Sistema Multi-Marca operativo al 100%

---

## 📋 RESUMEN COMPLETO — Última sesión: 2026-08-03

### Qué se hizo (sesión del día 2026-08-03)
- **Sección 3**: `brandMiddleware.js` + `brandRoutes.js` + actualización de todos los services/controllers (product, category, home, order) para filtrar por `req.brandId`.
- **Sección 4**: `BrandContext.jsx` + refactor completo de `App.jsx` con ruteo dual (Fit en `/`, Sport en `/sport`) + `api.js` con `?brand=` en todas las rutas + `CartContext` separado por marca.
- **Sección 5**: `siteConfig.js` multi-marca con `getBrandConfig(slug)` + Navbar y Footer con logo/datos dinámicos + selector Fit/Sport en el drawer del Navbar.
- **Sección 6**: `AdminBrandContext.jsx` + selector visual en el sidebar del admin + `AdminProductos` recarga por marca + `AdminPedidos` filtra por `brand.slug`.
- **Sección 7**: Script `setup-sport.js` ejecutado → HomeContent de Sport creado con Coming Soon activo hasta el 2/9/2026. Script `verify-migration.js` confirma 0 documentos huérfanos.
- **Sección 8**: Tests de 7/7 endpoints verificados. Separación fit/sport confirmada en datos.

### Estado actual del sistema
- `localhost:3000` → Backend funcionando con multi-marca
- `localhost:5173` → Frontend compilando sin errores (build ✅)
- MongoDB: `fit` 96 productos · 5 categorías · 10 pedidos · 1 HomeContent  
- MongoDB: `sport` 0 productos · 0 categorías · 0 pedidos · 1 HomeContent (comingSoon: TRUE)

### Próximo paso al retomar
> ✅ **El sistema multi-marca está TERMINADO.**  
> El siguiente trabajo es **contenido de Sport**: subir productos, categorías y armar el HomeContent de Sport desde el panel admin (`/admin → selector Sport`).  
> Cuando estén listos, desactivar el Coming Soon desde el Admin Home de Sport.

---

> **⚠️ REGLA CLAVE**: Todo el trabajo se hace de forma **LOCAL**. No se deployea a producción/Vercel/Render hasta que el usuario diga explícitamente "deployar a la nube". Si retomo en una sesión nueva, debo recordar esta regla inmediatamente.

---

## Resumen Ejecutivo de la Auditoría

Audité el RFC producido por ChatGPT/Gemini/Grok contra el código real del proyecto. Hallazgos principales:

1. **El proyecto NO tiene capa Repository** — usa Controller → Service → Model (2 capas, no 4). Agregar Repository sería over-engineering innecesario para este proyecto.
2. **No existe campo `marca` ni `brandId`** en ningún modelo — todo es single-brand hoy. No hay migración de datos legacy, solo agregar campo nuevo.
3. **Auth es simple** — un solo `isAdmin: Boolean` en User, sin roles. El RFC propone RBAC con 3 roles. No tiene sentido ahora; se deja para el futuro.
4. **No hay tests** — el RFC pide ≥90% de cobertura. No aplica; se harán pruebas manuales.
5. **MercadoPago** — misma cuenta para ambas marcas (confirmado por el usuario). Un solo `MP_ACCESS_TOKEN`.
6. **Costos de envío** — iguales para ambas marcas.
7. **Review** — modelo existente pero básico (sin relación a producto, solo fotos). Se le agrega `brandId` como a todos.
8. **El frontend usa Vite + React Router 7** (confirmado), CSS vanilla con custom properties (perfecto para tematización por marca).

> [!IMPORTANT]
> El RFC en general **sirve como guía conceptual**, pero necesita **adaptaciones grandes** porque asume una arquitectura más compleja que la real. Voy a simplificarlo a lo que el proyecto realmente necesita.

---

## Respuestas a los Huecos del RFC

| Hueco | Resolución |
|---|---|
| MercadoPago por marca | ✅ Misma cuenta. No hace falta lógica separada de webhook por brand. Solo se agrega `brandId` al Order para saber de qué marca fue la compra. |
| Plan de rollback | Se trabaja local, backup manual de la DB antes de migrar. |
| Entornos dev/staging/prod | No existe separación. Se trabaja todo local hasta completar. |
| Versionado de API | No se versiona. Las rutas siguen como `/api/products`. Se agrega `?brand=` como query param. |
| Reviews | Modelo existe pero básico. Se le agrega `brandId`, queda dentro del alcance. |
| DECISIONS.md | No existe. Se crea al inicio. |

---

## Decisiones de Diseño Confirmadas

- **Nombre del campo**: `brand` (ObjectId) en todos los modelos — nunca `marca`, `tienda`, `store`.
- **Logo de Looser Sport**: la imagen adjuntada por el usuario (gorra roja con llamas + lentes Oakley).
- **Paleta de Sport**: igual que Fit → blanco con tonos grisáceos oscuros. Misma familia de colores.
- **Ruteo**: Fit en `/`, Sport en `/sport/...` (por SEO y enlaces directos).
- **Carrito**: separado por marca (un carrito para Fit, otro para Sport).

---

# LAS 8 SECCIONES DE IMPLEMENTACIÓN

Cada sección es **independiente y autocontenida**. Al terminar cada una, el proyecto debe seguir funcionando igual que antes + lo nuevo.

---

## SECCIÓN 1 — Fundaciones: Modelo Brand + Constantes + DECISIONS.md
**Estimación**: ~30 min de trabajo del agente  
**Archivos a tocar**: 5 nuevos, 0 modificados  
**Riesgo de romper algo**: CERO (solo agrega archivos nuevos)

### Tareas:
1. Crear `DECISIONS.md` en la raíz del proyecto
2. Crear modelo `Brand.js` en backend con campos definidos.
3. Crear constantes `brands.js` en backend con variables `BRAND_SYSTEM`.
4. Crear script de seed `seed-brands.js` en backend.
5. Crear constantes de brand en frontend `brandConfig.js`.

---

## SECCIÓN 2 — Backend: agregar `brand` a todos los modelos existentes
**Estimación**: ~45 min  
**Archivos a modificar**: 5 modelos existentes  
**Riesgo**: BAJO (el campo es `required: false` temporalmente)

### Tareas:
1. Agregar campo `brand` referenciando a `Brand` en todos los esquemas (`Product`, `Category`, `Order`, `HomeContent`, `Review`).
2. Crear índices compuestos requeridos (por brandId + slug, etc).
3. Crear y ejecutar script de migración `migrate-add-brand.js`.
4. Después de migrar, cambiar a `required: true`.

---

## SECCIÓN 3 — Backend: Middleware detectBrand + actualizar Services
**Estimación**: ~60 min  
**Archivos nuevos**: 2 | **Archivos a modificar**: ~8  
**Riesgo**: MEDIO (se tocan los services y controllers)

### Tareas:
1. Crear `brandMiddleware.js` que intercepte y asigne `req.brand`.
2. Registrar el middleware en `index.js`.
3. Actualizar todos los servicios (`product`, `category`, `home`, `order`) para incluir filtros por marca.
4. Crear `brandRoutes.js` y registrarlo.
5. Actualizar el webhook de MercadoPago para funcionar de manera cross-brand sin problemas.

---

## SECCIÓN 4 — Frontend: BrandProvider + Ruteo Multi-Marca
**Estimación**: ~60 min  
**Archivos nuevos**: 3 | **Archivos a modificar**: ~6  
**Riesgo**: MEDIO-ALTO (se modifica App.jsx y el routing)

### Tareas:
1. Crear context `BrandContext.jsx` para el frontend.
2. Modificar `App.jsx` para instanciar rutas Fit (en `/`) y Sport (en `/sport/`).
3. Modificar `api.js` para enviar el tag de marca en peticiones.
4. Separar los carritos en localStorage basados en la marca actual.

---

## SECCIÓN 5 — Frontend: UI de Sport (Navbar, Logo, Home diferenciada)
**Estimación**: ~90 min  
**Archivos a modificar**: ~8 componentes  
**Riesgo**: BAJO (son cambios visuales)

### Tareas:
1. Colocar el Logo en `public/`.
2. Modificar el Navbar, Footer y Componente Home para que rendericen distinto según la marca activa obtenida del BrandContext.
3. Ajustar `global.css` para aplicar variables dinámicas.

---

## SECCIÓN 6 — Admin: Selector de Marca + Filtrado por Brand
**Estimación**: ~90 min  
**Archivos a modificar**: ~10 (todos los componentes de Admin)  
**Riesgo**: MEDIO (se toca el panel de admin)

### Tareas:
1. Agregar selector de marcas al sidebar del admin.
2. Modificar todas las vistas del panel de control para que operen (lean y graben) únicamente sobre la marca seleccionada activamente.

---

## SECCIÓN 7 — Migración de Datos + Coming Soon de Sport
**Estimación**: ~30 min  
**Archivos nuevos**: 1 script | **Archivos a modificar**: 2  
**Riesgo**: BAJO (script idempotente + funcionalidad existente)

### Tareas:
1. Verificar todo nuevamente.
2. Crear un registro de HomeContent válido para Sport pero puesto en "Coming Soon".
3. Validar que la UI de Coming Soon aisla correctamente solo la tienda Sport pero deja operativa la tienda Fit.
4. Script de validación final de BD (sin registros huerfanos).

---

## SECCIÓN 8 — Pulido Final, Testing Manual y Verificación
**Estimación**: ~60 min  
**Archivos a modificar**: varios (bugfixes)  
**Riesgo**: BAJO

### Tareas:
1. Testing e2e.
2. Validar que la tienda original no tuvo regresiones en compatibilidad (links viejos funcionales).
3. Documentar en el `DECISIONS.md`.

---

## Protocolo de Continuidad entre Sesiones

> [!CAUTION]
> **Al inicio de cada sesión nueva, debo:**
> 1. Recordar que TODO es LOCAL — no deployar a producción
> 2. Leer este plan para saber en qué sección estamos
> 3. Verificar el último mini-resumen de progreso (si existe) en un archivo `.progress.md` en la raiz o acá mismo.
> 4. Continuar desde donde se quedó
