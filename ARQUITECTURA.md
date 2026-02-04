# 🏗️ Arquitectura Técnica - Accesorios LUI

## 📐 Visión General

**Accesorios LUI** es una aplicación web full-stack construida con arquitectura moderna basada en componentes, siguiendo el patrón de API REST y separación de responsabilidades.

---

## 🎯 Stack Tecnológico Completo

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Routing**: App Router (arquitectura moderna de Next.js)
- **Lenguaje**: TypeScript 5
- **Estilos**: Tailwind CSS 3.4
- **State Management**: React Context API
- **HTTP Client**: Fetch API nativa
- **Optimización de imágenes**: next/image + Cloudinary

### Backend
- **Runtime**: Node.js (Next.js API Routes)
- **Framework API**: Next.js 14 Route Handlers
- **Base de datos**: MongoDB Atlas
- **ODM**: Mongoose 8.2
- **Autenticación**: JWT (jsonwebtoken)
- **Hashing**: bcryptjs

### Cloud Services
- **Hosting**: Vercel (recomendado)
- **Base de datos**: MongoDB Atlas
- **Almacenamiento de imágenes**: Cloudinary
- **CDN**: Automático con Vercel + Cloudinary

---

## 📂 Arquitectura de Carpetas

```
src/
├── app/                          # Next.js App Router
│   ├── api/                      # Backend API Routes
│   │   ├── auth/
│   │   │   ├── login/route.ts    # POST /api/auth/login
│   │   │   └── register/route.ts # POST /api/auth/register
│   │   ├── categorias/
│   │   │   ├── route.ts          # GET, POST /api/categorias
│   │   │   └── [id]/route.ts     # GET, PUT, DELETE /api/categorias/:id
│   │   ├── productos/
│   │   │   ├── route.ts          # GET, POST /api/productos
│   │   │   └── [id]/route.ts     # GET, PUT, DELETE /api/productos/:id
│   │   └── upload/route.ts       # POST /api/upload
│   ├── admin/                    # Panel administración (client-side)
│   │   ├── layout.tsx            # Layout con AuthProvider
│   │   ├── page.tsx              # Dashboard admin
│   │   ├── login/page.tsx        # Login admin
│   │   ├── productos/
│   │   │   ├── page.tsx          # Lista productos (admin)
│   │   │   └── [id]/page.tsx     # Form crear/editar producto
│   │   └── categorias/page.tsx   # Gestión categorías
│   ├── productos/                # Catálogo público
│   │   ├── page.tsx              # Lista productos (público)
│   │   └── [id]/page.tsx         # Detalle producto
│   ├── layout.tsx                # Root layout (Navbar + Footer)
│   ├── page.tsx                  # Home
│   └── globals.css               # Estilos globales Tailwind
├── components/                   # Componentes reutilizables
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── ProductCard.tsx
│   ├── Filters.tsx
│   └── Loading.tsx
├── contexts/
│   └── AuthContext.tsx           # Contexto autenticación global
├── lib/                          # Utilidades y configuración
│   ├── mongodb.ts                # Singleton conexión MongoDB
│   ├── cloudinary.ts             # Configuración y helpers Cloudinary
│   ├── auth.ts                   # JWT utilities (sign, verify)
│   └── api-utils.ts              # Helpers respuestas API
└── models/                       # Mongoose schemas
    ├── Producto.ts
    ├── Categoria.ts
    └── Usuario.ts
```

---

## 🔄 Flujo de Datos

### 1. Autenticación

```
[Cliente] 
   ↓ POST /api/auth/login {email, password}
[API Route]
   ↓ Busca usuario en MongoDB
[MongoDB]
   ↓ Usuario encontrado
[bcrypt]
   ↓ Verifica password
[JWT]
   ↓ Genera token
[Cliente]
   ↓ Almacena en localStorage
[AuthContext]
   ↓ Estado global autenticado
```

