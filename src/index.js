#!/usr/bin/env node
'use strict';

const readline = require('readline');
const { addRecord, getHistory, getUpcomingServices, deleteRecord } = require('./tracker');
const { SERVICE_INTERVALS } = require('./intervals');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pad(str, len) {
  return String(str).padEnd(len);
}

function formatMiles(n) {
  if (n === null || n === undefined) return '  N/A  ';
  if (n <= 0) return `OVERDUE (${Math.abs(n)} mi ago)`;
  return `in ${n.toLocaleString()} mi`;
}

function formatDays(n) {
  if (n === null || n === undefined) return '  N/A  ';
  if (n <= 0) return `OVERDUE (${Math.abs(n)} days ago)`;
  return `in ${n} days`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

// ─── CLI argument handling ─────────────────────────────────────────────────────

const args = process.argv.slice(2);
const command = args[0];

if (command === 'add') {
  runAdd();
} else if (command === 'history') {
  runHistory();
} else if (command === 'upcoming') {
  const mileageFlag = args.indexOf('--mileage');
  if (mileageFlag === -1 || !args[mileageFlag + 1]) {
    console.error('Usage: node src/index.js upcoming --mileage <number>');
    process.exit(1);
  }
  const mileage = parseInt(args[mileageFlag + 1], 10);
  if (isNaN(mileage)) {
    console.error('Error: mileage must be a number');
    process.exit(1);
  }
  runUpcoming(mileage);
} else if (command === 'delete') {
  const id = args[1];
  if (!id) {
    console.error('Usage: node src/index.js delete <record-id>');
    process.exit(1);
  }
  const deleted = deleteRecord(id);
  console.log(deleted ? `Record ${id} deleted.` : `Record ${id} not found.`);
} else {
  // Interactive menu
  runInteractive();
}

// ─── Command implementations ───────────────────────────────────────────────────

function runHistory() {
  const records = getHistory();
  if (records.length === 0) {
    console.log('No maintenance records found. Add one with: node src/index.js add');
    return;
  }
  console.log('\n2002 BMW 325ci — Service History\n');
  console.log(
    pad('ID', 14) +
      pad('Date', 12) +
      pad('Mileage', 10) +
      pad('Service', 35) +
      'Notes'
  );
  console.log('─'.repeat(90));
  for (const r of records) {
    console.log(
      pad(r.id, 14) +
        pad(r.date, 12) +
        pad(r.mileage.toLocaleString(), 10) +
        pad(r.serviceName, 35) +
        (r.notes || '')
    );
  }
  console.log();
}

function runUpcoming(currentMileage) {
  const services = getUpcomingServices(currentMileage);
  console.log(`\n2002 BMW 325ci — Upcoming Services (current mileage: ${currentMileage.toLocaleString()})\n`);
  console.log(
    pad('Service', 35) +
      pad('Last Done', 16) +
      pad('Miles', 28) +
      'Time'
  );
  console.log('─'.repeat(95));
  for (const s of services) {
    const status = s.overdue ? '[OVERDUE]' : s.dueSoon ? '[DUE SOON]' : '';
    console.log(
      pad(s.serviceName + (status ? ' ' + status : ''), 35) +
        pad(s.lastServiceDate || 'Never', 16) +
        pad(formatMiles(s.milesUntilDue), 28) +
        formatDays(s.daysUntilDue)
    );
  }
  console.log();
}

function runAdd() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

  (async () => {
    console.log('\n2002 BMW 325ci — Add Maintenance Record\n');

    // Show service list
    console.log('Common services (enter number, or 0 for custom):');
    SERVICE_INTERVALS.forEach((s, i) => console.log(`  ${i + 1}. ${s.name}`));
    console.log('  0. Custom service\n');

    const choice = await ask('Select service: ');
    const idx = parseInt(choice, 10);
    let serviceId = 'custom';
    let serviceName = '';

    if (idx > 0 && idx <= SERVICE_INTERVALS.length) {
      const selected = SERVICE_INTERVALS[idx - 1];
      serviceId = selected.id;
      serviceName = selected.name;
      console.log(`  Hint: ${selected.notes}`);
    } else {
      serviceName = await ask('Custom service name: ');
    }

    const mileageStr = await ask('Mileage at service: ');
    const mileage = parseInt(mileageStr.replace(/,/g, ''), 10);
    if (isNaN(mileage) || mileage < 0) {
      console.error('Invalid mileage.');
      rl.close();
      process.exit(1);
    }

    const dateInput = await ask(`Date (YYYY-MM-DD) [${today()}]: `);
    const date = dateInput.trim() || today();

    const notes = await ask('Notes (optional): ');

    rl.close();

    try {
      const record = addRecord({ serviceId, serviceName, mileage, date, notes });
      console.log(`\nRecord saved (id: ${record.id})\n`);
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  })();
}

function runInteractive() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

  (async () => {
    console.log('\n╔══════════════════════════════════════╗');
    console.log('║  2002 BMW 325ci Maintenance Tracker  ║');
    console.log('╚══════════════════════════════════════╝\n');
    console.log('  1. View service history');
    console.log('  2. Add maintenance record');
    console.log('  3. Check upcoming services');
    console.log('  4. Delete a record');
    console.log('  5. Exit\n');

    const choice = await ask('Select an option: ');
    rl.close();

    switch (choice.trim()) {
      case '1':
        runHistory();
        break;
      case '2':
        runAdd();
        break;
      case '3': {
        const rl2 = readline.createInterface({ input: process.stdin, output: process.stdout });
        rl2.question('Enter current mileage: ', (ans) => {
          rl2.close();
          const m = parseInt(ans.replace(/,/g, ''), 10);
          if (isNaN(m)) { console.error('Invalid mileage.'); process.exit(1); }
          runUpcoming(m);
        });
        break;
      }
      case '4': {
        runHistory();
        const rl3 = readline.createInterface({ input: process.stdin, output: process.stdout });
        rl3.question('Enter record ID to delete: ', (id) => {
          rl3.close();
          const deleted = deleteRecord(id.trim());
          console.log(deleted ? `Record ${id} deleted.` : `Record ${id} not found.`);
        });
        break;
      }
      case '5':
        console.log('Goodbye!');
        break;
      default:
        console.log('Invalid option.');
    }
  })();
}
