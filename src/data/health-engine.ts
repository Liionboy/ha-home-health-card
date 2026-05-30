import {
  HomeHealthCardConfig,
  HealthSection,
  HealthItem,
  HassEntities,
  DEFAULT_CONFIG,
} from '../types';

interface EntityState {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
  last_changed: string;
  last_updated: string;
}

/**
 * Core health engine — analyzes all HA entities and returns prioritized health sections.
 */
export function computeSections(
  entities: HassEntities,
  config: HomeHealthCardConfig
): HealthSection[] {
  const thresholds = {
    ...DEFAULT_CONFIG.severity_thresholds,
    ...config.severity_thresholds,
  };

  const excludeEntities = new Set(config.exclude_entities ?? []);
  const excludeIntegrations = new Set(config.exclude_integrations ?? []);

  const isExcluded = (entityId: string): boolean => {
    if (excludeEntities.has(entityId)) return true;
    const platform = (entities[entityId]?.attributes as Record<string, unknown>)?.platform as string;
    if (platform && excludeIntegrations.has(platform)) return true;
    return false;
  };

  const now = Date.now();

  const sections: HealthSection[] = [];

  // === 1. UNAVAILABLE ENTITIES ===
  if (isSectionEnabled(config, 'unavailable')) {
    const items: HealthItem[] = [];
    const byIntegration: Record<string, number> = {};

    for (const [id, entity] of Object.entries(entities)) {
      if (entity.state !== 'unavailable') continue;
      if (isExcluded(id)) continue;

      const platform = (entity.attributes as Record<string, unknown>)?.platform as string || 'unknown';
      byIntegration[platform] = (byIntegration[platform] || 0) + 1;

      items.push({
        entity_id: id,
        name: friendlyName(id, entity.attributes),
        state: 'unavailable',
        icon: 'mdi:alert-circle-outline',
        severity: 'warning',
        detail: `Integration: ${platform}`,
        last_changed: entity.last_changed,
        integration: platform,
      });
    }

    // Sort: group by integration, then by name
    items.sort((a, b) => {
      const intComp = (a.integration || '').localeCompare(b.integration || '');
      if (intComp !== 0) return intComp;
      return a.name.localeCompare(b.name);
    });

    sections.push({
      id: 'unavailable',
      title: getSectionTitle(config, 'unavailable', 'Unavailable Entities'),
      icon: getSectionIcon(config, 'unavailable', 'mdi:alert-circle-outline'),
      severity: items.length > 20 ? 'critical' : items.length > 0 ? 'warning' : 'ok',
      count: items.length,
      items,
      enabled: true,
      max_items: getSectionMaxItems(config, 'unavailable'),
    });
  }

  // === 2. LOW BATTERIES ===
  if (isSectionEnabled(config, 'battery_low')) {
    const items: HealthItem[] = [];

    for (const [id, entity] of Object.entries(entities)) {
      if (!id.includes('battery') && !id.includes('_battery')) continue;
      if (isExcluded(id)) continue;

      const batteryLevel = parseFloat(entity.state);
      if (isNaN(batteryLevel)) continue;

      const isCritical = batteryLevel <= (thresholds.battery_critical ?? 5);
      const isLow = batteryLevel <= (thresholds.battery_low ?? 20);

      if (!isLow) continue;

      items.push({
        entity_id: id,
        name: friendlyName(id, entity.attributes),
        state: `${batteryLevel}%`,
        icon: isCritical ? 'mdi:battery-alert' : 'mdi:battery-low',
        severity: isCritical ? 'critical' : 'warning',
        detail: `Battery at ${batteryLevel}%`,
        last_changed: entity.last_changed,
      });
    }

    items.sort((a, b) => parseFloat(a.state) - parseFloat(b.state));

    sections.push({
      id: 'battery_low',
      title: getSectionTitle(config, 'battery_low', 'Low Batteries'),
      icon: getSectionIcon(config, 'battery_low', 'mdi:battery-low'),
      severity: items.some((i) => i.severity === 'critical') ? 'critical' : items.length > 0 ? 'warning' : 'ok',
      count: items.length,
      items,
      enabled: true,
      max_items: getSectionMaxItems(config, 'battery_low'),
    });
  }

  // === 3. AVAILABLE UPDATES ===
  if (isSectionEnabled(config, 'updates')) {
    const items: HealthItem[] = [];

    for (const [id, entity] of Object.entries(entities)) {
      if (!id.startsWith('update.')) continue;
      if (entity.state !== 'on') continue;
      if (isExcluded(id)) continue;

      const latestVersion = (entity.attributes as Record<string, unknown>)?.latest_version as string;
      const installedVersion = (entity.attributes as Record<string, unknown>)?.installed_version as string;

      items.push({
        entity_id: id,
        name: friendlyName(id, entity.attributes),
        state: latestVersion || 'update available',
        icon: 'mdi:update',
        severity: 'info',
        detail: installedVersion ? `${installedVersion} → ${latestVersion}` : `Update available`,
        last_changed: entity.last_changed,
      });
    }

    items.sort((a, b) => a.name.localeCompare(b.name));

    sections.push({
      id: 'updates',
      title: getSectionTitle(config, 'updates', 'Available Updates'),
      icon: getSectionIcon(config, 'updates', 'mdi:update'),
      severity: items.length > 0 ? 'info' : 'ok',
      count: items.length,
      items,
      enabled: true,
      max_items: getSectionMaxItems(config, 'updates'),
    });
  }

  // === 4. WEAK SIGNAL (Zigbee/Z-Wave/WiFi) ===
  if (isSectionEnabled(config, 'signal_weak')) {
    const items: HealthItem[] = [];

    for (const [id, entity] of Object.entries(entities)) {
      const isSignalEntity =
        id.includes('_lqi') ||
        id.includes('_rssi') ||
        id.includes('linkquality') ||
        id.includes('signal_strength');

      if (!isSignalEntity) continue;
      if (isExcluded(id)) continue;

      const value = parseFloat(entity.state);
      if (isNaN(value)) continue;

      let severity: 'critical' | 'warning' | 'info' = 'info';
      let detail = '';

      if (id.includes('_rssi') || id.includes('signal_strength')) {
        // RSSI: closer to 0 is better, below -80 is poor
        if (value < -90) {
          severity = 'critical';
          detail = `RSSI: ${value} dBm (very poor)`;
        } else if (value < (thresholds.signal_poor ?? -80)) {
          severity = 'critical';
          detail = `RSSI: ${value} dBm (poor)`;
        } else if (value < (thresholds.signal_weak ?? -70)) {
          severity = 'warning';
          detail = `RSSI: ${value} dBm (weak)`;
        } else {
          continue; // Signal is fine
        }
      } else {
        // LQI: higher is better, 0-255 scale typically
        if (value < (thresholds.signal_poor ?? 20)) {
          severity = 'critical';
          detail = `LQI: ${value} (poor)`;
        } else if (value < (thresholds.signal_weak ?? 50)) {
          severity = 'warning';
          detail = `LQI: ${value} (weak)`;
        } else {
          continue; // Signal is fine
        }
      }

      items.push({
        entity_id: id,
        name: friendlyName(id, entity.attributes),
        state: entity.state,
        icon: severity === 'critical' ? 'mdi:wifi-strength-1-alert' : 'mdi:wifi-strength-1',
        severity,
        detail,
        last_changed: entity.last_changed,
      });
    }

    items.sort((a, b) => {
      const sevOrder = { critical: 0, warning: 1, info: 2 };
      return (sevOrder[a.severity] ?? 3) - (sevOrder[b.severity] ?? 3);
    });

    sections.push({
      id: 'signal_weak',
      title: getSectionTitle(config, 'signal_weak', 'Weak Signal'),
      icon: getSectionIcon(config, 'signal_weak', 'mdi:wifi-strength-1'),
      severity: items.some((i) => i.severity === 'critical') ? 'critical' : items.length > 0 ? 'warning' : 'ok',
      count: items.length,
      items,
      enabled: true,
      max_items: getSectionMaxItems(config, 'signal_weak'),
    });
  }

  // === 5. RECENT ERRORS (entities in error/failed state) ===
  if (isSectionEnabled(config, 'errors')) {
    const items: HealthItem[] = [];

    for (const [id, entity] of Object.entries(entities)) {
      if (isExcluded(id)) continue;

      const state = entity.state.toLowerCase();
      const isErrorState =
        state === 'error' ||
        state === 'failed' ||
        state === 'unavailable' ||
        state === 'problem' ||
        state === 'locked';

      if (!isErrorState) continue;
      // Skip if already counted in unavailable
      if (state === 'unavailable') continue;

      items.push({
        entity_id: id,
        name: friendlyName(id, entity.attributes),
        state: entity.state,
        icon: 'mdi:alert-circle',
        severity: 'warning',
        detail: `State: ${entity.state}`,
        last_changed: entity.last_changed,
      });
    }

    sections.push({
      id: 'errors',
      title: getSectionTitle(config, 'errors', 'Error States'),
      icon: getSectionIcon(config, 'errors', 'mdi:alert-circle'),
      severity: items.length > 0 ? 'warning' : 'ok',
      count: items.length,
      items,
      enabled: true,
      max_items: getSectionMaxItems(config, 'errors'),
    });
  }

  // === 6. STALE ENTITIES (haven't updated in X hours) ===
  if (isSectionEnabled(config, 'stale')) {
    const items: HealthItem[] = [];
    const staleMs = (thresholds.stale_hours ?? 24) * 60 * 60 * 1000;

    for (const [id, entity] of Object.entries(entities)) {
      if (isExcluded(id)) continue;
      // Skip entities that are naturally static
      if (id.startsWith('zone.') || id.startsWith('person.') || id.startsWith('scene.')) continue;
      // Skip unavailable (handled separately)
      if (entity.state === 'unavailable') continue;
      // Skip entities with 'unknown' state (may just not have data yet)
      if (entity.state === 'unknown') continue;

      const lastChanged = new Date(entity.last_changed).getTime();
      const ageMs = now - lastChanged;

      if (ageMs > staleMs) {
        const hours = Math.floor(ageMs / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);
        const timeStr = days > 0 ? `${days}d ${hours % 24}h` : `${hours}h`;

        items.push({
          entity_id: id,
          name: friendlyName(id, entity.attributes),
          state: entity.state,
          icon: 'mdi:clock-alert-outline',
          severity: days > 7 ? 'warning' : 'info',
          detail: `Last changed ${timeStr} ago`,
          last_changed: entity.last_changed,
        });
      }
    }

    // Sort by age (oldest first)
    items.sort(
      (a, b) =>
        new Date(a.last_changed || 0).getTime() - new Date(b.last_changed || 0).getTime()
    );

    // Only keep top N stale entities (otherwise list is too long)
    const maxStale = 50;

    sections.push({
      id: 'stale',
      title: getSectionTitle(config, 'stale', 'Stale Entities'),
      icon: getSectionIcon(config, 'stale', 'mdi:clock-alert-outline'),
      severity: items.length > 100 ? 'critical' : items.length > 0 ? 'info' : 'ok',
      count: items.length,
      items: items.slice(0, maxStale),
      enabled: true,
      max_items: getSectionMaxItems(config, 'stale'),
    });
  }

  return sections;
}

// === Helpers ===

function friendlyName(entityId: string, attributes: Record<string, unknown>): string {
  return (attributes?.friendly_name as string) || entityId;
}

function isSectionEnabled(config: HomeHealthCardConfig, sectionId: string): boolean {
  const section = config.sections?.find((s) => s.id === sectionId);
  return section ? section.enabled : true;
}

function getSectionTitle(config: HomeHealthCardConfig, sectionId: string, fallback: string): string {
  const section = config.sections?.find((s) => s.id === sectionId);
  return section?.title || fallback;
}

function getSectionIcon(config: HomeHealthCardConfig, sectionId: string, fallback: string): string {
  const section = config.sections?.find((s) => s.id === sectionId);
  return section?.icon || fallback;
}

function getSectionMaxItems(config: HomeHealthCardConfig, sectionId: string): number {
  const section = config.sections?.find((s) => s.id === sectionId);
  return section?.max_items ?? config.max_items_per_section ?? 10;
}
