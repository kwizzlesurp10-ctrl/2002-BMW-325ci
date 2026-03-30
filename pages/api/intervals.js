import { SERVICE_INTERVALS } from '../../lib/intervals';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }
  return res.status(200).json(SERVICE_INTERVALS);
}
