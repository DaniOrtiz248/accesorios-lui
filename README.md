# 💍 Accesorios LUI

> Sistema completo de catálogo web con panel de administración para negocio de accesorios

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://www.mongodb.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Images-blue)](https://cloudinary.com/)

---

## ✨ Características

### 🌐 Catálogo Público
- ✅ Diseño moderno y responsive (móvil, tablet, desktop)
- ✅ Filtros avanzados (categoría, tipo, material, precio)
- ✅ Búsqueda en tiempo real
- ✅ Galería de imágenes por producto
- ✅ Enlaces directos a WhatsApp e Instagram
- ✅ SEO optimizado

### 👩‍💼 Panel de Administración
- ✅ Login seguro con JWT
- ✅ Gestión completa de productos (CRUD)
- ✅ Gestión de categorías
- ✅ Upload de imágenes drag & drop
- ✅ Activar/desactivar productos
- ✅ 100% responsive (usar desde móvil)
- ✅ Interfaz intuitiva para no-técnicos

### 🎨 Características Técnicas
- ✅ Next.js 14 con App Router
- ✅ TypeScript para código robusto
- ✅ Tailwind CSS para estilos modernos
- ✅ MongoDB + Mongoose para base de datos
- ✅ Cloudinary para almacenamiento de imágenes
- ✅ JWT para autenticación segura
- ✅ API REST completa
- ✅ Optimización automática de imágenes

---

## 🚀 Inicio Rápido

### 1️⃣ Clonar e Instalar

```bash
cd c:\Users\User\Documents\sami
npm install
```

### 2️⃣ Configurar Variables de Entorno

Edita el archivo `.env.local` con tus credenciales:

```env
MONGODB_URI=tu_connection_string_aqui
JWT_SECRET=tu_secreto_jwt
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

👉 **Ver [INSTALACION.md](INSTALACION.md) para guía detallada paso a paso**

### 3️⃣ Ejecutar

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) 🎉

---

## 📚 Documentación

- **[📖 INSTALACION.md](INSTALACION.md)** - Guía completa de instalación y configuración
- **[👥 GUIA_USO.md](GUIA_USO.md)** - Manual de uso para administradores (tu suegra)

---

## 🗂️ Estructura del Proyecto

```
accesorios-lui/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # Backend API Routes
│   │   │   ├── auth/           # Autenticación (login, register)
│   │   │   ├── categorias/     # CRUD categorías
│   │   │   ├── productos/      # CRUD productos
│   │   │   └── upload/         # Upload de imágenes
│   │   ├── admin/              # Panel de administración
│   │   │   ├── categorias/     # Gestión categorías
│   │   │   ├── productos/      # Gestión productos
│   │   │   ├── login/          # Login admin
│   │   │   └── page.tsx        # Dashboard
│   │   ├── productos/          # Catálogo público
│   │   │   ├── [id]/           # Detalle producto
│   │   │   └── page.tsx        # Listado productos
│   │   ├── layout.tsx          # Layout principal
│   │   ├── page.tsx            # Home
│   │   └── globals.css         # Estilos globales
│   ├── components/             # Componentes React
│   │   ├── Navbar.tsx          # Barra de navegación
│   │   ├── Footer.tsx          # Footer
│   │   ├── ProductCard.tsx     # Tarjeta de producto
│   │   ├── Filters.tsx         # Filtros de búsqueda
│   │   └── Loading.tsx         # Indicador de carga
│   ├── contexts/               # React Contexts
│   │   └── AuthContext.tsx     # Contexto de autenticación
│   ├── lib/                    # Utilidades y configuración
│   │   ├── mongodb.ts          # Conexión a MongoDB
│   │   ├── cloudinary.ts       # Configuración Cloudinary
│   │   ├── auth.ts             # Utilidades JWT
│   │   └── api-utils.ts        # Helpers para API
│   └── models/                 # Mongoose Models
│       ├── Producto.ts         # Modelo Producto
│       ├── Categoria.ts        # Modelo Categoría
│       └── Usuario.ts          # Modelo Usuario
├── public/                     # Archivos estáticos
├── .env.local                  # Variables de entorno (local)
├── .env.example                # Ejemplo de variables
├── next.config.js              # Configuración Next.js
├── tailwind.config.ts          # Configuración Tailwind
├── tsconfig.json               # Configuración TypeScript
├── package.json                # Dependencias
├── README.md                   # Este archivo
├── INSTALACION.md              # Guía de instalación
└── GUIA_USO.md                 # Manual de usuario
```

---

## 🔐 Acceso al Panel Admin

**URL**: `https://tu-sitio.vercel.app/admin/login`

