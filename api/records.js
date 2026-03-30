'use strict';

const { addRecord, getHistory, deleteRecord } = require('../src/tracker');

/**
 * Vercel serverless function – /api/records
 *
 * GET    /api/records          → returns all maintenance records
 * POST   /api/records          → adds a new record (JSON body)
 * DELETE /api/records?id=<id>  → deletes the record with the given id
 */
module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method === 'GET') {
    try {
      return res.status(200).json(getHistory());
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { serviceId, serviceName, mileage, date, notes } = req.body || {};
      const record = addRecord({ serviceId, serviceName, mileage: Number(mileage), date, notes });
      return res.status(201).json(record);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  if (req.method === 'DELETE') {
    const { id } = req.query || {};
    if (!id) {
      return res.status(400).json({ error: 'Query parameter "id" is required' });
    }
    try {
      const deleted = deleteRecord(id);
      if (!deleted) {
        return res.status(404).json({ error: `Record ${id} not found` });
      }
      return res.status(200).json({ deleted: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