### 2. CRUD Productos (Admin)

```
[Admin Panel]
   ↓ Acción (crear/editar/eliminar)
[AuthContext]
   ↓ Verifica token
[API Route]
   ↓ Middleware verifyAuth()
[MongoDB]
   ↓ Operación CRUD
[Cloudinary] (si hay imágenes)
   ↓ Upload/delete imágenes
[Response]
   ↓ JSON {success, data/message}
[Cliente]
   ↓ Actualiza UI
```

### 3. Consulta Pública

```
[Usuario público]
   ↓ GET /api/productos?filters
[API Route]
   ↓ Sin autenticación requerida
[MongoDB]
   ↓ Query con filtros
   ↓ Populate categoría
[Response]
   ↓ JSON {productos, pagination}
[Cliente]
   ↓ Renderiza ProductCard
```

---

## 🗄️ Modelos de Datos (Schemas)

### Producto

```typescript
{
  _id: ObjectId,
  nombre: String (required, max 100),
  descripcion: String (required, max 500),
  precio: Number (required, min 0),
  material: String (required),
  tipo: Enum ['anillo', 'collar', 'pulsera', ...],
  categoria: ObjectId (ref: 'Categoria'),
  imagenes: Array<String> (max 5 URLs),
  activo: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}

// Índices:
- {nombre: 'text', descripcion: 'text'}  // Búsqueda full-text
- {tipo: 1, activo: 1}
- {categoria: 1, activo: 1}
- {precio: 1}
```

### Categoría

```typescript
{
  _id: ObjectId,
  nombre: String (required, unique, max 50),
  descripcion: String (optional, max 200),
  slug: String (required, unique, lowercase),
  activo: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}

// Pre-save hook: genera slug automáticamente
```

### Usuario

```typescript
{
  _id: ObjectId,
  email: String (required, unique, lowercase),
  password: String (required, min 6, hashed),
  nombre: String (required),
  rol: Enum ['admin'] (default: 'admin'),
  activo: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}

// Pre-save hook: hashea password con bcrypt
// Method: comparePassword(candidatePassword)
```

---

## 🔐 Sistema de Autenticación

### JWT Token Structure

```json
{
  "userId": "507f1f77bcf86cd799439011",
  "email": "admin@accesoriolui.com",
  "rol": "admin",
  "iat": 1675420800,
  "exp": 1676025600
}
```

### Flujo de Autenticación

1. **Login**: Usuario envía credenciales
2. **Verificación**: Backend valida con bcrypt
3. **Token**: Genera JWT válido por 7 días
4. **Storage**: Cliente guarda en localStorage
5. **Requests**: Incluye en header `Authorization: Bearer <token>`
6. **Middleware**: `verifyAuth()` valida token en rutas protegidas

### Rutas Protegidas

```typescript
// Requieren token JWT válido:
POST   /api/categorias
PUT    /api/categorias/:id
DELETE /api/categorias/:id
POST   /api/productos
PUT    /api/productos/:id
DELETE /api/productos/:id
POST   /api/upload

// Públicas (sin autenticación):
GET    /api/categorias
GET    /api/productos
GET    /api/productos/:id
POST   /api/auth/login
```

---

## 📸 Sistema de Imágenes

### Cloudinary Integration

**Configuración**:
```typescript
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
```

**Upload Flow**:
```
[Cliente]
   ↓ Selecciona imagen (file input o drag & drop)
[CldUploadWidget]
   ↓ Upload directo a Cloudinary (cliente → Cloudinary)
[Cloudinary]
   ↓ Procesa y optimiza
   ↓ Transformaciones: max 1000x1000, quality auto, format auto
[Response]
   ↓ {secure_url: "https://res.cloudinary.com/..."}
[Form State]
   ↓ Agrega URL al array imagenes[]
[Submit]
   ↓ POST /api/productos con URLs
[MongoDB]
   ↓ Guarda solo URLs (no binarios)
```