**Credenciales iniciales**:
- Email: `admin@accesoriolui.com`
- Password: `admin123` (cámbialo después del primer login)

---

## 🌐 Deploy en Vercel (Gratis)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel

# Configurar variables de entorno en dashboard de Vercel
# Luego redeploy
vercel --prod
```

**Costos**:
- Vercel: **GRATIS** ✅
- MongoDB Atlas: **GRATIS** (hasta 512MB) ✅
- Cloudinary: **GRATIS** (hasta 25GB) ✅
- **Total: $0/mes** 🎉

---

## 📱 Uso Móvil

El panel admin funciona perfectamente en móviles:
- ✅ Upload de fotos desde cámara o galería
- ✅ Interfaz táctil optimizada
- ✅ Todos los formularios responsive
- ✅ Gestión completa desde cualquier lugar

---

## 🔧 Tecnologías Utilizadas

| Tecnología | Propósito | Versión |
|-----------|-----------|---------|
| Next.js | Framework React | 14.2.0 |
| TypeScript | Tipado estático | 5.x |
| Tailwind CSS | Estilos | 3.4.1 |
| MongoDB | Base de datos | Atlas |
| Mongoose | ODM para MongoDB | 8.2.0 |
| Cloudinary | Almacenamiento de imágenes | 2.0.0 |
| JWT | Autenticación | 9.0.2 |
| bcryptjs | Hash de contraseñas | 2.4.3 |

---

## 📊 Modelos de Datos

### Producto
```typescript
{
  nombre: string
  descripcion: string
  precio: number
  material: string
  tipo: 'anillo' | 'collar' | 'pulsera' | ...
  categoria: ObjectId
  imagenes: string[]
  activo: boolean
}
```

### Categoría
```typescript
{
  nombre: string
  descripcion?: string
  slug: string
  activo: boolean
}
```

### Usuario (Admin)
```typescript
{
  email: string
  password: string (hashed)
  nombre: string
  rol: 'admin'
  activo: boolean
}
```

---

## 🛠️ Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Iniciar en producción
npm start

# Linter
npm run lint
```

---

## 🔒 Seguridad

- ✅ Contraseñas hasheadas con bcrypt
- ✅ JWT para autenticación
- ✅ Variables de entorno para secretos
- ✅ Validación de datos en backend
- ✅ Protección de rutas admin

---

## 🎨 Personalización

### Colores
Edita `tailwind.config.ts` para cambiar el esquema de colores:

```typescript
colors: {
  primary: {
    500: '#ec4899', // Rosa por defecto
    600: '#db2777',
    // ...
  }
}
```

### Links Sociales
Actualiza en:
- `src/components/Navbar.tsx`
- `src/components/Footer.tsx`
- `src/app/productos/[id]/page.tsx`

---

## 🐛 Problemas Comunes

Ver [INSTALACION.md](INSTALACION.md#-problemas-comunes) para soluciones.

---

## 📈 Próximas Mejoras (Opcional)

- [ ] Sistema de estadísticas de productos más vistos
- [ ] Exportar catálogo a PDF
- [ ] Múltiples usuarios admin
- [ ] Sistema de descuentos/ofertas
- [ ] Integración con pasarela de pagos
- [ ] Notificaciones push
- [ ] App móvil nativa

---

## 📄 Licencia

Este proyecto fue creado para uso personal de **Accesorios LUI**.

---

## 👨‍💻 Soporte

Para soporte técnico o consultas, contacta al desarrollador.

---

## 🎉 ¡Listo para usar!

El sistema está 100% funcional y listo para que tu suegra empiece a gestionar su negocio de accesorios.

**Siguiente paso**: Lee [INSTALACION.md](INSTALACION.md) para configurar todo paso a paso.

---

Hecho con ❤️ para **Accesorios LUI**
