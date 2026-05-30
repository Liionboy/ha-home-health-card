import { LitElement, html, css, TemplateResult, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant, fireEvent } from 'custom-card-helpers';
import { HomeHealthCardConfig, DEFAULT_CONFIG, SectionConfig } from '../types';

@customElement('ha-home-health-card-editor')
export class HomeHealthCardEditor extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public config!: HomeHealthCardConfig;

  @state() private _config!: HomeHealthCardConfig;

  public setConfig(config: HomeHealthCardConfig): void {
    this._config = { ...DEFAULT_CONFIG, ...config };
  }

  private _updateConfig(key: string, value: unknown): void {
    if (!this._config) return;
    const newConfig = { ...this._config, [key]: value };
    this._config = newConfig;
    fireEvent(this, 'config-changed', { config: newConfig });
  }

  private _updateSection(sectionId: string, key: string, value: unknown): void {
    if (!this._config?.sections) return;
    const sections = this._config.sections.map((s) =>
      s.id === sectionId ? { ...s, [key]: value } : s
    );
    this._updateConfig('sections', sections);
  }

  private _updateThreshold(key: string, value: number): void {
    const thresholds = { ...this._config.severity_thresholds, [key]: value };
    this._updateConfig('severity_thresholds', thresholds);
  }

  protected render(): TemplateResult | typeof nothing {
    if (!this.hass || !this._config) return nothing;

    return html`
      <div class="card-config">
        <!-- General Settings -->
        <div class="section-title">General</div>

        <div class="option">
          <ha-textfield
            label="Title"
            .value=${this._config.title || 'Home Health'}
            @input=${(e: Event) =>
              this._updateConfig('title', (e.target as HTMLInputElement).value)}
          ></ha-textfield>
        </div>

        <div class="option row">
          <ha-switch
            .checked=${this._config.show_header !== false}
            @change=${(e: Event) =>
              this._updateConfig('show_header', (e.target as HTMLInputElement).checked)}
          ></ha-switch>
          <span>Show Header</span>
        </div>

        <div class="option">
          <ha-textfield
            label="Max items per section"
            type="number"
            min="1"
            max="50"
            .value=${String(this._config.max_items_per_section ?? 10)}
            @input=${(e: Event) =>
              this._updateConfig(
                'max_items_per_section',
                parseInt((e.target as HTMLInputElement).value) || 10
              )}
          ></ha-textfield>
        </div>

        <div class="option">
          <ha-textfield
            label="Refresh interval (seconds)"
            type="number"
            min="10"
            max="3600"
            .value=${String(this._config.refresh_interval ?? 60)}
            @input=${(e: Event) =>
              this._updateConfig(
                'refresh_interval',
                parseInt((e.target as HTMLInputElement).value) || 60
              )}
          ></ha-textfield>
        </div>

        <!-- Sections -->
        <div class="section-title">Sections</div>

        ${(this._config.sections ?? []).map(
          (section) => html`
            <div class="section-config">
              <div class="section-config-header">
                <ha-switch
                  .checked=${section.enabled}
                  @change=${(e: Event) =>
                    this._updateSection(
                      section.id,
                      'enabled',
                      (e.target as HTMLInputElement).checked
                    )}
                ></ha-switch>
                <ha-icon .icon=${section.icon || 'mdi:circle-small'}></ha-icon>
                <span class="section-config-title">${section.title || section.id}</span>
              </div>
              ${section.enabled
                ? html`
                    <div class="section-config-body">
                      <ha-textfield
                        label="Title"
                        .value=${section.title || ''}
                        @input=${(e: Event) =>
                          this._updateSection(
                            section.id,
                            'title',
                            (e.target as HTMLInputElement).value
                          )}
                      ></ha-textfield>
                      <ha-textfield
                        label="Icon"
                        .value=${section.icon || ''}
                        @input=${(e: Event) =>
                          this._updateSection(
                            section.id,
                            'icon',
                            (e.target as HTMLInputElement).value
                          )}
                      ></ha-textfield>
                      <ha-textfield
                        label="Max items"
                        type="number"
                        min="1"
                        max="50"
                        .value=${String(section.max_items ?? '')}
                        @input=${(e: Event) =>
                          this._updateSection(
                            section.id,
                            'max_items',
                            parseInt((e.target as HTMLInputElement).value) || undefined
                          )}
                      ></ha-textfield>
                    </div>
                  `
                : nothing}
            </div>
          `
        )}

        <!-- Thresholds -->
        <div class="section-title">Severity Thresholds</div>

        <div class="threshold-grid">
          <ha-textfield
            label="Battery low (%)"
            type="number"
            min="0"
            max="100"
            .value=${String(this._config.severity_thresholds?.battery_low ?? 20)}
            @input=${(e: Event) =>
              this._updateThreshold(
                'battery_low',
                parseInt((e.target as HTMLInputElement).value) || 20
              )}
          ></ha-textfield>
          <ha-textfield
            label="Battery critical (%)"
            type="number"
            min="0"
            max="100"
            .value=${String(this._config.severity_thresholds?.battery_critical ?? 5)}
            @input=${(e: Event) =>
              this._updateThreshold(
                'battery_critical',
                parseInt((e.target as HTMLInputElement).value) || 5
              )}
          ></ha-textfield>
          <ha-textfield
            label="Signal weak (LQI)"
            type="number"
            min="0"
            max="255"
            .value=${String(this._config.severity_thresholds?.signal_weak ?? 50)}
            @input=${(e: Event) =>
              this._updateThreshold(
                'signal_weak',
                parseInt((e.target as HTMLInputElement).value) || 50
              )}
          ></ha-textfield>
          <ha-textfield
            label="Signal poor (LQI)"
            type="number"
            min="0"
            max="255"
            .value=${String(this._config.severity_thresholds?.signal_poor ?? 20)}
            @input=${(e: Event) =>
              this._updateThreshold(
                'signal_poor',
                parseInt((e.target as HTMLInputElement).value) || 20
              )}
          ></ha-textfield>
          <ha-textfield
            label="Stale after (hours)"
            type="number"
            min="1"
            max="720"
            .value=${String(this._config.severity_thresholds?.stale_hours ?? 24)}
            @input=${(e: Event) =>
              this._updateThreshold(
                'stale_hours',
                parseInt((e.target as HTMLInputElement).value) || 24
              )}
          ></ha-textfield>
        </div>

        <!-- Exclusions -->
        <div class="section-title">Exclusions</div>

        <div class="option">
          <ha-textfield
            label="Exclude entities (comma-separated)"
            .value=${(this._config.exclude_entities ?? []).join(', ')}
            @input=${(e: Event) =>
              this._updateConfig(
                'exclude_entities',
                (e.target as HTMLInputElement).value
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean)
              )}
          ></ha-textfield>
        </div>

        <div class="option">
          <ha-textfield
            label="Exclude integrations (comma-separated)"
            .value=${(this._config.exclude_integrations ?? []).join(', ')}
            @input=${(e: Event) =>
              this._updateConfig(
                'exclude_integrations',
                (e.target as HTMLInputElement).value
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean)
              )}
          ></ha-textfield>
        </div>
      </div>
    `;
  }

  static get styles() {
    return css`
      .card-config {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 4px 0;
      }

      .section-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-text-color);
        margin-top: 8px;
        padding-bottom: 4px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .option {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .option.row {
        flex-direction: row;
        align-items: center;
        gap: 12px;
      }

      .option.row span {
        font-size: 14px;
        color: var(--primary-text-color);
      }

      ha-textfield {
        width: 100%;
      }

      .section-config {
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 8px;
        padding: 10px;
      }

      .section-config-header {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .section-config-header ha-icon {
        --mdc-icon-size: 18px;
        color: var(--secondary-text-color);
      }

      .section-config-title {
        font-size: 14px;
        font-weight: 500;
        color: var(--primary-text-color);
      }

      .section-config-body {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 10px;
        padding-top: 10px;
        border-top: 1px solid rgba(255, 255, 255, 0.06);
      }

      .threshold-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }

      @media (max-width: 400px) {
        .threshold-grid {
          grid-template-columns: 1fr;
        }
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ha-home-health-card-editor': HomeHealthCardEditor;
  }
}
