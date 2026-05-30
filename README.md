# 🏥 Home Health Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)
[![GitHub release](https://img.shields.io/github/v/release/Adrian/ha-home-health-card)](https://github.com/Adrian/ha-home-health-card/releases)
[![License](https://img.shields.io/github/license/Adrian/ha-home-health-card)](LICENSE)

**See everything that's wrong with your home at a glance.**

A comprehensive Home Assistant card that monitors your entire smart home health — unavailable entities, low batteries, weak signals, available updates, stale entities, and error states. All prioritized by severity.

![Home Health Card Preview](https://via.placeholder.com/800x400/1a1a2e/ffffff?text=🏥+Home+Health+Card)

## ✨ Features

- **6 health sections** — unavailable, battery, updates, signal, errors, stale entities
- **Severity prioritization** — critical, warning, info, ok
- **Auto-refresh** — configurable interval
- **Visual config editor** — no YAML needed
- **Click-through** — tap any item for more-info dialog
- **Responsive** — works on mobile and desktop
- **Theme-aware** — respects your HA theme
- **Section collapsing** — expand/collapse sections
- **Integration grouping** — unavailable entities grouped by integration
- **Configurable thresholds** — battery, signal, stale hours
- **Exclusion lists** — hide entities or integrations you don't care about
- **HACS ready** — easy install and updates

## 📦 Installation

### HACS (recommended)

1. Open HACS → Frontend → Custom Repositories
2. Add: `Adrian/ha-home-health-card` (category: Lovelace)
3. Install "Home Health Card"
4. Add the resource: Settings → Dashboards → Resources → Add:
   ```
   /hacsfiles/ha-home-health-card/ha-home-health-card.js
   type: JavaScript Module
   ```

### Manual

1. Download `ha-home-health-card.js` from [Releases](https://github.com/Adrian/ha-home-health-card/releases)
2. Copy to `/config/www/ha-home-health-card.js`
3. Add resource in HA:
   ```
   /local/ha-home-health-card.js
   type: JavaScript Module
   ```

## ⚙️ Configuration

### Minimal

```yaml
type: custom:ha-home-health-card
```

### Full

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
| `show_header` | bool | `true` | Show the header with overall status |
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
# Install dependencies
yarn install

# Development (watch mode)
yarn dev

# Build for production
yarn build

# Lint
yarn lint
```

## 📄 License

MIT

## 🙏 Credits

Built with:
- [Lit](https://lit.dev/) — Web Components
- [custom-card-helpers](https://github.com/custom-cards/custom-card-helpers) — HA card utilities
- [Home Assistant](https://www.home-assistant.io/) — The best home automation platform