**Optimizaciones**:
- **Formato**: WebP automático (navegadores modernos)
- **Calidad**: `auto:good`
- **Dimensiones**: Max 1000x1000px
- **CDN**: Entrega global optimizada

---

## 🚀 Optimizaciones de Performance

### Server Side
- ✅ Conexión MongoDB singleton (reutiliza conexión)
- ✅ Índices en MongoDB para queries frecuentes
- ✅ Paginación en listados (limit: 12 por defecto)
- ✅ Populate solo campos necesarios
- ✅ Lean queries cuando no se necesitan métodos Mongoose

### Client Side
- ✅ Next.js Image Component (lazy loading + optimización)
- ✅ Code splitting automático (App Router)
- ✅ React Context para estado global (evita prop drilling)
- ✅ Loading states en todas las operaciones async
- ✅ Debounce en búsquedas (opcional, mejorable)

### Imágenes
- ✅ CDN de Cloudinary (distribución global)
- ✅ Formato WebP/AVIF automático
- ✅ Compresión automática
- ✅ Thumbnails on-the-fly

---

## 🔍 Sistema de Filtros y Búsqueda

### Query Parameters Soportados

```
GET /api/productos?<params>

Parámetros:
- busqueda: String         // Full-text search (nombre + descripción)
- categoria: ObjectId      // Filtrar por categoría
- tipo: String             // Filtrar por tipo (anillo, collar, etc.)
- material: String         // Regex case-insensitive
- precioMin: Number        // Precio mínimo
- precioMax: Number        // Precio máximo
- page: Number (default 1) // Paginación
- limit: Number (default 12)
- sort: String (default '-createdAt')  // Ordenamiento
```

### Ejemplo de Query

```javascript
// Frontend
const params = new URLSearchParams({
  tipo: 'anillo',
  precioMin: '10',
  precioMax: '50',
  page: '1',
  limit: '12'
});

// Backend construye query
const filtros = {
  activo: true,
  tipo: 'anillo',
  precio: { $gte: 10, $lte: 50 }
};

const productos = await Producto.find(filtros)
  .populate('categoria')
  .sort('-createdAt')
  .skip(0)
  .limit(12);
```

---

## 🎨 Sistema de Estilos

### Tailwind CSS Configuration

```typescript
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      primary: {
        // Pink/Rose theme
        50: '#fdf2f8',
        100: '#fce7f3',
        // ...
        600: '#db2777',  // Color principal
        700: '#be185d',
      }
    }
  }
}
```

### Clases Utilitarias Custom

```css
/* globals.css */
.btn-primary {
  @apply px-6 py-2 bg-primary-600 text-white rounded-lg 
         hover:bg-primary-700 transition-colors font-medium;
}

.input-field {
  @apply w-full px-4 py-2 border border-gray-300 rounded-lg 
         focus:ring-2 focus:ring-primary-500 focus:border-transparent;
}

.card {
  @apply bg-white rounded-lg shadow-md p-6;
}
```

---

## 🌐 Deployment

### Vercel Configuration

**Automatic**:
- Build Command: `next build`
- Output Directory: `.next`
- Install Command: `npm install`
- Framework Preset: Next.js

**Environment Variables** (Production):
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=production_secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### Build Process

```bash
1. npm install                    # Instala dependencias
2. next build                     # Build producción
   ├── Compila TypeScript
   ├── Optimiza assets
   ├── Genera páginas estáticas
   └── Server-side functions
3. Deploy a Vercel Edge Network
```

---

## 🔒 Seguridad

### Implementadas

✅ **Passwords hasheadas**: bcrypt con salt rounds 10
✅ **JWT con expiración**: 7 días
✅ **Variables de entorno**: Secretos no en código
✅ **Validación de datos**: Mongoose schemas
✅ **CORS**: Configurado por Next.js
✅ **HTTPS**: Forzado en producción (Vercel)
✅ **Rate limiting**: Implícito con Vercel
✅ **SQL Injection**: No aplica (MongoDB)
✅ **XSS**: React escapa automáticamente

