// Sin red ni credenciales: los modelos y Cloudinary se sustituyen antes de
// cargar el código real. Ejecutar: node --test tests/images.test.cjs
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const ts = require('typescript');

function load(file, mocks = {}) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText;
  vm.runInNewContext(code, {
    exports, Buffer, URL, Response, Date, console: { error() {}, log() {} },
    process: { env: { NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: 'test' } },
    require(name) {
      if (Object.hasOwn(mocks, name)) return mocks[name];
      if (name === 'crypto') return require('node:crypto');
      throw new Error(`Import no simulado (red bloqueada): ${name}`);
    },
  }, { filename: file });
  return exports;
}
const security = load('src/lib/security.ts');
const validation = load('src/lib/image-validation.ts', { './security': security });
const url = id => `https://res.cloudinary.com/test/image/upload/v1/${id}.jpg`;
const image = (id, extra = {}) => ({
  _id: id, publicId: id, cloudName: 'test', url: url(id), managed: true, state: 'pending', references: [],
  expiresAt: new Date(Date.now() + 86400000), nextAttemptAt: new Date(0),
  attempts: 0, updatedAt: new Date(), ...extra,
});

function matches(doc, query) {
  return Object.entries(query).every(([key, wanted]) => {
    if (key === '$or') return wanted.some(part => matches(doc, part));
    const actual = doc[key];
    if (wanted && typeof wanted.test === 'function') {
      return (Array.isArray(actual) ? actual : [actual]).some(value => typeof value === 'string' && wanted.test(value));
    }
    if (wanted instanceof Date) return +actual === +wanted;
    if (wanted && typeof wanted === 'object') {
      if ('$size' in wanted) return actual?.length === wanted.$size;
      if ('$in' in wanted) return wanted.$in.includes(actual);
      if ('$lte' in wanted) return +actual <= +wanted.$lte;
    }
    return Array.isArray(actual) ? actual.includes(wanted) : actual === wanted;
  });
}

function harness() {
  const state = { images: [], products: [], categories: [] };
  const deleted = [];
  let failWrite = false, failCommit = false, failDestroy = false;
  function query(value) {
    return { session() { return this; }, sort() { return this; },
      limit(n) { if (Array.isArray(value)) value = value.slice(0, n); return this; },
      lean() { return Promise.resolve(structuredClone(value)); },
      then(resolve, reject) { return Promise.resolve(structuredClone(value)).then(resolve, reject); },
    };
  }
  function update(doc, changes) {
    for (const [key, value] of Object.entries(changes.$set || {})) doc[key] = value;
    for (const [key, value] of Object.entries(changes.$inc || {})) doc[key] = (doc[key] || 0) + value;
    for (const key of Object.keys(changes.$unset || {})) delete doc[key];
    for (const [key, value] of Object.entries(changes.$addToSet || {})) {
      if (!doc[key].includes(value)) doc[key].push(value);
    }
    for (const [key, value] of Object.entries(changes.$pull || {})) doc[key] = doc[key].filter(item => item !== value);
    doc.updatedAt = new Date();
    return doc;
  }
  function model(table) {
    return {
      async init() {},
      findOne(q) { return query(state[table].find(doc => matches(doc, q)) || null); },
      findById(id) { return this.findOne({ _id: id }); },
      find(q) { return query(state[table].filter(doc => matches(doc, q))); },
      async exists(q) { return state[table].some(doc => matches(doc, q)); },
      async create(docs) {
        if (table !== 'images' && failWrite) throw new Error('MongoDB write failed');
        const result = (Array.isArray(docs) ? docs : [docs]).map(doc => ({
          references: [], attempts: 0, nextAttemptAt: new Date(), updatedAt: new Date(), ...doc,
        }));
        state[table].push(...structuredClone(result));
        return Array.isArray(docs) ? structuredClone(result) : structuredClone(result[0]);
      },
      async updateOne(q, changes) {
        const doc = state[table].find(doc => matches(doc, q));
        if (doc) update(doc, changes);
        return { modifiedCount: doc ? 1 : 0 };
      },
      async findOneAndUpdate(q, changes) {
        const doc = state[table].find(doc => matches(doc, q));
        return doc ? structuredClone(update(doc, changes)) : null;
      },
      async findByIdAndUpdate(id, body) {
        if (failWrite) throw new Error('MongoDB write failed');
        const doc = state[table].find(doc => doc._id === id);
        Object.assign(doc, structuredClone(body));
        return structuredClone(doc);
      },
      async findByIdAndDelete(id) {
        if (failWrite) throw new Error('MongoDB delete failed');
        const index = state[table].findIndex(doc => doc._id === id);
        return index < 0 ? null : state[table].splice(index, 1)[0];
      },
    };
  }
  const models = { images: model('images'), products: model('products'), categories: model('categories') };
  const mongoose = { async startSession() { return {
    async withTransaction(fn) {
      const snapshot = structuredClone(state);
      try { await fn(); if (failCommit) throw new Error('MongoDB commit failed'); }
      catch (error) { Object.assign(state, snapshot); throw error; }
    }, async endSession() {},
  }; } };
  const api = load('src/lib/image-lifecycle.ts', {
    mongoose, '@/models/Imagen': models.images, '@/models/Producto': models.products,
    '@/models/Categoria': models.categories, './image-validation': validation,
    './cloudinary': { async deleteImageByPublicId(id) {
      if (failDestroy) throw new Error('Cloudinary unavailable');
      deleted.push(id);
    } },
  });
  return { ...api, state, deleted, models, failWrite() { failWrite = true; },
    failCommit() { failCommit = true; }, failDestroy(value) { failDestroy = value; } };
}

