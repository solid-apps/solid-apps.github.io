/**
 * {{LABEL}} view pane — bespoke renderer for urn:solid:{{TYPE}}.
 *
 * Reads the JSON-LD data island and renders a custom view. Drop in
 * alongside ui-pane (Inline) and schema-pane (Edit) — LOSOS shows them
 * all as tabs.
 *
 * AGPL-3.0 — part of solid-apps
 */

import { html, render } from 'https://losos.org/losos/html.js'

export default {
  label: '{{LABEL}}',
  icon: '{{ICON}}',

  canHandle(subject, store) {
    const node = store.get(subject.value)
    if (!node) return false
    const t = store.type(node)
    if (!t) return false
    return Array.isArray(t)
      ? t.some(x => /{{TYPE}}/i.test(x))
      : /{{TYPE}}/i.test(t)
  },

  render(subject, lionStore, container, rawData) {
    let data = rawData
    if (!data) {
      const dataEl = document.querySelector('script[type="application/ld+json"]')
      try { data = JSON.parse(dataEl.textContent) } catch { return }
    }

    const title = data.title || data.name || data['@id'] || '{{LABEL}}'

    render(container, html`
      <style>
        .v-bg {
          min-height: 100vh;
          background: linear-gradient(180deg, #fafaf8 0%, #f0efeb 100%);
          padding: 56px 24px 96px;
        }
        .v-card {
          max-width: 640px; margin: 0 auto;
          background: #fff;
          border: 1px solid #e5e3de;
          border-radius: 16px;
          padding: 40px 36px;
        }
        .v-title {
          font: 500 28px/1.2 Georgia, serif;
          color: #1a1a1a; margin: 0;
        }
      </style>
      <div class="v-bg">
        <div class="v-card">
          <h1 class="v-title">${title}</h1>
          <!-- TODO: add fields from your data here -->
        </div>
      </div>
    `)
  }
}
