'use strict';

const { loadRecords, saveRecords } = require('./storage');
const { SERVICE_INTERVALS } = require('./intervals');

/**
 * Add a new maintenance record.
 *
 * @param {object} entry
 * @param {string} entry.serviceId  - ID matching SERVICE_INTERVALS (or 'custom')
 * @param {string} entry.serviceName - Human-readable service name
 * @param {number} entry.mileage    - Vehicle mileage at time of service
 * @param {string} entry.date       - ISO date string (YYYY-MM-DD)
 * @param {string} [entry.notes]    - Optional technician notes
 * @returns {object} The saved record (with generated id)
 */
function addRecord(entry) {
  if (!entry.serviceName || typeof entry.serviceName !== 'string') {
    throw new Error('serviceName is required and must be a string');
  }
  if (typeof entry.mileage !== 'number' || entry.mileage < 0) {
    throw new Error('mileage is required and must be a non-negative number');
  }
  if (!entry.date || !/^\d{4}-\d{2}-\d{2}$/.test(entry.date)) {
    throw new Error('date is required and must be in YYYY-MM-DD format');
  }

  const records = loadRecords();
  const record = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    serviceId: entry.serviceId || 'custom',
    serviceName: entry.serviceName.trim(),
    mileage: entry.mileage,
    date: entry.date,
    notes: entry.notes ? entry.notes.trim() : '',
  };
  records.push(record);
  saveRecords(records);
  return record;
}

/**
 * Return all maintenance records, sorted by date descending (most recent first).
 * @returns {object[]}
 */
function getHistory() {
  const records = loadRecords();
  return records.slice().sort((a, b) => {
    if (b.date !== a.date) return b.date.localeCompare(a.date);
    return b.mileage - a.mileage;
  });
}

/**
 * Given the current mileage and today's date, return services that are
 * due or overdue based on the last recorded service and the factory intervals.
 *
 * @param {number} currentMileage
 * @param {Date}   [today=new Date()]
 * @returns {object[]} Array of due-service objects with urgency info
 */
function getUpcomingServices(currentMileage, today = new Date()) {
  if (typeof currentMileage !== 'number' || currentMileage < 0) {
    throw new Error('currentMileage must be a non-negative number');
  }

  const records = loadRecords();
  const results = [];

  for (const interval of SERVICE_INTERVALS) {
    // Find the most recent record for this service
    const relevant = records
      .filter((r) => r.serviceId === interval.id)
      .sort((a, b) => b.mileage - a.mileage);

    const last = relevant[0] || null;
    const lastMileage = last ? last.mileage : 0;
    const lastDate = last ? new Date(last.date) : null;

    let milesUntilDue = null;
    let daysUntilDue = null;
    let overdue = false;

    if (interval.mileageInterval) {
      const nextMileage = lastMileage + interval.mileageInterval;
      milesUntilDue = nextMileage - currentMileage;
      if (milesUntilDue <= 0) overdue = true;
    }

    if (interval.monthInterval) {
      const baseDate = lastDate || new Date('2002-01-01');
      const nextDate = new Date(baseDate);
      nextDate.setMonth(nextDate.getMonth() + interval.monthInterval);
      daysUntilDue = Math.round((nextDate - today) / (1000 * 60 * 60 * 24));
      if (daysUntilDue <= 0) overdue = true;
    }

    const isDueSoon =
      (milesUntilDue !== null && milesUntilDue <= 500) ||
      (daysUntilDue !== null && daysUntilDue <= 30);

    results.push({
      serviceId: interval.id,
      serviceName: interval.name,
      lastServiceMileage: lastMileage,
      lastServiceDate: last ? last.date : null,
      milesUntilDue,
      daysUntilDue,
      overdue,
      dueSoon: !overdue && isDueSoon,
      notes: interval.notes,
    });
  }

  // Sort: overdue first, then due soon, then by miles remaining
  return results.sort((a, b) => {
    if (a.overdue !== b.overdue) return a.overdue ? -1 : 1;
    if (a.dueSoon !== b.dueSoon) return a.dueSoon ? -1 : 1;
    const aMiles = a.milesUntilDue !== null ? a.milesUntilDue : Infinity;
    const bMiles = b.milesUntilDue !== null ? b.milesUntilDue : Infinity;
    return aMiles - bMiles;
  });
}

/**
 * Delete a record by its id.
 * @param {string} id
 * @returns {boolean} true if deleted, false if not found
 */
function deleteRecord(id) {
  const records = loadRecords();
  const idx = records.findIndex((r) => r.id === id);
  if (idx === -1) return false;
  records.splice(idx, 1);
  saveRecords(records);
  return true;
}

module.exports = { addRecord, getHistory, getUpcomingServices, deleteRecord };
