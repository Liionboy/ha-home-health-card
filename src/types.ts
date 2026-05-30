import { LovelaceCardConfig } from 'custom-card-helpers';

export interface HomeHealthCardConfig extends LovelaceCardConfig {
  type: string;
  title?: string;
  show_header?: boolean;
  max_items_per_section?: number;
  sections?: SectionConfig[];
  severity_thresholds?: SeverityThresholds;
  exclude_integrations?: string[];
  exclude_entities?: string[];
  refresh_interval?: number;
}

export interface SectionConfig {
  id: string;
  enabled: boolean;
  title?: string;
  icon?: string;
  max_items?: number;
}

export interface SeverityThresholds {
  battery_low?: number;
  battery_critical?: number;
  signal_weak?: number;
  signal_poor?: number;
  stale_hours?: number;
}

export interface HealthSection {
  id: string;
  title: string;
  icon: string;
  severity: 'critical' | 'warning' | 'info' | 'ok';
  count: number;
  items: HealthItem[];
  enabled: boolean;
  max_items?: number;
}

export interface HealthItem {
  entity_id: string;
  name: string;
  state: string;
  icon?: string;
  severity: 'critical' | 'warning' | 'info';
  detail?: string;
  last_changed?: string;
  area?: string;
  integration?: string;
}

export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
  last_changed: string;
  last_updated: string;
  context: {
    id: string;
    parent_id: string | null;
    user_id: string | null;
  };
}

export interface HassEntities {
  [entity_id: string]: HassEntity;
}

export const DEFAULT_CONFIG: HomeHealthCardConfig = {
  type: 'custom:ha-home-health-card',
  title: 'Home Health',
  show_header: true,
  max_items_per_section: 10,
  severity_thresholds: {
    battery_low: 20,
    battery_critical: 5,
    signal_weak: 50,
    signal_poor: 20,
    stale_hours: 24,
  },
  sections: [
    { id: 'unavailable', enabled: true, title: 'Unavailable Entities', icon: 'mdi:alert-circle-outline' },
    { id: 'battery_low', enabled: true, title: 'Low Batteries', icon: 'mdi:battery-low' },
    { id: 'updates', enabled: true, title: 'Available Updates', icon: 'mdi:update' },
    { id: 'signal_weak', enabled: true, title: 'Weak Signal', icon: 'mdi:wifi-strength-1' },
    { id: 'errors', enabled: true, title: 'Recent Errors', icon: 'mdi:alert-circle' },
    { id: 'stale', enabled: true, title: 'Stale Entities', icon: 'mdi:clock-alert-outline' },
  ],
  exclude_integrations: [],
  exclude_entities: [],
  refresh_interval: 60,
};
