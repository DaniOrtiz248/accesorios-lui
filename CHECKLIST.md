# ✅ Checklist de Configuración - Accesorios LUI

Use este archivo para verificar que todo está configurado correctamente antes de iniciar.

---

## 📋 Pre-requisitos

- [ ] Node.js instalado (versión 18+)
  ```bash
  node --version
  ```
  
- [ ] npm instalado
  ```bash
  npm --version
  ```

- [ ] Git instalado (opcional, pero recomendado)
  ```bash
  git --version
  ```

---

## 📦 1. Instalación de Dependencias

- [ ] Ejecutado `npm install` sin errores
- [ ] Carpeta `node_modules` creada
- [ ] Archivo `package-lock.json` generado

**Verificar**:
```bash
npm list --depth=0
```

Deberías ver:
- next@14.2.0
- react@18.3.0
- mongoose@8.2.0
- cloudinary@2.0.0
- tailwindcss@3.4.1
- typescript@5.x

---

## 🔧 2. Variables de Entorno

- [ ] Archivo `.env.local` creado (copiado de `.env.example`)
- [ ] `MONGODB_URI` configurado con connection string real
- [ ] `JWT_SECRET` configurado (mínimo 32 caracteres aleatorios)
- [ ] `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` configurado
- [ ] `CLOUDINARY_API_KEY` configurado
- [ ] `CLOUDINARY_API_SECRET` configurado

**Verificar estructura**:
```env
MONGODB_URI=mongodb+srv://...mongodb.net/accesorios-lui?retryWrites=true&w=majority
JWT_SECRET=un_secreto_muy_largo_y_aleatorio_de_al_menos_32_caracteres
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
```

⚠️ **IMPORTANTE**: Sin estas variables, la app no funcionará.

---

## 🗄️ 3. MongoDB Atlas

- [ ] Cuenta creada en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [ ] Cluster gratuito (M0) creado
- [ ] Usuario de base de datos creado
- [ ] IP permitida: `0.0.0.0/0` (o tu IP específica)
- [ ] Connection string copiado y pegado en `.env.local`
- [ ] Base de datos se llama: `accesorios-lui`

**Verificar conexión**:
- Iniciar el servidor (npm run dev)
- Debe aparecer mensaje: "✅ MongoDB conectado" en la consola

---

## ☁️ 4. Cloudinary