### Mejoras Futuras (Opcional)

- [ ] Refresh tokens
- [ ] Rate limiting explícito
- [ ] 2FA para admin
- [ ] Logs de auditoría
- [ ] Encriptación de datos sensibles

---

## 📊 Escalabilidad

### Actual

- **Usuarios concurrentes**: ~1000 (Vercel hobby plan)
- **Productos**: Ilimitado (depende de MongoDB Atlas)
- **Imágenes**: 25GB storage / 25GB bandwidth (Cloudinary free)
- **Requests**: Ilimitado en Vercel

### Escalar

**Horizontal**:
- Vercel escala automáticamente (serverless)
- MongoDB Atlas: Upgrade a M2/M5 ($9-$25/mes)
- Cloudinary: Upgrade a plan pago ($89/mes)

**Optimizaciones**:
- Implementar Redis para cache
- CDN adicional para assets estáticos
- Database sharding si >100k productos

---

## 🧪 Testing (No implementado, roadmap)

```typescript
// Ejemplo estructura futura
tests/
├── unit/
│   ├── models/
│   ├── lib/
│   └── components/
├── integration/
│   └── api/
└── e2e/
    └── admin-flow.spec.ts
```

---

## 📝 Convenciones de Código

### TypeScript
- **Interfaces**: PascalCase con prefijo `I` (ej: `IProducto`)
- **Types**: PascalCase sin prefijo
- **Variables**: camelCase
- **Constantes**: UPPER_SNAKE_CASE
- **Componentes**: PascalCase

### Archivos
- **Componentes React**: PascalCase.tsx
- **Utilidades**: kebab-case.ts
- **API Routes**: route.ts (Next.js convention)

### Commits (Sugerido)
```
feat: Nueva funcionalidad
fix: Corrección de bug
docs: Cambios en documentación
style: Cambios de formato
refactor: Refactorización de código
test: Agregar/modificar tests
chore: Tareas de mantenimiento
```

---

## 🔄 API REST Endpoints

### Autenticación

```
POST /api/auth/login
Body: {email, password}
Response: {token, usuario}

POST /api/auth/register
Body: {email, password, nombre}
Response: {usuario}
```

### Categorías

```
GET /api/categorias
Response: {categorias[]}

POST /api/categorias [AUTH]
Body: {nombre, descripcion?}
Response: {categoria}

GET /api/categorias/:id
Response: {categoria}

PUT /api/categorias/:id [AUTH]
Body: {nombre?, descripcion?, activo?}
Response: {categoria}

DELETE /api/categorias/:id [AUTH]
Response: {message}
```

### Productos

```
GET /api/productos?filters
Response: {productos[], pagination}

POST /api/productos [AUTH]
Body: {nombre, descripcion, precio, material, tipo, categoria, imagenes[], activo?}
Response: {producto}

GET /api/productos/:id
Response: {producto}

PUT /api/productos/:id [AUTH]
Body: {campos a actualizar}
Response: {producto}

DELETE /api/productos/:id [AUTH]
Response: {message}
```

### Upload

```
POST /api/upload [AUTH]
Body: {file: base64, folder?}
Response: {url}
```

---

## 🎓 Patrones de Diseño Utilizados

1. **Singleton**: Conexión MongoDB (lib/mongodb.ts)
2. **Factory**: Context Provider (AuthContext)
3. **Repository**: Models (abstracción de datos)
4. **Middleware**: verifyAuth (API protection)
5. **Component Composition**: React components
6. **REST API**: Endpoints estructurados

---

## 📚 Referencias

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [MongoDB Best Practices](https://www.mongodb.com/developer/products/mongodb/mongodb-schema-design-best-practices/)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

**Última actualización**: Febrero 2026
**Versión**: 1.0.0
