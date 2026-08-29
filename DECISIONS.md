# DECISIONS.md — Looser Fit / Looser Sport

Registro de todas las decisiones arquitectónicas tomadas durante la implementación multi-marca.
Cada decisión incluye contexto, alternativas descartadas y razón final.
Formato: `[FECHA] — Categoría — Decisión`

---

## [2026-08-02] — Arquitectura — Modelo de tenancy multi-marca

**Decisión:** Shared Database + Shared Collections + Document Discriminator.
Un único campo `brand` (ObjectId) en cada documento discrimina a qué marca pertenece.

**Alternativas descartadas:**
- Base de datos separada por marca → complejidad de operación innecesaria.
- Colecciones separadas por marca → duplicación de código innecesaria.

**Razón final:** El proyecto es pequeño. Compartir todo y discriminar por `brand` es el balance correcto entre simplicidad operativa y extensibilidad futura.

---

## [2026-08-02] — Backend — Nombre del campo de marca

**Decisión:** El campo se llama `brand` (tipo ObjectId → ref `Brand`). 
Nunca `marca`, `brandId`, `tienda`, `store`, `tenant`.

**Razón final:** Consistencia con el RFC y convención en inglés (regla del AGENTS.md).

---

## [2026-08-02] — Backend — Capas de arquitectura

**Decisión:** Se mantiene la arquitectura actual de 2 capas: `Controller → Service → Model`.
**NO** se agrega capa Repository como proponía el RFC.

**Razón final:** El RFC fue escrito sin ver el código real. El proyecto ya tiene Services funcionando correctamente. Agregar Repository sería over-engineering innecesario para el tamaño del proyecto.

---

## [2026-08-02] — Backend — Versionado de API

**Decisión:** Las rutas NO se versionan. Siguen como `/api/products`, `/api/orders`, etc.
El discriminador de marca se pasa como query param: `?brand=fit` o `?brand=sport`.

**Razón final:** No hay clientes externos que consuman esta API. El único consumidor es el propio frontend. Versionar ahora añade complejidad sin beneficio.

---

## [2026-08-02] — Backend — Fallback de marca

**Decisión:** Si una petición llega sin `?brand=`, se asume la marca `fit` (Looser Fit).
Se loguea un warning en consola pero no se rechaza la petición.

**Razón final:** Compatibilidad hacia atrás con links/bookmarks existentes.

---

## [2026-08-02] — Pagos — MercadoPago

**Decisión:** Misma cuenta y mismo `MP_ACCESS_TOKEN` para Looser Fit y Looser Sport.
El campo `brand` en la Orden identifica de qué marca fue la compra para reportes internos.

**Razón final:** Confirmado por el dueño del proyecto. No se necesita lógica separada de webhook por marca.

---

## [2026-08-02] — Envíos — Costos de envío

**Decisión:** Los costos de envío son iguales para ambas marcas.
La lógica de `shippingCost` actual aplica sin cambios a ambas marcas.

**Razón final:** Confirmado por el dueño del proyecto.

---

## [2026-08-02] — Frontend — Ruteo multi-marca

**Decisión:**
- Looser Fit: rutas en `/`, `/tienda`, `/producto/:id`, etc.
- Looser Sport: rutas en `/sport`, `/sport/tienda`, `/sport/producto/:id`, etc.

**Razón final:** SEO independiente para cada marca. Links directos por marca. Propuesta del RFC aprobada.

---

## [2026-08-02] — Frontend — Carritos separados

**Decisión:** Cada marca tiene su propio carrito en localStorage.
- Fit: `looserfit_cart_fit`
- Sport: `looserfit_cart_sport`

**Razón final:** Un usuario no debería mezclar productos de Fit y Sport en el mismo carrito. Son tiendas separadas.

---

## [2026-08-02] — Frontend — Paleta de colores

**Decisión:** Ambas marcas usan la misma paleta base (blanco con tonos grisáceos oscuros).
La infraestructura de CSS variables dinámicas se implementa para extensibilidad futura.

**Razón final:** Confirmado por el dueño del proyecto. No hay diferencia visual de paleta en esta versión.

---

## [2026-08-02] — Auth / Roles — RBAC

**Decisión:** NO se implementa RBAC en esta versión.
El sistema de auth sigue siendo `isAdmin: Boolean` en el modelo `User`.

**Razón final:** El RFC proponía roles `superadmin`/`brandadmin`/`editor` pero el proyecto actual solo tiene un admin. Implementar RBAC ahora sería over-engineering. Se deja documentado para el futuro.

---

## [2026-08-02] — Testing

**Decisión:** No se implementan tests automatizados en esta fase.
Las verificaciones son manuales (E2E en local).

**Razón final:** El proyecto no tenía tests antes. El RFC pedía ≥90% de cobertura sobre módulos nuevos, pero dado el estado actual del proyecto, implementar testing completo excede el alcance acordado.

---

## [2026-08-02] — Deploy

**Decisión:** TODO el trabajo se hace en LOCAL.
No se deployea a producción (Vercel/Render) hasta que el dueño del proyecto lo indique explícitamente.

---

## Decisiones pendientes / por tomar

- [ ] ¿Se va a usar un subdominio para Sport (`sport.looserfit.com`) o un path (`looserfit.com/sport`)?
- [ ] ¿Se crea un logo de Looser Sport para la tienda o se usa el ícono adjunto provisionalmente?
