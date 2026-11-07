# Gestión y validación de imágenes

## Alcance

Se conservan Next Image, Cloudinary, recorte, JPEG 0,92, límite de navegador
1600 px y transformación de entrada 1200 px / auto:best. No cambia el loader,
la navegación, los controles de galería, la cámara ni el diseño.

No se añadieron dependencias ni variables de entorno. `.eslintrc.json` hace
reproducible `npm run lint` usando la configuración Next ya instalada.

## Archivos de esta implementación

Modificados (16):

- `src/lib/cloudinary.ts`: identidad explícita, timeout y destroy comprobado.
- `src/lib/security.ts`: aclara el uso exclusivo de sanitización para textos.
- `src/lib/api-utils.ts`: respuestas 400 para errores de imágenes.
- `src/models/Categoria.ts`: public ID opcional.
- `src/app/api/upload/route.ts`: registra la identidad antes del upload.
- `src/app/api/productos/route.ts`: creación transaccional con referencias.
- `src/app/api/productos/[id]/route.ts`: actualización y eliminación seguras.
- `src/app/api/categorias/route.ts`: creación con registro de imágenes.
- `src/app/api/categorias/[id]/route.ts`: reemplazo y eliminación seguros.
- `src/contexts/AuthContext.tsx`: intento de limpieza al cargar sesión admin.
- `src/app/admin/categorias/page.tsx`: conserva ID y ajusta sizes.
- `src/app/admin/productos/[id]/page.tsx`: alinea IDs antiguos y ajusta sizes.
- `src/app/admin/productos/page.tsx`: sizes del listado administrativo.
- `src/components/ProductCard.tsx`: sizes según columnas reales.
- `src/app/productos/[id]/page.tsx`: sizes de imagen, miniaturas y modal.
- `src/app/page.tsx`: sizes de categorías, incluyendo ampliación por hover.

Nuevos (7):

- `src/models/Imagen.ts`: registro persistente de uploads y bajas.
- `src/lib/image-validation.ts`: validación íntegra de URLs e IDs.
- `src/lib/image-lifecycle.ts`: transacciones, referencias y recolector.
- `src/app/api/upload/cleanup/route.ts`: limpieza administrativa acotada.
- `tests/images.test.cjs`: pruebas aisladas, sin servicios reales.
- `.eslintrc.json`: configuración reproducible del lint ya instalado.
- `IMAGENES.md`: operación, compatibilidad, pruebas y preparación de Git.

## Registro y consistencia

La colección nueva `imagenes` registra la identidad del archivo ANTES del
upload. El servidor elige `productos/<UUID>`, prohíbe sobrescritura y conserva
esa identidad aunque se pierda la respuesta de Cloudinary. Sólo los archivos
cargados por esta implementación son elegibles para eliminación automática.

Las escrituras de productos/categorías y sus referencias se confirman juntas
mediante una transacción de MongoDB. Se requiere un replica set o cluster con
soporte para transacciones; comprobarlo en el entorno de prueba. Si no hay
soporte, la operación falla sin borrar archivos: no existe fallback inseguro.
El usuario de base de datos necesita poder crear la colección y sus índices.

La transición de una imagen a `deleting` compite con la escritura transaccional
que la asocia: una imagen en borrado o eliminada no se puede volver a asociar.
Antes del destroy también se consultan productos y categorías, incluidos
inactivos, por URL, identificador y URLs alternativas de Cloudinary. Las
referencias compartidas conservan el archivo mientras alguna entidad lo use.

La retirada del documento y el registro de la baja pendiente son atómicos.
El destroy ocurre después. Cloudinary debe devolver `ok` o `not found` para
confirmar el resultado; este último permite reintentar una respuesta perdida.
Los fallos conservan estado `delete_pending`, intentos, motivo genérico y fecha
del próximo intento. No se guardan errores brutos del SDK ni credenciales.
Un worker interrumpido en `deleting` es recuperable después de cinco minutos.

## Cargas abandonadas y reintentos

Las cargas sin asociar caducan a las 24 horas. Esto cubre cancelar o abandonar
el formulario, fallo al guardar, retirar una nueva foto y reemplazarla varias
veces. No dependen de `unload`. Una pestaña que conserve una carga pendiente
más de 24 horas puede necesitar subirla nuevamente si ya fue recolectada.

Se intenta limpiar un archivo después de una subida o mutación correcta, y
un lote al cargar la sesión administrativa. Hay un límite de tiempo entre
archivos y timeout de Cloudinary para no prolongar indefinidamente una petición.
Una caída de MongoDB conserva el registro para una próxima ejecución.

También está disponible `POST /api/upload/cleanup` con el Bearer de un admin.
Procesa hasta 20 candidatos, sujeto al límite temporal, y devuelve contadores
`deleted`, `failed` y `protected`. Puede llamarse nuevamente para drenar lotes;
los fallos respetan backoff. No hay cron ni servicio externo. Si no hay actividad
administrativa ni invocaciones del endpoint, los pendientes permanecen almacenados.
No invocar este endpoint con credenciales de producción como parte de pruebas.

