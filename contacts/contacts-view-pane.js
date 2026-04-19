/**
 * Contacts view pane — renders a urn:solid:AddressBook as an address-book grid.
 *
 * Reads AddressBook.title and AddressBook.hasMember (an array of Person
 * references — either inlined objects with name/img/email or bare URI
 * references). Renders each member as a card with avatar, name, and contact
 * pills. Empty state when no members.
 *
 * Same data, different lens. Drop in alongside ui-pane (Inline) and
 * schema-pane (Edit) — LOSOS shows them all as tabs.
 *
 * AGPL-3.0 — part of solid-apps
 */

import { html, render } from 'https://losos.org/losos/html.js'

const initial = (s) => (s || '?').trim().charAt(0).toUpperCase()
const niceHost = (u) => { try { return new URL(u).host.replace(/^www\./, '') } catch { return u } }

function asMember(m) {
  if (typeof m === 'string') return { id: m }
  if (m && typeof m === 'object') {
    return {
      id: m['@id'] || '',
      name: m.name,
      nick: m.nick,
      email: m.email,
      img: m.img,
      homepage: m.homepage,
    }
  }
  return null
}

export default {
  label: 'Contacts',
  icon: '\ud83d\udcd2',

  canHandle(subject, store) {
    const node = store.get(subject.value)
    if (!node) return false
    const t = store.type(node)
    if (!t) return false
    return Array.isArray(t)
      ? t.some(x => /AddressBook/i.test(x))
      : /AddressBook/i.test(t)
  },

  render(subject, lionStore, container, rawData) {
    let data = rawData
    if (!data) {
      const dataEl = document.querySelector('script[type="application/ld+json"]')
      try { data = JSON.parse(dataEl.textContent) } catch { return }
    }

    const title = data.title || 'Contacts'
    const description = data.description
    const rawMembers = Array.isArray(data.hasMember) ? data.hasMember : (data.hasMember ? [data.hasMember] : [])
    const members = rawMembers.map(asMember).filter(Boolean)

    const displayName = (m) => m.name || m.nick || (m.id ? niceHost(m.id) : 'Unknown')

    render(container, html`
      <style>
        .cv-bg {
          min-height: 100vh;
          background:
            radial-gradient(circle at 80% 0%, rgba(99,102,241,0.06) 0%, transparent 40%),
            radial-gradient(circle at 20% 100%, rgba(236,72,153,0.05) 0%, transparent 40%),
            linear-gradient(180deg, #fafaf8 0%, #f0efeb 100%);
          padding: 56px 24px 96px;
        }
        .cv-wrap { max-width: 880px; margin: 0 auto; }
        .cv-head {
          text-align: center;
          margin-bottom: 40px;
        }
        .cv-title {
          font: italic 400 44px/1.1 Georgia, serif;
          color: #1a1a1a; margin: 0 0 8px;
          letter-spacing: -0.8px;
        }
        .cv-desc {
          font: 400 15px/1.5 'Inter', -apple-system, sans-serif;
          color: #888; margin: 0 0 6px;
        }
        .cv-count {
          font: 600 11px/1 'Inter', -apple-system, sans-serif;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: #999;
        }
        .cv-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 16px;
        }
        .cv-card {
          background: #fff;
          border: 1px solid #e5e3de;
          border-radius: 12px;
          padding: 20px;
          display: flex; gap: 14px; align-items: center;
          text-decoration: none;
          color: inherit;
          transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
        }
        .cv-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.06);
          border-color: #6366f1;
        }
        .cv-avatar {
          width: 56px; height: 56px; border-radius: 50%;
          object-fit: cover; flex: 0 0 auto;
          background: #f5f4f0;
        }
        .cv-avatar-fallback {
          width: 56px; height: 56px; border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff; font: 600 22px/56px Georgia, serif;
          text-align: center; flex: 0 0 auto;
        }
        .cv-meta { min-width: 0; flex: 1; }
        .cv-name {
          font: 600 16px/1.2 'Inter', -apple-system, sans-serif;
          color: #1a1a1a; margin: 0 0 3px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .cv-sub {
          font: 400 13px/1.4 'Inter', -apple-system, sans-serif;
          color: #888;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .cv-empty {
          background: #fff;
          border: 1px dashed #d4d2cd;
          border-radius: 12px;
          padding: 60px 20px;
          text-align: center;
          color: #999;
          font: 400 15px/1.5 'Inter', -apple-system, sans-serif;
        }
      </style>

      <div class="cv-bg">
        <div class="cv-wrap">
          <div class="cv-head">
            <h1 class="cv-title">${title}</h1>
            ${description ? html`<p class="cv-desc">${description}</p>` : null}
            <div class="cv-count">${members.length} ${members.length === 1 ? 'contact' : 'contacts'}</div>
          </div>

          ${members.length === 0
            ? html`<div class="cv-empty">No contacts yet.</div>`
            : html`
              <div class="cv-grid">
                ${members.map(function(m) {
                  const name = displayName(m)
                  const sub = m.nick ? '@' + m.nick : (m.email || (m.id ? niceHost(m.id) : ''))
                  const href = m.id || m.homepage || '#'
                  return html`
                    <a class="cv-card" href="${href}" target="_blank" rel="noopener">
                      ${m.img
                        ? html`<img class="cv-avatar" src="${m.img}" alt="${name}" onerror="${function(e) { const f = document.createElement('div'); f.className = 'cv-avatar-fallback'; f.textContent = initial(name); e.target.replaceWith(f) }}" />`
                        : html`<div class="cv-avatar-fallback">${initial(name)}</div>`
                      }
                      <div class="cv-meta">
                        <div class="cv-name">${name}</div>
                        ${sub ? html`<div class="cv-sub">${sub}</div>` : null}
                      </div>
                    </a>
                  `
                })}
              </div>
            `
          }
        </div>
      </div>
    `)
  }
}
