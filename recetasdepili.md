
# Recetas de Pili — Contexto del proyecto

## Arquitectura general

Dos frontends independientes que comparten un único backend y una única base de datos MongoDB:

```
recetasdepili (frontend)  ──┐
                             ├──► https://recetarium-back.onrender.com  (FastAPI)
Recetarium (frontend)     ──┘         │
                                       └──► MongoDB Atlas
                                            mongodb+srv://tervingo:mig.langar.inn@gagnagunnur.okrh1.mongodb.net/recetarium
                                            colección: recetas
```

Las recetas se distinguen por un campo `app_id`:
- Recetarium → `app_id: "recetarium"`
- Recetas de Pili → `app_id: "recetasdepili"`

Los usuarios de administración son compartidos (misma colección `users`, mismo endpoint `/token`).

---

## Backend (compartido, ya desplegado en Render)

**Repositorio:** `C:\Users\j4alo\Dropbox\Eltomalturta\Recetarium\rct-backend\`

**Cambios introducidos para el soporte multi-app:**

- `models/recipe.py` — campo añadido: `app_id: str = "recetarium"` en `RecipeBase`
- `main.py` — CORS ampliado con `recetasdepili.com`, `www.recetasdepili.com`, `localhost:3001`
- `main.py` — `GET /recipes/?app_id=` filtra por app (recetarium también devuelve docs sin app_id para retrocompatibilidad)
- `main.py` — `GET /tags/?app_id=` y `DELETE /tags/{tag}?app_id=` filtran por app
- `main.py` — `POST /recipes/` y `PUT /recipes/{id}` guardan el `app_id` que viene en el body
- `migrate_app_id.py` — script de migración one-shot, **ya ejecutado**: puso `app_id: "recetarium"` en todas las recetas existentes

**Stack:** Python / FastAPI / Motor (async MongoDB) / Pydantic v2 / JWT auth / Cloudinary (imágenes)

---

## Frontend recetasdepili

**Directorio:** `C:\Users\j4alo\Dropbox\Eltomalturta\recetasdepili\frontend\`

**Stack:** Vite 6 + React 19 + JavaScript (sin TypeScript) + pnpm

**Gestión de node_modules:** Mediante `.dropboxignore` (excluye `node_modules/` y `dist/`). Los módulos están físicamente en el directorio pero Dropbox no los sincroniza.

**Comandos:**
```bash
pnpm run dev      # dev server en http://localhost:3001
pnpm run build    # build de producción
pnpm run preview  # previsualizar build
```

### Estructura de ficheros

```
frontend/
├── index.html                  # entrada HTML, carga Font Awesome 6 vía CDN
├── vite.config.js              # Vite config, puerto 3001
├── package.json
├── pnpm-workspace.yaml         # onlyBuiltDependencies: [esbuild]
├── .dropboxignore              # node_modules/ y dist/ excluidos
├── .gitignore
└── src/
    ├── main.jsx                # entrada React (ReactDOM.createRoot)
    ├── App.jsx                 # rutas + layout (Router > AuthProvider > Navbar + SideMenu + main)
    ├── App.css                 # TODO el CSS de la app (paleta borgoña/terracota)
    ├── index.css               # reset body/font
    ├── constants.js            # BACKEND_URL, APP_ID = 'recetasdepili', CATEGORIES
    ├── components/
    │   ├── Navbar.jsx          # barra superior, nombre "Recetas de Pili"
    │   ├── Footer.jsx          # pie de página
    │   ├── SideMenu.jsx        # menú lateral con recetas por categoría
    │   ├── RecipeList.jsx      # página principal, carruseles por categoría
    │   ├── RecipeDetail.jsx    # página de detalle de receta
    │   ├── RecipeForm.jsx      # formulario crear/editar receta (envía app_id: APP_ID)
    │   ├── Login.jsx           # formulario de login
    │   ├── PrivateRoute.jsx    # wrapper de rutas protegidas
    │   ├── UserAdmin.jsx       # gestión de usuarios (solo admin)
    │   ├── CookieBanner.jsx    # banner GDPR
    │   └── CookiePolicy.jsx    # página política de cookies
    ├── contexts/
    │   └── AuthContext.jsx     # contexto auth: isAuthenticated, isAdmin, user, login, logout
    ├── utils/
    │   ├── axios.js            # instancia axios con interceptor que añade ?app_id=recetasdepili a GETs
    │   └── analytics.js       # Google Analytics 4 (TRACKING_ID pendiente de configurar)
    └── styles/
        └── *.css               # stubs vacíos (todo el CSS está en App.css)
```

### Rutas de la app

| Ruta | Componente | Acceso |
|------|-----------|--------|
| `/` | RecipeList | público |
| `/recipes/:id` | RecipeDetail | público |
| `/login` | Login | público |
| `/cookies` | CookiePolicy | público |
| `/new` | RecipeForm | privado |
| `/recipes/:id/edit` | RecipeForm | privado |
| `/admin/users` | UserAdmin | privado |

### Cómo funciona el filtrado por app_id

El interceptor de axios (`utils/axios.js`) añade automáticamente `?app_id=recetasdepili` a **todas** las peticiones GET. Al crear o editar una receta, `RecipeForm.jsx` incluye `app_id: APP_ID` en el body del POST/PUT.

### Paleta de colores (diferenciada de Recetarium)

| Variable CSS | Valor | Uso |
|---|---|---|
| `--primary-color` | `#722f37` | borgoña |
| `--secondary-color` | `#c08070` | terracota |
| `--background-color` | `#5a3a3a` | fondo oscuro cálido |
| `--border-color` | `#e9d4cc` | bordes |

Navbar y footer: `#f5e6dc` (crema cálido). Recetarium usa gris oscuro (#404040).

---

## Pendiente

- [ ] **Configurar GA4:** Sustituir `"G-XXXXXXXXXX"` en `src/utils/analytics.js` por el ID real de Google Analytics para esta propiedad
- [ ] **Añadir recetas:** La BD tiene `app_id: "recetasdepili"` preparado; crear las primeras recetas desde el panel de admin
- [ ] **Dominio y despliegue:** Desplegar el frontend en Netlify/Vercel apuntando a `recetasdepili.com` y añadir ese dominio al CORS del backend si aún no está
- [ ] **Imágenes/logo:** Actualmente la navbar no tiene imagen (Recetarium tenía `/cuchara.jpg` y `/grillo.png`). Se pueden añadir imágenes propias en `frontend/public/`

---

## Dependencias instaladas

```
react 19.2.6          react-dom 19.2.6
react-router-dom 7    axios 1.x
react-toastify 11     react-multi-carousel 2.8
react-ga4 2.1         vite 6  @vitejs/plugin-react 4
```

Instaladas con `pnpm install` (strict-ssl=false por proxy corporativo).
