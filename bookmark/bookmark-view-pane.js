/**
 * Bookmark view pane — renders a urn:solid:Bookmark as a card.
 *
 * Schema-aware (reads Bookmark fields: title, recalls, description, hasTopic,
 * created, attributedTo) but bespoke layout — favicon hero, big title link,
 * description prose, tag pills, saved-on footer.
 *
 * Same data, different lens. Drop in alongside ui-pane (Inline) and
 * schema-pane (Edit) — LOSOS shows them all as tabs.
 *
 * AGPL-3.0 — part of solid-apps
 */

import { html, render } from 'https://losos.org/losos/html.js'

const niceHost = (u) => { try { return new URL(u).host.replace(/^www\./, '') } catch { return u } }
const niceDate = (s) => { try { return new Date(s).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) } catch { return s } }
const faviconFor = (u) => { try { const url = new URL(u); return `https://www.google.com/s2/favicons?domain=${url.host}&sz=128` } catch { return null } }

export default {
  label: 'Bookmark',
  icon: '\ud83d\udd16',

  canHandle(subject, store) {
    const node = store.get(subject.value)
    if (!node) return false
    const t = store.type(node)
    if (!t) return false
    return Array.isArray(t)
      ? t.some(x => /Bookmark/i.test(x))
      : /Bookmark/i.test(t)
  },

  render(subject, lionStore, container, rawData) {
    let data = rawData
    if (!data) {
      const dataEl = document.querySelector('script[type="application/ld+json"]')
      try { data = JSON.parse(dataEl.textContent) } catch { return }
    }

    const title = data.title || data['@id'] || 'Untitled'
    const recalls = (typeof data.recalls === 'object' ? data.recalls['@id'] : data.recalls) || ''
    const description = data.description || ''
    const tags = Array.isArray(data.hasTopic) ? data.hasTopic : (data.hasTopic ? [data.hasTopic] : [])
    const created = data.created
    const attributedTo = data.attributedTo
      ? (typeof data.attributedTo === 'string' ? data.attributedTo : data.attributedTo['@id'] || data.attributedTo.name)
      : null
    const favicon = recalls ? faviconFor(recalls) : null

    render(container, html`
      <style>
        .bv-bg {
          min-height: 100vh;
          background:
            radial-gradient(circle at 80% 0%, rgba(34,197,94,0.06) 0%, transparent 40%),
            radial-gradient(circle at 20% 100%, rgba(99,102,241,0.06) 0%, transparent 40%),
            linear-gradient(180deg, #fafaf8 0%, #f0efeb 100%);
          padding: 64px 24px 96px;
        }
        .bv-card {
          max-width: 640px; margin: 0 auto;
          background: #fff;
          border: 1px solid #e5e3de;
          border-radius: 16px;
          padding: 40px 36px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.04);
        }
        .bv-head {
          display: flex; gap: 18px; align-items: flex-start;
          margin-bottom: 24px;
        }
        .bv-favicon {
          width: 56px; height: 56px; border-radius: 12px;
          object-fit: contain; flex: 0 0 auto;
          background: #f5f4f0;
          border: 1px solid #e5e3de;
          padding: 8px;
        }
        .bv-favicon-fallback {
          width: 56px; height: 56px; border-radius: 12px;
          background: linear-gradient(135deg, #6366f1, #22c55e);
          color: #fff; font: 600 26px/56px Georgia, serif;
          text-align: center; flex: 0 0 auto;
        }
        .bv-titles { flex: 1; min-width: 0; }
        .bv-title {
          font: 500 26px/1.2 Georgia, serif;
          color: #1a1a1a; margin: 0 0 6px;
          letter-spacing: -0.4px;
        }
        .bv-title a { color: inherit; text-decoration: none; }
        .bv-title a:hover { color: #6366f1; }
        .bv-host {
          font: 400 13px/1 'Inter', -apple-system, sans-serif;
          color: #888;
        }
        .bv-host a { color: inherit; text-decoration: none; }
        .bv-host a:hover { color: #6366f1; }
        .bv-desc {
          font: 400 15px/1.6 Georgia, serif;
          color: #444; margin: 0 0 28px;
        }
        .bv-tags {
          display: flex; gap: 6px; flex-wrap: wrap;
          margin-bottom: 28px;
        }
        .bv-tag {
          padding: 5px 11px;
          background: #f5f4f0;
          border: 1px solid #e5e3de;
          border-radius: 999px;
          font: 500 12px/1 'Inter', -apple-system, sans-serif;
          color: #555;
        }
        .bv-meta {
          padding-top: 20px;
          border-top: 1px solid #e5e3de;
          font: 400 12px/1.5 'Inter', -apple-system, sans-serif;
          color: #999;
          display: flex; gap: 14px; flex-wrap: wrap;
        }
        .bv-meta a { color: #1a5276; text-decoration: none; }
        .bv-meta a:hover { color: #6366f1; }
      </style>

      <div class="bv-bg">
        <div class="bv-card">
          <div class="bv-head">
            ${favicon
              ? html`<img class="bv-favicon" src="${favicon}" alt="" onerror="${function(e) { const f = document.createElement('div'); f.className = 'bv-favicon-fallback'; f.textContent = (title || '?').charAt(0).toUpperCase(); e.target.replaceWith(f) }}" />`
              : html`<div class="bv-favicon-fallback">${(title || '?').charAt(0).toUpperCase()}</div>`
            }
            <div class="bv-titles">
              <h1 class="bv-title">
                ${recalls
                  ? html`<a href="${recalls}" target="_blank" rel="noopener">${title}</a>`
                  : title}
              </h1>
              ${recalls ? html`<div class="bv-host"><a href="${recalls}" target="_blank" rel="noopener">${niceHost(recalls)}</a></div>` : null}
            </div>
          </div>

          ${description ? html`<p class="bv-desc">${description}</p>` : null}

          ${tags.length > 0 ? html`
            <div class="bv-tags">
              ${tags.map(t => html`<span class="bv-tag">#${t}</span>`)}
            </div>
          ` : null}

          ${(created || attributedTo) ? html`
            <div class="bv-meta">
              ${created ? html`<span>Saved ${niceDate(created)}</span>` : null}
              ${attributedTo ? html`<span>by <a href="${attributedTo}" target="_blank" rel="noopener">${niceHost(attributedTo) || attributedTo}</a></span>` : null}
            </div>
          ` : null}
        </div>
      </div>
    `)
  }
}
