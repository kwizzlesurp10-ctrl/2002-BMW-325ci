import { getUpcomingServices } from '../../lib/store';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const mileage = parseInt(req.query.mileage, 10);
  if (isNaN(mileage) || mileage < 0) {
    return res.status(400).json({ error: 'mileage query param must be a non-negative number' });
  }

  try {
    const services = getUpcomingServices(mileage);
    return res.status(200).json(services);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}