test('URLs largas e IDs válidos se conservan íntegros; entradas maliciosas se rechazan', () => {
  const long = url('productos/' + 'a'.repeat(210));
  assert.equal(validation.sanitizeImageBody({ imagenes: [long] }).imagenes[0], long);
  assert.equal(validation.validateImageUrl(long), long);
  assert.equal(validation.validatePublicId('productos/' + 'a'.repeat(210)), 'productos/' + 'a'.repeat(210));
  for (const invalid of ['javascript:alert(1)', 'https://evil.test/a.jpg', 'https://res.cloudinary.com@evil.test/a']) {
    assert.throws(() => validation.validateImageUrl(invalid));
  }
  assert.throws(() => validation.validatePublicId('../otra'));
  assert.throws(() => validation.productImageReferences({ imagenes: [long, long] }));
  assert.throws(() => validation.productImageReferences({ imagenes: [long, url('b')], imagenesPublicIds: ['one'] }));
});

test('guardar asocia archivo registrado; no borra hasta confirmar reemplazo en MongoDB', async () => {
  const h = harness(), a = image('productos/a'), b = image('productos/b');
  h.state.images.push(a, b);
  await h.saveWithImages('producto', 'p', { imagenes: [a.url], imagenesPublicIds: [a.publicId] }, 'create');
  await h.saveWithImages('producto', 'p', { imagenes: [b.url], imagenesPublicIds: [b.publicId] }, 'update');
  assert.deepEqual(h.deleted, []);
  assert.deepEqual(h.state.products[0].imagenes, [b.url]);
  assert.equal(h.state.images[0].state, 'delete_pending');
  await h.cleanupImages();
  assert.deepEqual(h.deleted, [a.publicId]);
});

for (const failure of ['failWrite', 'failCommit']) test(`fallo ${failure}: rollback de referencias, sin eliminar archivos`, async () => {
  const h = harness(), a = image('productos/a', { state: 'active', references: ['producto:p'] }), b = image('productos/b');
  h.state.images.push(a, b);
  h.state.products.push({ _id: 'p', imagenes: [a.url], imagenesPublicIds: [a.publicId] });
  h[failure]();
  await assert.rejects(h.saveWithImages('producto', 'p', { imagenes: [b.url] }, 'update'));
  assert.deepEqual(h.state.products[0].imagenes, [a.url]);
  assert.deepEqual(h.state.images[0].references, ['producto:p']);
  assert.deepEqual(h.state.images[1].references, []);
  assert.deepEqual(h.deleted, []);
});

