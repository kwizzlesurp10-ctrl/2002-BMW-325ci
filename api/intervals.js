'use strict';

const { SERVICE_INTERVALS } = require('../src/intervals');

/**
 * Vercel serverless function – /api/intervals
 *
 * GET /api/intervals
 *   Returns the BMW E46 factory-recommended service intervals.
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

  return res.status(200).json(SERVICE_INTERVALS);
};
