import { LitElement, html, css, CSSResultGroup, TemplateResult, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant, LovelaceCardEditor, fireEvent } from 'custom-card-helpers';
import {
  HomeHealthCardConfig,
  HealthSection,
  HealthItem,
  HassEntities,
  DEFAULT_CONFIG,
} from './types';
import { cardStyles } from './styles/card-styles';
import { computeSections } from './data/health-engine';

const CARD_NAME = 'ha-home-health-card';
const VERSION = '1.0.0';

console.info(
  `%c 🏥 HOME-HEALTH-CARD %c v${VERSION} `,
  'color: #fff; background: #ef4444; font-weight: 700; border-radius: 4px 0 0 4px; padding: 2px 6px;',
  'color: #fff; background: #6b7280; font-weight: 700; border-radius: 0 4px 4px 0; padding: 2px 6px;',
);

@customElement(CARD_NAME)
export class HomeHealthCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public config!: HomeHealthCardConfig;

  @state() private _sections: HealthSection[] = [];
  @state() private _loading = true;
  @state() private _expandedSections: Set<string> = new Set();
  @state() private _lastRefresh = 0;

  private _interval: ReturnType<typeof setInterval> | null = null;

  static get elementVersion(): string {
    return VERSION;
  }

  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    await import('./editor/ha-home-health-card-editor');
    return document.createElement('ha-home-health-card-editor') as LovelaceCardEditor;
  }

  public static getStubConfig(): HomeHealthCardConfig {
    return { ...DEFAULT_CONFIG };
  }

  setConfig(config: HomeHealthCardConfig): void {
    if (!config || config.show_error) {
      throw new Error('Invalid configuration');
    }
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      type: CARD_NAME,
    };
  }

  connectedCallback(): void {
    super.connectedCallback();
    this._startAutoRefresh();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._stopAutoRefresh();
  }

  updated(changedProps: Map<string, unknown>): void {
    super.updated(changedProps);
    if (changedProps.has('hass') && this.hass) {
      this._computeHealth();
    }
  }

  private _startAutoRefresh(): void {
    this._stopAutoRefresh();
    const interval = (this.config?.refresh_interval ?? 60) * 1000;
    this._interval = setInterval(() => this._computeHealth(), interval);
  }

  private _stopAutoRefresh(): void {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
  }

  private _computeHealth(): void {
    if (!this.hass) return;
    const now = Date.now();
    // Throttle to max once per 5 seconds
    if (now - this._lastRefresh < 5000) return;
    this._lastRefresh = now;

    this._sections = computeSections(this.hass.states, this.config);
    this._loading = false;
  }

  private _toggleSection(sectionId: string): void {
    const newSet = new Set(this._expandedSections);
    if (newSet.has(sectionId)) {
      newSet.delete(sectionId);
    } else {
      newSet.add(sectionId);
    }
    this._expandedSections = newSet;
  }

  private _handleAction(entityId: string, action: string): void {
    switch (action) {
      case 'more-info':
        fireEvent(this, 'hass-more-info', { entityId });
        break;
      case 'toggle':
        this.hass.callService('homeassistant', 'toggle', { entity_id: entityId });
        break;
      case 'disable':
        this.hass.callService('homeassistant', 'disable_entity', { entity_id: entityId });
        break;
    }
  }

  private _refreshNow(): void {
    this._lastRefresh = 0;
    this._computeHealth();
  }

  private _getOverallSeverity(): 'critical' | 'warning' | 'info' | 'ok' {
    if (this._sections.some((s) => s.severity === 'critical' && s.count > 0)) return 'critical';
    if (this._sections.some((s) => s.severity === 'warning' && s.count > 0)) return 'warning';
    if (this._sections.some((s) => s.severity === 'info' && s.count > 0)) return 'info';
    return 'ok';
  }

  private _getOverallIcon(): string {
    const sev = this._getOverallSeverity();
    switch (sev) {
      case 'critical':
        return 'mdi:heart-broken';
      case 'warning':
        return 'mdi:heart-pulse';
      case 'info':
        return 'mdi:heart-outline';
      case 'ok':
        return 'mdi:heart';
    }
  }

  private _getOverallLabel(): string {
    const sev = this._getOverallSeverity();
    const total = this._sections.reduce((acc, s) => acc + s.count, 0);
    switch (sev) {
      case 'critical':
        return `${total} issues need attention`;
      case 'warning':
        return `${total} warnings`;
      case 'info':
        return `${total} items to review`;
      case 'ok':
        return 'Everything looks healthy';
    }
  }

  getCardSize(): number {
    const activeSections = this._sections.filter((s) => s.enabled && s.count > 0);
    return 2 + activeSections.length * 2;
  }

  getGridOptions() {
    return {
      min: 2,
      max: 6,
      default: 3,
    };
  }

  protected render(): TemplateResult | typeof nothing {
    if (!this.config || !this.hass) return nothing;

    if (this._loading) {
      return html`
        <ha-card>
          <div class="loading">
            <ha-circular-progress active></ha-circular-progress>
            <span>Analyzing home health...</span>
          </div>
        </ha-card>
      `;
    }

    const activeSections = this._sections.filter((s) => s.enabled);

    return html`
      <ha-card>
        ${this.config.show_header !== false ? this._renderHeader() : nothing}
        <div class="card-content">
          ${activeSections.length === 0
            ? this._renderEmptyState()
            : activeSections.map((section) => this._renderSection(section))}
        </div>
        ${this._renderFooter()}
      </ha-card>
    `;
  }

  private _renderHeader(): TemplateResult {
    const severity = this._getOverallSeverity();
    const icon = this._getOverallIcon();
    const label = this._getOverallLabel();
    const totalIssues = this._sections.reduce((acc, s) => acc + s.count, 0);

    return html`
      <div class="header severity-${severity}">
        <div class="header-icon">
          <ha-icon .icon=${icon}></ha-icon>
        </div>
        <div class="header-text">
          <div class="header-title">${this.config.title || 'Home Health'}</div>
          <div class="header-subtitle">${label}</div>
        </div>
        <div class="header-badge severity-${severity}">
          ${totalIssues > 0 ? totalIssues : '✓'}
        </div>
      </div>
    `;
  }

  private _renderSection(section: HealthSection): TemplateResult {
    const isExpanded = this._expandedSections.has(section.id);
    const displayItems = section.items.slice(0, section.max_items ?? this.config.max_items_per_section ?? 10);
    const hasMore = section.items.length > displayItems.length;

    return html`
      <div class="section severity-${section.severity}">
        <div class="section-header" @click=${() => this._toggleSection(section.id)}>
          <div class="section-icon">
            <ha-icon .icon=${section.icon}></ha-icon>
          </div>
          <div class="section-title">${section.title}</div>
          <div class="section-count severity-${section.severity}">${section.count}</div>
          <ha-icon
            class="section-chevron ${isExpanded ? 'expanded' : ''}"
            icon="mdi:chevron-down"
          ></ha-icon>
        </div>
        ${isExpanded
          ? html`
              <div class="section-items">
                ${displayItems.map((item) => this._renderItem(item))}
                ${hasMore
                  ? html`
                      <div class="section-more">
                        +${section.items.length - displayItems.length} more...
                      </div>
                    `
                  : nothing}
              </div>
            `
          : nothing}
      </div>
    `;
  }

  private _renderItem(item: HealthItem): TemplateResult {
    return html`
      <div class="item severity-${item.severity}">
        <div class="item-icon" @click=${() => this._handleAction(item.entity_id, 'more-info')}>
          <ha-icon .icon=${item.icon || 'mdi:circle-small'}></ha-icon>
        </div>
        <div class="item-body" @click=${() => this._handleAction(item.entity_id, 'more-info')}>
          <div class="item-name">${item.name}</div>
          <div class="item-detail">
            ${item.detail || item.state}
            ${item.area ? html`<span class="item-area">${item.area}</span>` : nothing}
            ${item.integration
              ? html`<span class="item-integration">${item.integration}</span>`
              : nothing}
          </div>
        </div>
        <div class="item-actions">
          <mwc-icon-button
            class="action-btn"
            title="More info"
            @click=${() => this._handleAction(item.entity_id, 'more-info')}
          >
            <ha-icon icon="mdi:information-outline"></ha-icon>
          </mwc-icon-button>
        </div>
      </div>
    `;
  }

  private _renderEmptyState(): TemplateResult {
    return html`
      <div class="empty-state">
        <ha-icon icon="mdi:heart"></ha-icon>
        <div class="empty-title">All Clear!</div>
        <div class="empty-subtitle">Your home is healthy. No issues detected.</div>
      </div>
    `;
  }

  private _renderFooter(): TemplateResult {
    const refreshSecs = this.config.refresh_interval ?? 60;
    return html`
      <div class="footer">
        <span class="footer-time">
          Last check: ${new Date(this._lastRefresh).toLocaleTimeString()}
        </span>
        <mwc-icon-button class="refresh-btn" title="Refresh now" @click=${this._refreshNow}>
          <ha-icon icon="mdi:refresh"></ha-icon>
        </mwc-icon-button>
      </div>
    `;
  }

  static get styles(): CSSResultGroup {
    return cardStyles;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ha-home-health-card': HomeHealthCard;
  }
}
