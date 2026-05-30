import { css } from 'lit';

export const cardStyles = css`
  :host {
    display: block;
  }

  ha-card {
    border-radius: 16px;
    overflow: hidden;
  }

  /* === LOADING === */
  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 32px;
    color: var(--secondary-text-color, #9ca3af);
  }

  /* === HEADER === */
  .header {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 18px 20px;
    cursor: pointer;
    transition: background 0.2s;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .header:hover {
    background: rgba(255, 255, 255, 0.04);
  }

  .header-icon ha-icon {
    --mdc-icon-size: 32px;
  }

  .header.severity-critical .header-icon ha-icon {
    color: #ef4444;
  }

  .header.severity-warning .header-icon ha-icon {
    color: #f59e0b;
  }

  .header.severity-info .header-icon ha-icon {
    color: #3b82f6;
  }

  .header.severity-ok .header-icon ha-icon {
    color: #22c55e;
  }

  .header-text {
    flex: 1;
    min-width: 0;
  }

  .header-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--primary-text-color, #fff);
    line-height: 1.3;
  }

  .header-subtitle {
    font-size: 13px;
    color: var(--secondary-text-color, #9ca3af);
    line-height: 1.3;
    margin-top: 2px;
  }

  .header-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 32px;
    height: 32px;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 700;
    padding: 0 10px;
  }

  .header-badge.severity-critical {
    background: rgba(239, 68, 68, 0.15);
    color: #ef4444;
  }

  .header-badge.severity-warning {
    background: rgba(245, 158, 11, 0.15);
    color: #f59e0b;
  }

  .header-badge.severity-info {
    background: rgba(59, 130, 246, 0.15);
    color: #3b82f6;
  }

  .header-badge.severity-ok {
    background: rgba(34, 197, 94, 0.15);
    color: #22c55e;
  }

  /* === CARD CONTENT === */
  .card-content {
    padding: 8px 0;
  }

  /* === SECTIONS === */
  .section {
    margin: 4px 12px;
    border-radius: 12px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.06);
    transition: border-color 0.2s;
  }

  .section:hover {
    border-color: rgba(255, 255, 255, 0.12);
  }

  .section.severity-critical {
    border-left: 3px solid #ef4444;
  }

  .section.severity-warning {
    border-left: 3px solid #f59e0b;
  }

  .section.severity-info {
    border-left: 3px solid #3b82f6;
  }

  .section.severity-ok {
    border-left: 3px solid #22c55e;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    cursor: pointer;
    transition: background 0.2s;
    user-select: none;
  }

  .section-header:hover {
    background: rgba(255, 255, 255, 0.04);
  }

  .section-icon ha-icon {
    --mdc-icon-size: 20px;
  }

  .section.severity-critical .section-icon ha-icon {
    color: #ef4444;
  }

  .section.severity-warning .section-icon ha-icon {
    color: #f59e0b;
  }

  .section.severity-info .section-icon ha-icon {
    color: #3b82f6;
  }

  .section.severity-ok .section-icon ha-icon {
    color: #22c55e;
  }

  .section-title {
    flex: 1;
    font-size: 14px;
    font-weight: 500;
    color: var(--primary-text-color, #fff);
  }

  .section-count {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 28px;
    height: 24px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 700;
    padding: 0 8px;
  }

  .section-count.severity-critical {
    background: rgba(239, 68, 68, 0.15);
    color: #ef4444;
  }

  .section-count.severity-warning {
    background: rgba(245, 158, 11, 0.15);
    color: #f59e0b;
  }

  .section-count.severity-info {
    background: rgba(59, 130, 246, 0.15);
    color: #3b82f6;
  }

  .section-count.severity-ok {
    background: rgba(34, 197, 94, 0.15);
    color: #22c55e;
  }

  .section-chevron {
    --mdc-icon-size: 20px;
    color: var(--secondary-text-color, #6b7280);
    transition: transform 0.2s;
  }

  .section-chevron.expanded {
    transform: rotate(180deg);
  }

  /* === SECTION ITEMS === */
  .section-items {
    padding: 0 14px 10px;
  }

  .item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border-radius: 8px;
    transition: background 0.2s;
    cursor: pointer;
  }

  .item:hover {
    background: rgba(255, 255, 255, 0.06);
  }

  .item-icon ha-icon {
    --mdc-icon-size: 18px;
    color: var(--secondary-text-color, #9ca3af);
  }

  .item.severity-critical .item-icon ha-icon {
    color: #ef4444;
  }

  .item.severity-warning .item-icon ha-icon {
    color: #f59e0b;
  }

  .item-body {
    flex: 1;
    min-width: 0;
  }

  .item-name {
    font-size: 13px;
    font-weight: 500;
    color: var(--primary-text-color, #fff);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .item-detail {
    font-size: 11px;
    color: var(--secondary-text-color, #9ca3af);
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
  }

  .item-area,
  .item-integration {
    display: inline-block;
    padding: 1px 6px;
    border-radius: 4px;
    font-size: 10px;
    background: rgba(255, 255, 255, 0.06);
  }

  .item-actions {
    display: flex;
    gap: 4px;
  }

  .action-btn {
    --mdc-icon-button-size: 28px;
    color: var(--secondary-text-color, #6b7280);
  }

  .action-btn:hover {
    color: var(--primary-text-color, #fff);
  }

  /* === MORE === */
  .section-more {
    text-align: center;
    padding: 8px;
    font-size: 12px;
    color: var(--secondary-text-color, #6b7280);
    cursor: pointer;
  }

  .section-more:hover {
    color: var(--primary-text-color, #fff);
  }

  /* === EMPTY STATE === */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 40px 20px;
    text-align: center;
  }

  .empty-state ha-icon {
    --mdc-icon-size: 48px;
    color: #22c55e;
  }

  .empty-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--primary-text-color, #fff);
  }

  .empty-subtitle {
    font-size: 13px;
    color: var(--secondary-text-color, #9ca3af);
  }

  /* === FOOTER === */
  .footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 16px 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }

  .footer-time {
    font-size: 11px;
    color: var(--secondary-text-color, #6b7280);
  }

  .refresh-btn {
    --mdc-icon-button-size: 28px;
    color: var(--secondary-text-color, #6b7280);
    transition: transform 0.3s;
  }

  .refresh-btn:hover {
    color: var(--primary-text-color, #fff);
    transform: rotate(180deg);
  }
`;
