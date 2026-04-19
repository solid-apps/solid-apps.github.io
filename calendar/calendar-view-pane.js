/**
 * Calendar view pane — bespoke renderer for urn:solid:Event.
 *
 * Reads Event.name, summary, startTime, endTime, location, attributedTo
 * and renders a save-the-date card: month/day chip on the left, title +
 * time range + location on the right. Empty fields gracefully omitted.
 *
 * Same data, different lens. Drop in alongside ui-pane (Inline) and
 * schema-pane (Edit) — LOSOS shows them all as tabs.
 *
 * AGPL-3.0 — part of solid-apps
 */

import { html, render } from 'https://losos.org/losos/html.js'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const niceHost = (u) => { try { return new URL(u).host.replace(/^www\./, '') } catch { return u } }

function partsOf(iso) {
  if (!iso) return null
  const d = new Date(iso)
  if (isNaN(d)) return null
  return {
    month: MONTHS[d.getMonth()],
    day: d.getDate(),
    weekday: d.toLocaleDateString(undefined, { weekday: 'long' }),
    time: d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }),
  }
}

function timeRange(start, end) {
  if (!start) return null
  if (!end) return start.time
  const sameClock = start.time === end.time
  return sameClock ? start.time : `${start.time} – ${end.time}`
}

export default {
  label: 'Calendar',
  icon: '\ud83d\udcc5',

  canHandle(subject, store) {
    const node = store.get(subject.value)
    if (!node) return false
    const t = store.type(node)
    if (!t) return false
    return Array.isArray(t)
      ? t.some(x => /Event/i.test(x))
      : /Event/i.test(t)
  },

  render(subject, lionStore, container, rawData) {
    let data = rawData
    if (!data) {
      const dataEl = document.querySelector('script[type="application/ld+json"]')
      try { data = JSON.parse(dataEl.textContent) } catch { return }
    }

    const name = data.name || data.title || 'Untitled'
    const summary = data.summary || data.description
    const start = partsOf(data.startTime)
    const end = partsOf(data.endTime)
    const location = (typeof data.location === 'object' ? data.location['@id'] : data.location) || ''
    const attributedTo = data.attributedTo
      ? (typeof data.attributedTo === 'string' ? data.attributedTo : data.attributedTo['@id'] || data.attributedTo.name)
      : null

    const range = start ? timeRange(start, end) : null
    const dateLine = start ? `${start.weekday}${range ? ' \u00b7 ' + range : ''}` : null
    const isUrl = (s) => /^https?:\/\//.test(s)

    render(container, html`
      <style>
        .ev-bg {
          min-height: 100vh;
          background:
            radial-gradient(circle at 20% 0%, rgba(239,68,68,0.06) 0%, transparent 40%),
            radial-gradient(circle at 80% 100%, rgba(99,102,241,0.06) 0%, transparent 40%),
            linear-gradient(180deg, #fafaf8 0%, #f0efeb 100%);
          padding: 64px 24px 96px;
        }
        .ev-card {
          max-width: 640px; margin: 0 auto;
          background: #fff;
          border: 1px solid #e5e3de;
          border-radius: 16px;
          padding: 36px;
          display: flex; gap: 28px; align-items: flex-start;
          box-shadow: 0 8px 32px rgba(0,0,0,0.04);
        }
        .ev-date {
          flex: 0 0 auto;
          width: 96px;
          border: 1px solid #e5e3de;
          border-radius: 12px;
          overflow: hidden;
          text-align: center;
        }
        .ev-month {
          background: #ef4444; color: #fff;
          font: 600 12px/1 'Inter', -apple-system, sans-serif;
          padding: 8px; letter-spacing: 0.18em; text-transform: uppercase;
        }
        .ev-day {
          font: 500 44px/1 Georgia, serif;
          color: #1a1a1a; padding: 16px 0;
          background: #fafaf8;
        }
        .ev-no-date {
          flex: 0 0 auto;
          width: 96px; height: 96px;
          border-radius: 12px;
          background: #f5f4f0;
          color: #aaa;
          display: flex; align-items: center; justify-content: center;
          font: 500 24px/1 Georgia, serif;
        }
        .ev-meta { flex: 1; min-width: 0; }
        .ev-name {
          font: 500 26px/1.2 Georgia, serif;
          color: #1a1a1a; margin: 0 0 8px;
          letter-spacing: -0.4px;
        }
        .ev-when {
          font: 500 13px/1.4 'Inter', -apple-system, sans-serif;
          color: #666; margin-bottom: 18px;
        }
        .ev-summary {
          font: 400 15px/1.6 Georgia, serif;
          color: #444; margin: 0 0 20px;
        }
        .ev-row {
          display: flex; gap: 8px; align-items: center;
          padding-top: 14px; margin-top: 14px;
          border-top: 1px solid #e5e3de;
          font: 400 13px/1.4 'Inter', -apple-system, sans-serif;
          color: #666;
        }
        .ev-row + .ev-row { border-top: none; padding-top: 0; margin-top: 6px; }
        .ev-row .icon { opacity: 0.6; }
        .ev-row a { color: #1a5276; text-decoration: none; }
        .ev-row a:hover { color: #6366f1; }
      </style>

      <div class="ev-bg">
        <div class="ev-card">
          ${start
            ? html`
              <div class="ev-date">
                <div class="ev-month">${start.month}</div>
                <div class="ev-day">${start.day}</div>
              </div>`
            : html`<div class="ev-no-date">?</div>`
          }

          <div class="ev-meta">
            <h1 class="ev-name">${name}</h1>
            ${dateLine ? html`<div class="ev-when">${dateLine}</div>` : null}
            ${summary ? html`<p class="ev-summary">${summary}</p>` : null}

            ${location ? html`
              <div class="ev-row">
                <span class="icon">\ud83d\udccd</span>
                ${isUrl(location)
                  ? html`<a href="${location}" target="_blank" rel="noopener">${niceHost(location)}</a>`
                  : html`<span>${location}</span>`}
              </div>` : null}

            ${attributedTo ? html`
              <div class="ev-row">
                <span class="icon">\ud83d\udc64</span>
                ${isUrl(attributedTo)
                  ? html`<a href="${attributedTo}" target="_blank" rel="noopener">${niceHost(attributedTo)}</a>`
                  : html`<span>${attributedTo}</span>`}
              </div>` : null}
          </div>
        </div>
      </div>
    `)
  }
}
