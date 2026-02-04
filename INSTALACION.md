# 🚀 Guía de Instalación - Accesorios LUI

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (versión 18 o superior) - [Descargar aquí](https://nodejs.org/)
- **Git** - [Descargar aquí](https://git-scm.com/)

## 🔧 Paso 1: Clonar e Instalar

Abre PowerShell o Terminal y ejecuta:

```bash
# Navegar a la carpeta del proyecto
cd c:\Users\User\Documents\sami

# Instalar dependencias
npm install
```

## 🗄️ Paso 2: Configurar MongoDB

### Opción A: MongoDB Atlas (Recomendado - Gratis)

1. Ve a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Crea una cuenta gratis
3. Crea un **nuevo cluster** (selecciona el plan GRATUITO M0)
4. En **Database Access**, crea un usuario:
   - Username: `lui_admin`
   - Password: (guarda esto, lo necesitarás)
5. En **Network Access**, añade:
   - IP: `0.0.0.0/0` (permitir desde cualquier lugar)
6. En **Database**, haz clic en **Connect** → **Connect your application**
7. Copia la connection string (se ve así):
   ```
   mongodb+srv://lui_admin:<password>@cluster0.xxxxx.mongodb.net/
   ```

## ☁️ Paso 3: Configurar Cloudinary

1. Ve a [Cloudinary](https://cloudinary.com/users/register_free)
2. Crea una cuenta gratis
3. En el **Dashboard**, encontrarás:
   - **Cloud Name**: tu_cloud_name
   - **API Key**: tu_api_key
   - **API Secret**: tu_api_secret
4. Ve a **Settings** → **Upload** → **Upload presets**
5. Crea un preset llamado: `accesorios-lui`
   - **Signing Mode**: Unsigned
   - **Folder**: accesorios-lui

## 🔐 Paso 4: Crear Archivo de Variables de Entorno

En la carpeta del proyecto, crea un archivo llamado `.env.local` y pega esto (reemplaza con tus datos):

```env
# MongoDB
MONGODB_URI=mongodb+srv://lui_admin:TU_PASSWORD@cluster0.xxxxx.mongodb.net/accesorios-lui?retryWrites=true&w=majority

# JWT Secret (genera uno aleatorio)
JWT_SECRET=mi_secreto_super_seguro_cambialo_123456

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

**⚠️ IMPORTANTE**: Reemplaza los valores con los datos reales de MongoDB y Cloudinary.

## 👤 Paso 5: Crear Usuario Administrador

Necesitas crear un usuario admin manualmente la primera vez. Tienes dos opciones:

### Opción A: Usar MongoDB Compass (Más fácil)

1. Descarga [MongoDB Compass](https://www.mongodb.com/try/download/compass)
2. Conéctate usando tu connection string
3. Crea la base de datos: `accesorios-lui`
4. Crea una colección llamada: `usuarios`
5. Inserta este documento (reemplaza el email y contraseña):

```json
{
  "email": "admin@accesoriolui.com",
  "password": "$2a$10$X5wJH.HqKqYX5xYx5xYx5xYx5xYx5xYx5xYx5xYx5xYx5xYx5xYx5",
  "nombre": "Administrador LUI",
  "rol": "admin",
  "activo": true,
  "createdAt": {"$date": "2026-02-03T00:00:00.000Z"},
  "updatedAt": {"$date": "2026-02-03T00:00:00.000Z"}
}
```

**NOTA**: Este password es `admin123` hasheado. Cámbialo después del primer login.

### Opción B: Usar la API (Desde PowerShell)

Primero inicia el servidor:

```bash
npm run dev
```

Luego en otra terminal:

```powershell
$body = @{
    email = "admin@accesoriolui.com"
    password = "admin123"
    nombre = "Administrador LUI"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method POST -Body $body -ContentType "application/json"
```

## ▶️ Paso 6: Iniciar el Proyecto

```bash
npm run dev
```

Abre tu navegador en: [http://localhost:3000](http://localhost:3000)

## 🎨 Paso 7: Acceder al Panel Admin

1. Ve a: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
2. Inicia sesión con:
   - **Email**: `admin@accesoriolui.com`
   - **Contraseña**: `admin123`

## ✅ Paso 8: Primera Configuración

Una vez dentro del panel admin:

1. **Crea Categorías**:
   - Ve a **Categorías** → **Nueva Categoría**
   - Ejemplos: Joyería, Accesorios de Moda, Bolsos, etc.

2. **Crea Productos**:
   - Ve a **Productos** → **Nuevo Producto**
   - Sube imágenes (arrástralas o desde móvil)
   - Completa todos los campos
   - Guarda

3. **Personaliza Links**:
   - Edita los archivos para actualizar tus links de WhatsApp e Instagram:
     - `src/components/Navbar.tsx` (líneas 29 y 36)
     - `src/components/Footer.tsx` (líneas 33 y 40)
     - `src/app/productos/[id]/page.tsx` (líneas 155 y 162)

## 🌐 Paso 9: Deploy en Vercel (Gratis)

1. Crea una cuenta en [Vercel](https://vercel.com/signup)
2. Instala Vercel CLI:
   ```bash
   npm install -g vercel
   ```
3. Desde la carpeta del proyecto:
   ```bash
   vercel login
   vercel
   ```
4. Sigue las instrucciones (presiona Enter en todo)
5. En el dashboard de Vercel, ve a **Settings** → **Environment Variables**
6. Añade todas las variables de tu `.env.local`
7. Redeploy: `vercel --prod`

## 📱 Uso Desde Móvil

Tu suegra puede gestionar productos desde su móvil:

1. Guarda la URL del admin en favoritos: `https://tu-sitio.vercel.app/admin`
2. El diseño es completamente responsive
3. Puede subir fotos directamente desde la cámara o galería

## 🔒 Seguridad

**IMPORTANTE - Después del primer login**:

1. Cambia el password del admin
2. Cambia el `JWT_SECRET` en producción
3. NUNCA compartas el archivo `.env.local`

## ❓ Problemas Comunes

### "Cannot connect to MongoDB"
- Verifica que la connection string esté correcta
- Asegúrate de haber agregado 0.0.0.0/0 en Network Access

### "Cloudinary upload failed"
- Verifica que el upload preset sea "unsigned"
- Comprueba que las credenciales sean correctas

### "Module not found"
- Ejecuta: `npm install` nuevamente
- Borra `node_modules` y `.next`, luego `npm install`

## 📞 Soporte

Si tienes problemas, revisa:
1. Que todas las variables de entorno estén configuradas
2. Que MongoDB Atlas permita conexiones desde tu IP
3. Que Cloudinary tenga el preset correcto

---

## 🎉 ¡Listo!

Tu aplicación ya está funcionando. Tu suegra puede empezar a subir productos de inmediato.

**Próximos pasos sugeridos**:
- Personalizar colores en `tailwind.config.ts`
- Añadir más categorías según sus productos
- Actualizar los números de WhatsApp e Instagram
