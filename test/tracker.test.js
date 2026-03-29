'use strict';

const assert = require('assert');
const { describe, it, before, after } = require('node:test');
const fs = require('fs');
const path = require('path');

// Point storage at a temp file so tests don't touch real data
const DATA_FILE = path.join(__dirname, '..', 'data', 'maintenance.json');
const BACKUP_FILE = DATA_FILE + '.bak';

function clearData() {
  if (fs.existsSync(DATA_FILE)) fs.unlinkSync(DATA_FILE);
}

before(() => {
  if (fs.existsSync(DATA_FILE)) {
    fs.renameSync(DATA_FILE, BACKUP_FILE);
  }
  clearData();
});

after(() => {
  clearData();
  if (fs.existsSync(BACKUP_FILE)) {
    fs.renameSync(BACKUP_FILE, DATA_FILE);
  }
});

const { addRecord, getHistory, getUpcomingServices, deleteRecord } = require('../src/tracker');

// ─── addRecord ─────────────────────────────────────────────────────────────────

describe('addRecord', () => {
  before(clearData);

  it('adds a valid record and returns it with an id', () => {
    const rec = addRecord({
      serviceId: 'oil_change',
      serviceName: 'Engine Oil & Filter Change',
      mileage: 120000,
      date: '2024-01-15',
      notes: 'Used 5W-30 Mobil 1',
    });
    assert.ok(rec.id, 'record should have an id');
    assert.strictEqual(rec.serviceName, 'Engine Oil & Filter Change');
    assert.strictEqual(rec.mileage, 120000);
    assert.strictEqual(rec.date, '2024-01-15');
  });

  it('throws when serviceName is missing', () => {
    assert.throws(
      () => addRecord({ mileage: 100, date: '2024-01-01' }),
      /serviceName/
    );
  });

  it('throws when mileage is negative', () => {
    assert.throws(
      () => addRecord({ serviceName: 'Test', mileage: -1, date: '2024-01-01' }),
      /mileage/
    );
  });

  it('throws when date format is wrong', () => {
    assert.throws(
      () => addRecord({ serviceName: 'Test', mileage: 100, date: '01/01/2024' }),
      /date/
    );
  });
});

// ─── getHistory ────────────────────────────────────────────────────────────────

describe('getHistory', () => {
  before(() => {
    clearData();
    addRecord({ serviceName: 'Oil Change', mileage: 100000, date: '2023-06-01' });
    addRecord({ serviceName: 'Tire Rotation', mileage: 107500, date: '2024-01-10' });
    addRecord({ serviceName: 'Brake Flush', mileage: 105000, date: '2023-11-20' });
  });

  it('returns records sorted by date descending', () => {
    const history = getHistory();
    assert.ok(history.length >= 3, 'should have at least 3 records');
    assert.ok(
      history[0].date >= history[1].date,
      'first record should be the most recent'
    );
  });

  it('returns all records', () => {
    const history = getHistory();
    const names = history.map((r) => r.serviceName);
    assert.ok(names.includes('Oil Change'));
    assert.ok(names.includes('Tire Rotation'));
    assert.ok(names.includes('Brake Flush'));
  });
});

// ─── getUpcomingServices ───────────────────────────────────────────────────────

describe('getUpcomingServices', () => {
  before(() => {
    clearData();
    // Record an oil change at 140,000 miles
    addRecord({
      serviceId: 'oil_change',
      serviceName: 'Engine Oil & Filter Change',
      mileage: 140000,
      date: '2024-01-01',
    });
  });

  it('throws for invalid mileage', () => {
    assert.throws(() => getUpcomingServices(-1), /currentMileage/);
  });

  it('returns an array of service objects', () => {
    const services = getUpcomingServices(142000);
    assert.ok(Array.isArray(services));
    assert.ok(services.length > 0);
    assert.ok('serviceName' in services[0]);
    assert.ok('overdue' in services[0]);
  });

  it('shows oil change as overdue when past interval', () => {
    // Last oil change at 140,000; interval is 5,000; current is 146,000
    const services = getUpcomingServices(146000, new Date('2024-06-01'));
    const oil = services.find((s) => s.serviceId === 'oil_change');
    assert.ok(oil, 'oil_change service should be in the list');
    assert.strictEqual(oil.overdue, true, 'oil change should be overdue at 146k after 140k service');
  });

  it('shows oil change as not overdue when within interval', () => {
    // Last oil change at 140,000; interval is 5,000; current is 142,000
    const services = getUpcomingServices(142000, new Date('2024-02-01'));
    const oil = services.find((s) => s.serviceId === 'oil_change');
    assert.ok(oil);
    assert.strictEqual(oil.overdue, false);
    assert.strictEqual(oil.milesUntilDue, 3000);
  });

  it('places overdue services first in the list', () => {
    const services = getUpcomingServices(146000, new Date('2030-01-01'));
    const firstOverdueIdx = services.findIndex((s) => s.overdue);
    const firstNotOverdueIdx = services.findIndex((s) => !s.overdue);
    if (firstOverdueIdx !== -1 && firstNotOverdueIdx !== -1) {
      assert.ok(
        firstOverdueIdx < firstNotOverdueIdx,
        'overdue services should come before non-overdue ones'
      );
    }
  });
});

// ─── deleteRecord ──────────────────────────────────────────────────────────────

describe('deleteRecord', () => {
  let recordId;

  before(() => {
    clearData();
    const rec = addRecord({ serviceName: 'Coolant Flush', mileage: 130000, date: '2023-05-01' });
    recordId = rec.id;
  });

  it('deletes an existing record and returns true', () => {
    const result = deleteRecord(recordId);
    assert.strictEqual(result, true);
    const history = getHistory();
    assert.ok(!history.find((r) => r.id === recordId), 'record should be gone');
  });

  it('returns false for a non-existent id', () => {
    const result = deleteRecord('nonexistent-id-99999');
    assert.strictEqual(result, false);
  });
});
