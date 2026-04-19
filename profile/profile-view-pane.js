/**
 * Profile view pane — renders a urn:solid:Person as a beautiful "this is me" page.
 *
 * Schema-aware (reads Person fields: name, nick, email, homepage, img, knows)
 * but bespoke layout — hero photo, large italic name, contact pills, knows
 * network. The custom counterpart to the generic schema-view.
 *
 * Same data, different lens. Drop in alongside schema-pane (Edit) and
 * schema-view (generic View) — LOSOS shows all three as tabs.
 *
 * AGPL-3.0 — part of solid-apps
 */

import { html, render } from 'https://losos.org/losos/html.js'

const initial = (s) => (s || '?').trim().charAt(0).toUpperCase()
const stripScheme = (u) => (u || '').replace(/^https?:\/\//, '').replace(/\/$/, '')
const niceLink = (u) => {
  try {
    const url = new URL(u)
    return url.host + (url.pathname === '/' ? '' : url.pathname)
  } catch { return u }
}

export default {
  label: 'Profile',
  icon: '\ud83d\udc64',

  canHandle(subject, store) {
    const node = store.get(subject.value)
    if (!node) return false
    const t = store.type(node)
    if (!t) return false
    return Array.isArray(t)
      ? t.some(x => /Person/i.test(x))
      : /Person/i.test(t)
  },

  render(subject, lionStore, container, rawData) {
    let data = rawData
    if (!data) {
      const dataEl = document.querySelector('script[type="application/ld+json"]')
      try { data = JSON.parse(dataEl.textContent) } catch { return }
    }

    const name = data.name || data.nick || data['@id'] || 'Unknown'
    const nick = data.nick
    const email = data.email
    const homepage = data.homepage
    const img = data.img
    const knows = Array.isArray(data.knows) ? data.knows : (data.knows ? [data.knows] : [])
    const id = data['@id'] || ''
    const showId = id && id !== '#this' && !id.startsWith('#')

    render(container, html`
      <style>
        .pv-bg {
          min-height: 100vh;
          background:
            radial-gradient(circle at 20% 0%, rgba(99,102,241,0.08) 0%, transparent 40%),
            radial-gradient(circle at 80% 100%, rgba(236,72,153,0.06) 0%, transparent 40%),
            linear-gradient(180deg, #fafaf8 0%, #f0efeb 100%);
          padding: 64px 24px 96px;
        }
        .pv-card {
          max-width: 600px; margin: 0 auto; text-align: center;
        }
        .pv-photo {
          width: 200px; height: 200px; border-radius: 50%;
          object-fit: cover; margin: 0 auto 32px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.15);
          border: 4px solid #fff;
          display: block;
        }
        .pv-photo-fallback {
          width: 200px; height: 200px; border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff; font: 600 80px/200px Georgia, serif;
          margin: 0 auto 32px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.15);
          border: 4px solid #fff;
        }
        .pv-name {
          font: italic 400 56px/1.05 Georgia, serif;
          color: #1a1a1a; margin: 0 0 6px;
          letter-spacing: -1.2px;
        }
        .pv-nick {
          font: 500 16px/1.5 'Inter', -apple-system, sans-serif;
          color: #888; margin: 0 0 24px;
        }
        .pv-id {
          display: inline-block;
          font: 400 11px/1.5 ui-monospace, SFMono-Regular, monospace;
          color: #aaa; margin-bottom: 40px;
          word-break: break-all; max-width: 100%;
          padding: 4px 10px; border-radius: 4px;
          background: rgba(0,0,0,0.03);
        }
        .pv-contact {
          display: flex; gap: 10px; justify-content: center;
          flex-wrap: wrap; margin-bottom: 56px;
        }
        .pv-link {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 10px 18px; background: #fff;
          border: 1px solid #e5e3de; border-radius: 999px;
          color: #1a1a1a; text-decoration: none;
          font: 500 14px/1 'Inter', -apple-system, sans-serif;
          transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
        }
        .pv-link:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.08);
          border-color: #6366f1;
        }
        .pv-link-icon { font-size: 16px; opacity: 0.85; }
        .pv-knows {
          padding-top: 40px;
          border-top: 1px solid #e5e3de;
        }
        .pv-knows-title {
          font: 600 11px/1 'Inter', -apple-system, sans-serif;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: #999; margin: 0 0 20px;
        }
        .pv-knows-list {
          list-style: none; padding: 0; margin: 0;
          display: flex; gap: 8px; flex-wrap: wrap; justify-content: center;
        }
        .pv-knows-link {
          padding: 7px 14px; background: #fff;
          border: 1px solid #e5e3de; border-radius: 999px;
          font: 400 13px/1 'Inter', sans-serif;
          color: #1a5276; text-decoration: none;
          transition: border-color 0.18s, color 0.18s;
        }
        .pv-knows-link:hover { border-color: #6366f1; color: #6366f1; }
      </style>

      <div class="pv-bg">
        <div class="pv-card">
          ${img
            ? html`<img class="pv-photo" src="${img}" alt="${name}" onerror="${function(e) { const f = document.createElement('div'); f.className = 'pv-photo-fallback'; f.textContent = initial(name); e.target.replaceWith(f) }}" />`
            : html`<div class="pv-photo-fallback">${initial(name)}</div>`
          }

          <h1 class="pv-name">${name}</h1>
          ${nick ? html`<div class="pv-nick">@${nick}</div>` : null}
          ${showId ? html`<div class="pv-id">${id}</div>` : null}

          ${(email || homepage) ? html`
            <div class="pv-contact">
              ${email ? html`<a class="pv-link" href="${'mailto:' + email}"><span class="pv-link-icon">\u2709</span>${email}</a>` : null}
              ${homepage ? html`<a class="pv-link" href="${homepage}" target="_blank" rel="noopener"><span class="pv-link-icon">\ud83c\udf10</span>${niceLink(homepage)}</a>` : null}
            </div>
          ` : null}

          ${knows.length > 0 ? html`
            <div class="pv-knows">
              <div class="pv-knows-title">Knows</div>
              <ul class="pv-knows-list">
                ${knows.map(function(k) {
                  const ref = (typeof k === 'string') ? k : (k && k['@id'])
                  if (!ref) return null
                  const label = (typeof k === 'object' && k.name) ? k.name : niceLink(ref)
                  return html`<li><a class="pv-knows-link" href="${ref}" target="_blank" rel="noopener">${label}</a></li>`
                })}
              </ul>
            </div>
          ` : null}
        </div>
      </div>
    `)
  }
}
