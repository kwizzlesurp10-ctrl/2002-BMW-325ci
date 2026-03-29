'use strict';

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'maintenance.json');

/**
 * Load maintenance records from disk.
 * Returns an empty array if the file does not exist yet.
 * @returns {object[]}
 */
function loadRecords() {
  if (!fs.existsSync(DATA_FILE)) {
    return [];
  }
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(raw);
}

/**
 * Persist maintenance records to disk.
 * Creates the data directory if it does not exist.
 * @param {object[]} records
 */
function saveRecords(records) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2), 'utf8');
}

module.exports = { loadRecords, saveRecords };