test('archivo compartido: eliminar producto lo conserva mientras una categoría lo utiliza', async () => {
  const h = harness(), a = image('productos/shared'); h.state.images.push(a);
  await h.saveWithImages('producto', 'p', { imagenes: [a.url] }, 'create');
  await h.saveWithImages('categoria', 'c', { imagen: a.url }, 'create');
  assert.equal(h.state.categories[0].imagenPublicId, a.publicId);
  await h.saveWithImages('producto', 'p', {}, 'delete');
  await h.cleanupImages(); assert.deepEqual(h.deleted, []);
  await h.saveWithImages('categoria', 'c', {}, 'delete');
  await h.cleanupImages(); assert.deepEqual(h.deleted, [a.publicId]);
});

test('fallo Cloudinary: persiste motivo, intentos y fecha; reintento idempotente', async () => {
  const h = harness(); h.state.images.push(image('productos/a', { state: 'delete_pending' }));
  h.failDestroy(true); await h.cleanupImages();
  assert.equal(h.state.images[0].state, 'delete_pending');
  assert.equal(h.state.images[0].attempts, 1);
  assert.ok(h.state.images[0].lastError);
  h.failDestroy(false); h.state.images[0].nextAttemptAt = new Date(0);
  await h.cleanupImages(); assert.equal(h.state.images[0].state, 'deleted');
});

test('abandono/fallo/resubidas: sólo se limpian pendientes vencidos, no el formulario reciente', async () => {
  const h = harness();
  for (const id of ['abandoned', 'failed-save', 'removed', 'replaced']) {
    h.state.images.push(image(`productos/${id}`, { expiresAt: new Date(0) }));
  }
  h.state.images.push(image('productos/recent'));
  h.state.images.push(image('productos/response-lost', { state: 'uploading', url: undefined, expiresAt: new Date(0) }));
  await h.cleanupImages();
  assert.equal(h.deleted.length, 5);
  assert.equal(h.state.images.find(doc => doc._id === 'productos/recent').state, 'pending');
});

test('categoría heredada sólo con URL: edición compatible y retirada conservada para revisión', async () => {
  const h = harness(), old = url('carpeta/antigua');
  h.state.categories.push({ _id: 'c', imagen: old });
  await h.saveWithImages('categoria', 'c', { imagen: old, imagenPublicId: '' }, 'update');
  await h.saveWithImages('categoria', 'c', {}, 'delete');
  await h.cleanupImages();
  assert.equal(h.state.images[0].state, 'review'); assert.deepEqual(h.deleted, []);
});

test('IDs ajenos, URL no registrada y archivo en borrado no pueden asociarse', async () => {
  const h = harness(), a = image('productos/a'); h.state.images.push(a);
  await assert.rejects(h.saveWithImages('producto', 'p', { imagenes: [a.url], imagenesPublicIds: ['productos/other'] }, 'create'));
  await assert.rejects(h.saveWithImages('producto', 'p', { imagenes: [url('productos/other')] }, 'create'));
  h.state.images[0].state = 'deleting';
  await assert.rejects(h.saveWithImages('producto', 'p', { imagenes: [a.url] }, 'create'));
  assert.deepEqual(h.deleted, []);
});

test('referencia heredada con otra transformación protege un archivo candidato', async () => {
  const h = harness(), a = image('productos/a', { state: 'delete_pending' }); h.state.images.push(a);
  h.state.categories.push({ _id: 'old', imagen: 'https://res.cloudinary.com/test/image/upload/w_100/v23/productos/a.png' });
  await h.cleanupImages(); assert.deepEqual(h.deleted, []); assert.equal(h.state.images[0].state, 'review');
});

test('worker interrumpido se recupera; una imagen eliminada no se puede volver a asociar', async () => {
  const h = harness(), a = image('productos/a', { state: 'deleting', updatedAt: new Date(0) }); h.state.images.push(a);
  await h.cleanupImages(); assert.deepEqual(h.deleted, [a.publicId]);
  await assert.rejects(h.saveWithImages('categoria', 'c', { imagen: a.url }, 'create'));
});

