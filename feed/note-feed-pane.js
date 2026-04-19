/**
 * Note feed pane — renders an OrderedCollection of Notes as a fediverse-style feed.
 *
 * Each Note becomes a card: author chip (from inline attributedTo or the WebID),
 * relative timestamp, optional content warning (summary), body, hashtags row.
 *
 * Companion to the Profile pane: Profile is your card, Feed is your stream.
 *
 * AGPL-3.0 — part of solid-apps
 */

import { html, render } from 'https://losos.org/losos/html.js'

const isCollectionType = (t) => {
  if (!t) return false
  const s = Array.isArray(t) ? t.join(' ') : t
  return /OrderedCollection|Collection/i.test(s)
}

const niceHost = (u) => {
  try { return new URL(u).host } catch { return u }
}

// Author display: prefer inline Person object, else strip the WebID.
function authorOf(attr) {
  if (!attr) return null
  if (typeof attr === 'string') {
    return { name: niceHost(attr), nick: null, ref: attr, img: null }
  }
  if (typeof attr === 'object') {
    return {
      name: attr.name || attr.nick || (attr['@id'] && niceHost(attr['@id'])) || 'Unknown',
      nick: attr.nick,
      ref: attr['@id'] || null,
      img: attr.img || null
    }
  }
  return null
}

