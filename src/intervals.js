/**
 * BMW E46 factory-recommended service intervals for the 2002 325ci.
 * Each entry defines mileage and/or time-based intervals.
 */

'use strict';

const SERVICE_INTERVALS = [
  {
    id: 'oil_change',
    name: 'Engine Oil & Filter Change',
    mileageInterval: 5000,
    monthInterval: 12,
    notes: 'Use 5W-30 or 5W-40 full synthetic. BMW LL-01 spec recommended.',
  },
  {
    id: 'air_filter',
    name: 'Engine Air Filter',
    mileageInterval: 30000,
    monthInterval: 36,
    notes: 'BMW part #13721730449 or equivalent K&N drop-in.',
  },
  {
    id: 'spark_plugs',
    name: 'Spark Plugs',
    mileageInterval: 60000,
    monthInterval: null,
    notes: 'Iridium plugs recommended. NGK BKR6EQUP or Bosch FR7NII33X.',
  },
  {
    id: 'brake_fluid',
    name: 'Brake Fluid Flush',
    mileageInterval: null,
    monthInterval: 24,
    notes: 'Use DOT 4 brake fluid. Hygroscopic — must be flushed on time.',
  },
  {
    id: 'coolant',
    name: 'Coolant Flush',
    mileageInterval: 36000,
    monthInterval: 36,
    notes: 'BMW blue antifreeze (HT-12). Do NOT mix with green antifreeze.',
  },
  {
    id: 'transmission_fluid',
    name: 'Transmission Fluid',
    mileageInterval: 50000,
    monthInterval: null,
    notes: 'Manual: Redline MTL or BMW MTF-LT-2. Auto: ZF Lifeguard 5.',
  },
  {
    id: 'differential_fluid',
    name: 'Differential Fluid',
    mileageInterval: 50000,
    monthInterval: null,
    notes: 'Redline 75W90 GL-5 or BMW SAF-XO.',
  },
  {
    id: 'cabin_filter',
    name: 'Cabin Air Filter (Microfilter)',
    mileageInterval: 20000,
    monthInterval: 24,
    notes: 'BMW part #64319071935. Located behind glove box.',
  },
  {
    id: 'tire_rotation',
    name: 'Tire Rotation',
    mileageInterval: 7500,
    monthInterval: null,
    notes: 'Cross-rotate non-directional tires. Check pressure: 32 psi F/R.',
  },
  {
    id: 'serpentine_belt',
    name: 'Serpentine Belt',
    mileageInterval: 60000,
    monthInterval: null,
    notes: 'Inspect at 60k; replace at 80k if not already done.',
  },
  {
    id: 'valve_cover_gasket',
    name: 'Valve Cover Gasket',
    mileageInterval: 60000,
    monthInterval: null,
    notes: 'Common leak point on M54. Inspect at 60k; replace if seeping.',
  },
  {
    id: 'fuel_filter',
    name: 'Fuel Filter',
    mileageInterval: 30000,
    monthInterval: null,
    notes: 'Located under car near fuel tank. Use OEM or equivalent.',
  },
];

module.exports = { SERVICE_INTERVALS };
