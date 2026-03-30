import { addRecord, getHistory, deleteRecord } from '../../lib/store';

export default function handler(req, res) {
  if (req.method === 'GET') {
    const records = getHistory();
    return res.status(200).json(records);
  }

  if (req.method === 'POST') {
    try {
      const record = addRecord(req.body);
      return res.status(201).json(record);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'id is required' });
    const deleted = deleteRecord(id);
    return res.status(deleted ? 200 : 404).json({ deleted });
  }

  res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
  return res.status(405).json({ error: 'Method not allowed' });
}
