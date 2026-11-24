const content = require('../models/content');
const HttpError = require('../middlewares/httpError');
const { idParam, requiredString } = require('../utils/validation');

async function newsList(req, res) {
  res.json({ noticias: await content.listNews() });
}

async function newsCreate(req, res) {
  const noticia = await content.createNews({
    titulo: requiredString(req.body.titulo, 'titulo', 160),
    contenido: requiredString(req.body.contenido, 'contenido', 5000),
    usuarioId: req.user.id,
  });
  res.status(201).json({ noticia });
}

async function pricesList(req, res) {
  res.json({ precios: await content.listPrices() });
}

async function priceUpdate(req, res) {
  const capacidadKg = idParam(req.params.capacidad_kg, 'capacidad_kg');
  if (capacidadKg !== 10 && capacidadKg !== 45) {
    throw new HttpError(400, 'capacidad_kg debe ser 10 o 45.');
  }
  const rawPrice = req.body.precio_bs;
  const price = Number(rawPrice);
  if (!Number.isFinite(price) || price <= 0 || !/^\d+(\.\d{1,2})?$/.test(String(rawPrice))) {
    throw new HttpError(400, 'precio_bs debe ser un monto positivo con hasta dos decimales.');
  }
  const precio = await content.updatePrice({ capacidadKg, precioBs: price, userId: req.user.id });
  res.json({ precio });
}

module.exports = { newsList, newsCreate, pricesList, priceUpdate };