- [ ] Cuenta creada en [Cloudinary](https://cloudinary.com)
- [ ] Dashboard accesible
- [ ] Cloud Name copiado
- [ ] API Key copiado
- [ ] API Secret copiado
- [ ] Upload preset creado: `accesorios-lui`
  - Settings → Upload → Upload Presets → Add upload preset
  - Preset name: `accesorios-lui`
  - Signing Mode: **Unsigned**
  - Folder: `accesorios-lui`

**Verificar**:
- En Cloudinary Dashboard → Settings → Upload → Upload presets
- Debe existir preset llamado `accesorios-lui` con modo `Unsigned`

---

## 👤 5. Usuario Administrador

- [ ] Usuario admin creado en MongoDB

### Opción A: Con MongoDB Compass

- [ ] MongoDB Compass instalado
- [ ] Conectado a tu cluster
- [ ] Base de datos `accesorios-lui` creada
- [ ] Colección `usuarios` creada
- [ ] Documento de usuario insertado:

```json
{
  "email": "admin@accesoriolui.com",
  "password": "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
  "nombre": "Administrador LUI",
  "rol": "admin",
  "activo": true,
  "createdAt": {"$date": "2026-02-03T00:00:00.000Z"},
  "updatedAt": {"$date": "2026-02-03T00:00:00.000Z"}
}
```

**Nota**: Ese password es `admin123` hasheado.

### Opción B: Con API

- [ ] Servidor iniciado (`npm run dev`)
- [ ] Request POST enviado a `http://localhost:3000/api/auth/register`

```powershell
$body = @{
    email = "admin@accesoriolui.com"
    password = "admin123"
    nombre = "Administrador LUI"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method POST -Body $body -ContentType "application/json"
```

---

## ▶️ 6. Iniciar el Servidor

- [ ] Ejecutado `npm run dev`
- [ ] Servidor corriendo en `http://localhost:3000`
- [ ] No hay errores en la consola
- [ ] Mensaje "✅ MongoDB conectado" visible

**Consola debe mostrar**:
```
  ▲ Next.js 14.2.0
  - Local:        http://localhost:3000
  - Environments: .env.local

✅ MongoDB conectado
✓ Ready in 2.5s
```

---

## 🌐 7. Verificar Funcionalidad

### Frontend Público

- [ ] `http://localhost:3000` carga correctamente
- [ ] Página de inicio se ve bien
- [ ] Links de navegación funcionan
- [ ] `http://localhost:3000/productos` muestra página de productos
- [ ] Filtros se muestran correctamente

### Panel Admin

- [ ] `http://localhost:3000/admin/login` carga
- [ ] Login con `admin@accesoriolui.com` / `admin123` funciona
- [ ] Redirige a `/admin` después del login
- [ ] Dashboard muestra opciones Productos y Categorías

### Crear Categoría

- [ ] Click en "Categorías"
- [ ] Click en "Nueva Categoría"
- [ ] Llenar formulario (ej: nombre="Joyería")
- [ ] Guardar exitosamente
- [ ] Categoría aparece en la lista

### Crear Producto

- [ ] Click en "Productos"
- [ ] Click en "Nuevo Producto"
- [ ] Subir imagen (drag & drop o click)
- [ ] Llenar todos los campos
- [ ] Seleccionar categoría creada
- [ ] Guardar exitosamente
- [ ] Producto aparece en lista admin
- [ ] Producto visible en catálogo público

---

## 🎨 8. Personalización

- [ ] Links de WhatsApp actualizados:
  - `src/components/Navbar.tsx` (línea ~29)
  - `src/components/Footer.tsx` (línea ~33)
  - `src/app/productos/[id]/page.tsx` (línea ~155)
  
- [ ] Links de Instagram actualizados:
  - `src/components/Navbar.tsx` (línea ~36)
  - `src/components/Footer.tsx` (línea ~40)
  - `src/app/productos/[id]/page.tsx` (línea ~162)

**Reemplazar**:
- `https://wa.me/1234567890` → `https://wa.me/TU_NUMERO`
- `https://instagram.com/accesoriolui` → `https://instagram.com/TU_USUARIO`

---

## 🚀 9. Deploy a Vercel (Opcional)

- [ ] Cuenta creada en [Vercel](https://vercel.com)
- [ ] Vercel CLI instalado: `npm install -g vercel`
- [ ] Ejecutado `vercel login`
- [ ] Ejecutado `vercel` (seguir instrucciones)
- [ ] Variables de entorno configuradas en Vercel Dashboard:
  - MONGODB_URI
  - JWT_SECRET
  - NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  - CLOUDINARY_API_KEY
  - CLOUDINARY_API_SECRET
- [ ] Ejecutado `vercel --prod`
- [ ] Sitio accesible en URL de Vercel
- [ ] Login funciona en producción
- [ ] Upload de imágenes funciona en producción

---

## 📱 10. Prueba en Dispositivos

- [ ] Probado en navegador desktop (Chrome/Edge/Firefox)
- [ ] Probado en móvil (Android/iPhone)
- [ ] Probado en tablet (opcional)
- [ ] Responsive funciona correctamente
- [ ] Upload de imágenes desde móvil funciona

---

## 🔒 11. Seguridad

- [ ] Password del admin cambiado (después del primer login)
- [ ] JWT_SECRET cambiado a uno único y seguro
- [ ] Archivo `.env.local` NO está en Git (verificar `.gitignore`)
- [ ] Variables de entorno configuradas en Vercel (si deployado)

---

## 📚 12. Documentación Leída

- [ ] README.md leído
- [ ] INSTALACION.md leído y seguido
- [ ] GUIA_USO.md disponible para tu suegra
- [ ] Links importantes guardados en favoritos

---

## ✅ Verificación Final

### Prueba Completa End-to-End:

1. **Público**:
   - [ ] Abrir `https://tu-sitio.vercel.app` (o localhost)
   - [ ] Ver productos en catálogo
   - [ ] Filtrar por categoría
   - [ ] Ver detalle de producto
   - [ ] Click en WhatsApp/Instagram (deben abrir correctamente)

2. **Admin**:
   - [ ] Login en `/admin/login`
   - [ ] Crear nueva categoría
   - [ ] Crear nuevo producto con imagen
   - [ ] Editar producto existente
   - [ ] Desactivar producto (debe desaparecer del público)
   - [ ] Reactivar producto (debe aparecer en público)
   - [ ] Eliminar producto de prueba
   - [ ] Logout

3. **Móvil**:
   - [ ] Abrir desde smartphone
   - [ ] Login admin desde móvil
   - [ ] Subir foto desde galería/cámara
   - [ ] Crear producto completo desde móvil
   - [ ] Verificar que aparece en catálogo público

---

## 🎉 Todo Listo

Si todos los checkboxes están marcados, ¡el proyecto está 100% configurado y funcional!

### Próximos pasos:

1. **Crear contenido real**:
   - Crear todas las categorías de productos
   - Subir productos reales con fotos de calidad

2. **Entregar a tu suegra**:
   - Mostrarle cómo usar el panel admin
   - Darle las credenciales de acceso
   - Enviarle el link de GUIA_USO.md

3. **Promocionar**:
   - Compartir link del catálogo
   - Actualizar bio de Instagram con el link
   - Usar link en estados de WhatsApp

---

## 🐛 Troubleshooting

### Si algo no funciona:

**Error: "Cannot connect to MongoDB"**
- [ ] Verificar MONGODB_URI en `.env.local`
- [ ] Verificar que IP está permitida en MongoDB Atlas
- [ ] Verificar que usuario de BD tiene permisos

**Error: "Cloudinary upload failed"**
- [ ] Verificar credenciales en `.env.local`
- [ ] Verificar que upload preset existe y es "unsigned"

**Error: "Module not found"**
- [ ] Ejecutar `npm install` nuevamente
- [ ] Borrar `node_modules` y `.next`, luego `npm install`

**Error: "Invalid token"**
- [ ] Cerrar sesión y volver a loguearse
- [ ] Verificar JWT_SECRET está configurado

**Imágenes no se cargan**
- [ ] Verificar URLs de Cloudinary
- [ ] Verificar next.config.js tiene dominio cloudinary

---

## 📞 ¿Necesitas Ayuda?

1. Revisa [INSTALACION.md](INSTALACION.md) para guías detalladas
2. Revisa [ARQUITECTURA.md](ARQUITECTURA.md) para detalles técnicos
3. Verifica este checklist nuevamente
4. Contacta al desarrollador

---

**Fecha**: _________  
**Verificado por**: _________  
**Estado**: ⬜ En progreso / ✅ Completado