// "2h ago" / "3d ago" / "Apr 19" — soft, fediverse-ish
function relativeTime(iso) {
  if (!iso) return ''
  let d
  try { d = new Date(iso) } catch { return iso }
  if (isNaN(d)) return iso
  const now = Date.now()
  const diff = (now - d.getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago'
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago'
  if (diff < 86400 * 7) return Math.floor(diff / 86400) + 'd ago'
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

const initial = (s) => (s || '?').trim().charAt(0).toUpperCase()

export default {
  label: 'Feed',
  icon: '\ud83d\udcdc',

  canHandle(subject, store) {
    const node = store.get(subject.value)
    if (!node) return false
    return isCollectionType(store.type(node))
  },

  render(subject, lionStore, container, rawData) {
    let data = rawData
    if (!data) {
      const dataEl = document.querySelector('script[type="application/ld+json"]')
      try { data = JSON.parse(dataEl.textContent) } catch { return }
    }

    const items = data.orderedItems || data.items || []
    const title = data.title || data.name || 'Feed'
    const total = data.totalItems != null ? data.totalItems : items.length

    // Sort newest-first if published is set
    const sorted = items.slice().sort(function(a, b) {
      const pa = (a && a.published) || ''
      const pb = (b && b.published) || ''
      return pb > pa ? 1 : pb < pa ? -1 : 0
    })

    const renderTags = function(tags) {
      if (!Array.isArray(tags) || tags.length === 0) return null
      return html`<div class="nf-tags">${tags.map(function(t) {
        let label = null, href = null
        if (typeof t === 'string') { label = t.startsWith('#') ? t : '#' + t }
        else if (t && typeof t === 'object') { label = t.name || t['@id']; href = t.href || t['@id'] }
        if (!label) return null
        return href
          ? html`<a class="nf-tag" href="${href}" target="_blank" rel="noopener">${label}</a>`
          : html`<span class="nf-tag">${label}</span>`
      })}</div>`
    }

    const renderCard = function(note) {
      const a = authorOf(note.attributedTo)
      const time = note.published ? relativeTime(note.published) : null
      const summary = note.summary
      const content = note.content
      const tags = note.tag

      return html`
        <article class="nf-card">
          <header class="nf-head">
            ${a && a.img
              ? html`<img class="nf-ava" src="${a.img}" alt="${a.name}" onerror="${function(e) { const f = document.createElement('div'); f.className = 'nf-ava-fallback'; f.textContent = initial(a.name); e.target.replaceWith(f) }}" />`
              : a
                ? html`<div class="nf-ava-fallback">${initial(a.name)}</div>`
                : html`<div class="nf-ava-fallback">?</div>`
            }
            <div class="nf-meta">
              ${a && a.ref
                ? html`<a class="nf-author" href="${a.ref}" target="_blank" rel="noopener">${a.name}</a>`
                : html`<span class="nf-author">${(a && a.name) || 'Unknown'}</span>`
              }
              ${a && a.nick ? html`<span class="nf-nick">@${a.nick}</span>` : null}
              ${time ? html`<span class="nf-dot">·</span><span class="nf-time" title="${note.published || ''}">${time}</span>` : null}
            </div>
          </header>
          ${summary ? html`<div class="nf-cw">${summary}</div>` : null}
          ${content ? html`<div class="nf-body">${content}</div>` : null}
          ${renderTags(tags)}
        </article>
      `
    }

    render(container, html`
      <style>
        .nf-bg {
          min-height: 100vh;
          background: linear-gradient(180deg, #fafaf8 0%, #f4f3ef 100%);
          padding: 56px 20px 96px;
        }
        .nf-wrap { max-width: 640px; margin: 0 auto; }
        .nf-title {
          font: italic 400 48px/1.05 Georgia, serif;
          color: #1a1a1a; margin: 0 0 6px; letter-spacing: -0.8px;
        }
        .nf-sub {
          font: 500 13px/1 'Inter', -apple-system, sans-serif;
          color: #999; margin: 0 0 40px;
          letter-spacing: 0.05em; text-transform: uppercase;
        }
        .nf-card {
          background: #fff;
          border: 1px solid #ece9e2;
          border-radius: 12px;
          padding: 20px 22px 22px;
          margin: 0 0 16px;
          transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
        }
        .nf-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(0,0,0,0.06);
          border-color: #d9d6cf;
        }
        .nf-head {
          display: flex; align-items: center; gap: 12px;
          margin-bottom: 12px;
        }
        .nf-ava, .nf-ava-fallback {
          width: 40px; height: 40px; border-radius: 50%;
          flex-shrink: 0;
        }
        .nf-ava { object-fit: cover; }
        .nf-ava-fallback {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff; display: flex; align-items: center; justify-content: center;
          font: 600 16px/1 Georgia, serif;
        }
        .nf-meta {
          display: flex; align-items: baseline; gap: 8px;
          flex-wrap: wrap; min-width: 0;
        }
        .nf-author {
          font: 600 15px/1.3 'Inter', -apple-system, sans-serif;
          color: #1a1a1a; text-decoration: none;
        }
        .nf-author:hover { color: #6366f1; }
        .nf-nick {
          font: 400 13px/1.3 ui-monospace, SFMono-Regular, monospace;
          color: #999;
        }
        .nf-dot { color: #ccc; font-weight: 400; }
        .nf-time {
          font: 400 13px/1.3 'Inter', -apple-system, sans-serif;
          color: #999;
        }
        .nf-cw {
          font: 500 13px/1.5 'Inter', -apple-system, sans-serif;
          color: #888; padding: 8px 12px; margin: 0 0 10px;
          background: #f8f7f3; border-left: 3px solid #d4af37;
          border-radius: 4px;
        }
        .nf-body {
          font: 400 16px/1.6 'Inter', -apple-system, sans-serif;
          color: #1a1a1a; white-space: pre-wrap; word-wrap: break-word;
        }
        .nf-tags {
          margin-top: 14px; display: flex; flex-wrap: wrap; gap: 6px;
        }
        .nf-tag {
          padding: 4px 10px; background: #f4f3ef;
          border-radius: 999px;
          font: 500 12px/1 'Inter', sans-serif;
          color: #6366f1; text-decoration: none;
        }
        .nf-tag:hover { background: #ece9e2; }
        .nf-empty {
          padding: 80px 20px; text-align: center; color: #999;
          font: 400 15px/1.5 'Inter', sans-serif;
        }
      </style>

      <div class="nf-bg">
        <div class="nf-wrap">
          <h1 class="nf-title">${title}</h1>
          <div class="nf-sub">${total} ${total === 1 ? 'note' : 'notes'}</div>

          ${sorted.length === 0
            ? html`<div class="nf-empty">No notes yet.</div>`
            : sorted.map(renderCard)
          }
        </div>
      </div>
    `)
  }
}