No hay endpoint público de eliminación por URL o public_id arbitrario. Para
asociar una imagen nueva debe existir su upload registrado; las imágenes antiguas
se reconocen únicamente desde documentos ya persistidos. Las URLs e IDs se
validan íntegros, sin sanitización de texto ni truncamiento silencioso.

## Compatibilidad y revisión manual

Los arrays actuales de productos se mantienen. El formulario rellena IDs
faltantes con cadenas vacías para preservar índices al añadir nuevas fotos.
Las categorías incorporan el campo opcional `imagenPublicId`.

Los archivos anteriores a esta implementación se pueden conservar, editar y
retirar de documentos. Al retirarlos quedan registrados con `managed: false`
y estado `review`: NO se deduce un ID desde la URL para destruirlo. Incluso un
ID antiguo guardado puede estar desalineado, por lo que no acredita por sí solo
una carga segura. Estos archivos requieren comprobar asociación y referencias
antes de cualquier eliminación manual. No hay migración ni limpieza retroactiva.
Los huérfanos anteriores al cambio requieren un inventario y una revisión
separados; no se marcan automáticamente como cargas gestionadas.

Las nuevas URLs se resuelven usando el registro del upload; un ID que no coincide
con su URL es rechazado con 400. Las solicitudes con arrays desalineados, URLs
inválidas, duplicados o más de diez imágenes se rechazan en vez de truncarse.

## Validaciones locales

```powershell
node --test tests/images.test.cjs
npx --no-install tsc --noEmit --incremental false
npm run lint
npm run build
```

Las pruebas cargan el código real con modelos y SDK simulados. Bloquean imports
no simulados para impedir conexiones accidentales. Comprueban rollback de
escritura y commit, referencias compartidas, reintentos, pendientes vencidos,
respuesta de upload perdida, registros heredados y entradas arbitrarias.
No sustituyen la validación de transacciones contra una base de prueba real.

El build local puede necesitar red para descargar Inter de Google Fonts.
Para validarlo sin producción se utilizó MONGODB_URI local ficticia con timeout
corto y cloud name ficticio, sólo en el proceso de build; no se guardaron secretos.
El build no valida permisos remotos, soporte real de transacciones ni Cloudinary.

## Checklist de staging y posterior al despliegue

Usar primero una base y un entorno Cloudinary exclusivos de pruebas:

- Crear/editar un producto sin imágenes y con una o varias imágenes.
- Seleccionar archivo, usar cámara, cancelar/confirmar recorte y reencuadrar.
- Sustituir una foto varias veces; comprobar que las retiradas se limpian
  después de guardar o al caducar, nunca mientras el documento las referencia.
- Simular fallo de validación y de escritura: documento anterior y fotos siguen vivos.
- Compartir una imagen entre producto/categoría y eliminar sólo una referencia.
- Simular fallo del destroy y comprobar el reintento después de `nextAttemptAt`.
- Abandonar el formulario; en la base de PRUEBAS adelantar `expiresAt`, invocar
  cleanup y comprobar que una carga reciente o una imagen asociada no se elimina.
- Crear/editar/borrar categorías nuevas y antiguas con URL solamente. Las antiguas
  retiradas deben quedar en revisión sin llamadas destructivas.
- Enviar un ID ajeno, URL no registrada o arrays desalineados: respuesta 400.
- Comparar catálogo, detalle, miniaturas y modal con fotos de texturas, cadenas
  finas y colores, en móvil/escritorio y DPR 1/2/3. Revisar `currentSrc`, tamaño
  CSS y píxeles descargados. Especial atención a categorías panorámicas, por
  `object-cover`; no aprobar una variante que pierda nitidez visible.
- Confirmar JPEG/calidad, dimensiones almacenadas, recorte y ampliación sin cambios.
- Revisar estados de `imagenes`, errores del hosting, consumo y fotos huérfanas.

Después de desplegar, comprobar primero navegación y fotos existentes sin
modificarlas; realizar pruebas destructivas únicamente con recursos de prueba
identificables. El éxito del build local no garantiza el entorno remoto.

## Git y despliegue

La revisión comenzó en `main`, sin cambios locales. No se hizo commit, push ni
despliegue. No se encontró configuración de proveedor en el repositorio; una
integración automática de GitHub puede estar definida fuera de él.

Después de revisar y aprobar:

```powershell
git switch -c codex/correccion-imagenes
git add src tests .eslintrc.json IMAGENES.md
git diff --cached --check
git diff --cached --stat
git commit -m "Corrige ciclo de vida y tamaños responsive de imágenes"
git push -u origin codex/correccion-imagenes
```

Antes del push, confirmar si esa rama activa despliegues automáticos o previews.
Revisar el diff staged y no añadir archivos de entorno privados.
