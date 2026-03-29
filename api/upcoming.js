'use strict';

const { getUpcomingServices } = require('../src/tracker');

/**
 * Vercel serverless function – /api/upcoming
 *
 * GET /api/upcoming?mileage=<number>
 *   Returns services that are due or overdue based on current mileage.
 */
module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const mileage = parseInt(req.query && req.query.mileage, 10);
  if (isNaN(mileage) || mileage < 0) {
    return res
      .status(400)
      .json({ error: 'Query parameter "mileage" must be a non-negative integer' });
  }

  try {
    const services = getUpcomingServices(mileage);
    return res.status(200).json(services);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
