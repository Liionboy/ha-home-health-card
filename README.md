# 🏥 Home Health Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)
[![GitHub release](https://img.shields.io/github/v/release/Liionboy/ha-home-health-card)](https://github.com/Liionboy/ha-home-health-card/releases)
[![License](https://img.shields.io/github/license/Liionboy/ha-home-health-card)](LICENSE)

**See everything that's wrong with your home at a glance.** Monitors unavailable entities, low batteries, weak signals, available updates, stale entities, and error states — all prioritized by severity.

## ✨ Features

- **6 health sections**: unavailable, battery, updates, signal, errors, stale
- **Severity prioritization**: critical, warning, info, ok
- **Auto-refresh** with configurable interval
- **Visual config editor** — no YAML needed
- **Click-through** to more-info dialog
- **Integration grouping** for unavailable entities
- **Configurable thresholds** (battery, signal, stale hours)
- **Exclusion lists** for entities and integrations
- **Theme-aware**, responsive design
- **HACS ready**

## 📦 Installation

### Option 1: HACS (recommended)

1. Open **HACS** → **Frontend** → ⋮ → **Custom Repositories**
2. Add repository: `Liionboy/ha-home-health-card`
3. Category: **Lovelace** → Click **Add**
4. Find **Home Health Card** in HACS → Click **Install**
5. Go to **Settings** → **Dashboards** → **Resources** → **Add**:
   ```
   /hacsfiles/ha-home-health-card/ha-home-health-card.js
   type: JavaScript Module
   ```
6. **Restart Home Assistant** (or clear browser cache with Ctrl+Shift+R)
7. Edit your dashboard → Add card → Search for `ha-home-health-card`

### Option 2: Manual Install

1. Download `ha-home-health-card.js` from [Releases](https://github.com/Liionboy/ha-home-health-card/releases/latest)
2. Copy the file to your Home Assistant `/config/www/` directory
3. Go to **Settings** → **Dashboards** → **Resources** → **Add**:
   ```
   /local/ha-home-health-card.js
   type: JavaScript Module
   ```
4. **Restart Home Assistant** (or clear browser cache)
5. Edit your dashboard → Add card → Search for `ha-home-health-card`

### Option 3: Manual via YAML

Add to your `configuration.yaml`:
```yaml
lovelace:
  resources:
    - url: /local/ha-home-health-card.js
      type: module
```

## ⚙️ Configuration

### Minimal (auto-discovers entities)

```yaml
type: custom:ha-home-health-card
```

### Full Configuration

```yaml
type: custom:ha-home-health-card
title: Home Health
show_header: true
max_items_per_section: 10
refresh_interval: 60
sections:
  - id: unavailable
    enabled: true
    title: Unavailable Entities
    icon: mdi:alert-circle-outline
    max_items: 10
  - id: battery_low
    enabled: true
    title: Low Batteries
    icon: mdi:battery-low
    max_items: 10
  - id: updates
    enabled: true
    title: Available Updates
    icon: mdi:update
    max_items: 10
  - id: signal_weak
    enabled: true
    title: Weak Signal
    icon: mdi:wifi-strength-1
    max_items: 10
  - id: errors
    enabled: true
    title: Error States
    icon: mdi:alert-circle
    max_items: 10
  - id: stale
    enabled: true
    title: Stale Entities
    icon: mdi:clock-alert-outline
    max_items: 10
severity_thresholds:
  battery_low: 20
  battery_critical: 5
  signal_weak: 50
  signal_poor: 20
  stale_hours: 24
exclude_integrations:
  - google
  - mqtt
exclude_entities:
  - sensor.example_entity
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `title` | string | `Home Health` | Card title |
| `show_header` | bool | `true` | Show header with overall status |
| `max_items_per_section` | number | `10` | Default max items per section |
| `refresh_interval` | number | `60` | Auto-refresh interval in seconds |
| `sections` | list | all enabled | Section configuration |
| `severity_thresholds` | object | see above | Threshold values |
| `exclude_integrations` | list | `[]` | Integrations to exclude |
| `exclude_entities` | list | `[]` | Entity IDs to exclude |

## 🎨 Sections

| Section | What it monitors | Severity |
|---------|-----------------|----------|
| **Unavailable** | Entities in `unavailable` state, grouped by integration | ⚠️ Warning (🔴 Critical if >20) |
| **Low Batteries** | Battery sensors below threshold | ⚠️ Warning / 🔴 Critical |
| **Updates** | Update entities with `on` state | ℹ️ Info |
| **Weak Signal** | Zigbee LQI, WiFi RSSI below threshold | ⚠️ Warning / 🔴 Critical |
| **Errors** | Entities in error/failed/problem state | ⚠️ Warning |
| **Stale** | Entities unchanged for X hours | ℹ️ Info (⚠️ Warning if >100) |

## 🔧 Development

```bash
npm install
npm run build
npm run dev  # watch mode
```

## 📄 License

MIT