test('cambio de cuenta Cloudinary: nunca destruir con credenciales de otra cuenta', async () => {
  const h = harness();
  h.state.images.push(image('productos/a', { cloudName: 'previous-account', state: 'delete_pending' }));
  await h.cleanupImages();
  assert.deepEqual(h.deleted, []); assert.equal(h.state.images[0].state, 'review');
});

test('reemplazo de categoría nueva conserva public_id y programa sólo el archivo anterior', async () => {
  const h = harness(), a = image('productos/a'), b = image('productos/b'); h.state.images.push(a, b);
  await h.saveWithImages('categoria', 'c', { imagen: a.url, imagenPublicId: a.publicId }, 'create');
  await h.saveWithImages('categoria', 'c', { imagen: b.url, imagenPublicId: b.publicId }, 'update');
  assert.equal(h.state.categories[0].imagenPublicId, b.publicId);
  assert.deepEqual(h.deleted, []);
  await h.cleanupImages(); assert.deepEqual(h.deleted, [a.publicId]);
});

test('fallo de eliminación en MongoDB conserva documento, referencia y archivo', async () => {
  const h = harness(), a = image('productos/a'); h.state.images.push(a);
  await h.saveWithImages('producto', 'p', { imagenes: [a.url] }, 'create');
  h.failWrite(); await assert.rejects(h.saveWithImages('producto', 'p', {}, 'delete'));
  await h.cleanupImages();
  assert.equal(h.state.products.length, 1); assert.deepEqual(h.deleted, []);
  assert.deepEqual(h.state.images[0].references, ['producto:p']);
});

test('cleanup exige autenticación antes de conectar o eliminar', async () => {
  const responses = load('src/lib/api-utils.ts');
  const api = load('src/app/api/upload/cleanup/route.ts', {
    'next/server': {}, '@/lib/api-utils': responses,
    '@/lib/auth': { verifyAdmin() { throw new Error('No autorizado'); } },
    '@/lib/mongodb': async () => { assert.fail('No debe conectarse'); },
    '@/lib/image-lifecycle': { async cleanupImages() { assert.fail('No debe eliminar'); } },
  });
  assert.equal((await api.POST({})).status, 401);
});

test('destroy verifica resultado: ok y not found son idempotentes; otros resultados y red fallan', async () => {
  let result = 'ok', networkFailure = false;
  const api = load('src/lib/cloudinary.ts', { cloudinary: { v2: {
    config() {}, uploader: { async destroy() { if (networkFailure) throw new Error(); return { result }; } },
  } } });
  await api.deleteImageByPublicId('test'); result = 'not found'; await api.deleteImageByPublicId('test');
  result = 'error'; await assert.rejects(api.deleteImageByPublicId('test'));
  networkFailure = true; await assert.rejects(api.deleteImageByPublicId('test'));
});

test('upload registra identidad antes de la red; respuesta perdida deja una carga recuperable', async () => {
  const h = harness(); let planned;
  const responses = load('src/lib/api-utils.ts');
  const api = load('src/app/api/upload/route.ts', {
    'next/server': {}, '@/lib/auth': { verifyAdmin() {} }, '@/lib/api-utils': responses,
    '@/lib/mongodb': async () => {}, '@/models/Imagen': h.models.images,
    '@/lib/image-validation': validation,
    '@/lib/image-lifecycle': { PENDING_IMAGE_MS: 86400000, tryCleanupImages: async () => {} },
    '@/lib/cloudinary': { async uploadImage(data, folder, id) {
      planned = id; assert.equal(h.state.images[0]._id, id); throw new Error('Lost response');
    } },
  });
  const response = await api.POST({ async formData() { return { get() {
    return { type: 'image/jpeg', size: 200, async arrayBuffer() { return new ArrayBuffer(200); } };
  } }; } });
  assert.equal(response.status, 500); assert.equal(h.state.images[0].state, 'uploading');
  assert.equal(h.state.images[0].publicId, planned);
});
