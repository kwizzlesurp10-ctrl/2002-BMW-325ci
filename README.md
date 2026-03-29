# 2002 BMW 325ci Maintenance Tracker

A command-line maintenance tracking application for the 2002 BMW 325ci (E46 chassis).

## Vehicle Specifications

| Feature | Detail |
|---|---|
| **Model** | 2002 BMW 325ci |
| **Chassis** | E46 |
| **Body Style** | 2-door Coupe |
| **Engine** | 2.5L M54B25 Inline-6 |
| **Horsepower** | 184 hp @ 6,000 rpm |
| **Torque** | 175 lb-ft @ 3,500 rpm |
| **Transmission** | 5-speed manual / 5-speed automatic |
| **Drivetrain** | Rear-Wheel Drive (RWD) |
| **Curb Weight** | ~3,230 lbs |
| **0–60 mph** | ~7.4 seconds (manual) |
| **Fuel Economy** | 19 city / 27 hwy mpg |

## Features

- **Log maintenance records** — oil changes, brake service, tire rotations, and more
- **View service history** — see all past maintenance sorted by date or mileage
- **Upcoming service reminders** — based on mileage intervals and elapsed time
- **BMW E46-specific service intervals** — pre-loaded with factory-recommended schedules
- **Persistent storage** — records saved to a local JSON file

## Recommended Service Intervals (E46)

| Service | Interval |
|---|---|
| Engine oil & filter | Every 5,000 miles or 1 year |
| Air filter | Every 30,000 miles or 3 years |
| Spark plugs (iridium) | Every 60,000 miles |
| Brake fluid flush | Every 2 years |
| Coolant flush | Every 3 years or 36,000 miles |
| Transmission fluid | Every 50,000 miles |
| Differential fluid | Every 50,000 miles |
| Cabin air filter | Every 20,000 miles or 2 years |
| Tire rotation | Every 7,500 miles |
| Valve cover gasket | Inspect at 60,000 miles |
| Serpentine belt | Every 60,000 miles |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v16 or higher

### Installation

```bash
git clone https://github.com/kwizzlesurp10-ctrl/2002-BMW-325ci.git
cd 2002-BMW-325ci
npm install
```

### Usage

```bash
# Interactive menu
npm start

# Add a maintenance record
node src/index.js add

# View service history
node src/index.js history

# Check upcoming services
node src/index.js upcoming --mileage 145000
```

### Running Tests

```bash
npm test
```

## Project Structure

```
2002-BMW-325ci/
├── src/
│   ├── index.js          # CLI entry point
│   ├── tracker.js        # Core maintenance tracker logic
│   ├── intervals.js      # BMW E46 factory service intervals
│   └── storage.js        # JSON file persistence
├── data/
│   └── maintenance.json  # Maintenance records (auto-created)
├── test/
│   └── tracker.test.js   # Unit tests
├── package.json
└── README.md
```

## License

MIT
