const dashboard = require('../models/dashboard');

async function summary(req, res) {
  res.json({ resumen: await dashboard.getSummary() });
}

module.exports = { summary };
