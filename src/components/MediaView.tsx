import type { ReactNode } from 'react'
import type { CallMedia, ChatMedia, EmailMedia, IrlMedia, Media, PopupMedia, Rich, TaskMedia, WifiMedia } from '../types'
import { RichText } from './RichText'

export function MediaView({ media, hoverHref }: { media: Media; hoverHref: string | null }) {
  switch (media.kind) {
    case 'email':
      return <EmailView m={media} hoverHref={hoverHref} />
    case 'chat':
      return <ChatView m={media} />
    case 'call':
      return <CallView m={media} />
    case 'irl':
      return <IrlView m={media} />
    case 'task':
      return <TaskView m={media} />
    case 'wifi':
      return <WifiView m={media} />
    case 'popup':
      return <PopupView m={media} />
  }
}

function BrowserFrame({ url, children }: { url: Rich; children: ReactNode }) {
  return (
    <div className="browser">
      <div className="browser-bar">
        <span className="dot red" />
        <span className="dot yellow" />
        <span className="dot green" />
        <span className="url-bar">
          <RichText value={url} />
        </span>
      </div>
      {children}
    </div>
  )
}

const BARS = ['▂', '▂▄', '▂▄▆', '▂▄▆█']

function WifiView({ m }: { m: WifiMedia }) {
  return (
    <div className="media wifi">
      <div className="wifi-header">
        <strong>📶 Wi-Fi</strong>
        <span className="muted small">📍 {m.location}</span>
      </div>
      <ul className="wifi-list">
        {m.networks.map((n, i) => (
          <li key={i}>
            <div className="wifi-name">
              <RichText value={n.name} />
              {n.note && (
                <div className="muted small">
                  <RichText value={n.note} />
                </div>
              )}
            </div>
            <span className="wifi-security">
              <RichText value={n.security} />
            </span>
            <span className="wifi-signal" title={`Signal ${n.signal}/4`}>
              {BARS[n.signal - 1]}
            </span>
          </li>
        ))}
      </ul>
      {m.portal && (
        <div className="portal">
          <div className="portal-caption muted small">{m.portal.caption}</div>
          <BrowserFrame url={m.portal.url}>
            <div className="portal-body">
              {m.portal.lines.map((p, i) => (
                <p key={i}>
                  <RichText value={p} />
                </p>
              ))}
              <span className="fake-btn">{m.portal.button}</span>
            </div>
          </BrowserFrame>
        </div>
      )}
      {m.notes && (
        <div className="wifi-notes">
          {m.notes.map((p, i) => (
            <p key={i}>
              <RichText value={p} />
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

function PopupView({ m }: { m: PopupMedia }) {
  return (
    <div className="media popup">
      <BrowserFrame url={m.url}>
        <div className="popup-body">
          <div className="popup-alert">
            <div className="popup-title">
              <RichText value={m.title} />
            </div>
            {m.lines.map((p, i) => (
              <p key={i}>
                <RichText value={p} />
              </p>
            ))}
            <div className="popup-buttons">
              {m.buttons.map((b) => (
                <span key={b} className="fake-btn danger">
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      </BrowserFrame>
    </div>
  )
}

function EmailView({ m, hoverHref }: { m: EmailMedia; hoverHref: string | null }) {
  return (
    <div className="media email">
      <div className="email-bar">
        <span className="dot red" />
        <span className="dot yellow" />
        <span className="dot green" />
        <span className="email-app">Gmail · Inbox</span>
      </div>
      <div className="email-subject">
        <RichText value={m.subject} />
      </div>
      <div className="email-meta">
        <div className="avatar round">{m.fromName.charAt(0)}</div>
        <div className="email-from">
          <div>
            <strong>{m.fromName}</strong>{' '}
            <span className="muted">
              &lt;
              <RichText value={m.fromAddress} />
              &gt;
            </span>
          </div>
          <div className="muted small">to {m.to}</div>
        </div>
        <div className="muted small">{m.time}</div>
      </div>
      <div className="email-body">
        {m.body.map((p, i) => (
          <p key={i}>
            <RichText value={p} />
          </p>
        ))}
      </div>
      <div className={`status-bar ${hoverHref ? 'show' : ''}`}>🔗 {hoverHref ?? ''}</div>
    </div>
  )
}

function ChatView({ m }: { m: ChatMedia }) {
  return (
    <div className={`media chat chat-${m.app}`}>
      <div className="chat-header">
        <span className="chat-app">{m.app === 'slack' ? '💬 Slack' : '📷 Instagram'}</span>
        <div>
          <div className="chat-title">
            <RichText value={m.title} />
          </div>
          {m.subtitle && (
            <div className="muted small">
              <RichText value={m.subtitle} />
            </div>
          )}
        </div>
      </div>
      <div className="chat-body">
        {m.messages.map((msg, i) => (
          <div key={i} className="chat-msg">
            <div className="avatar">{msg.avatar}</div>
            <div>
              <div className="chat-name">
                <strong>{msg.who}</strong>
                {msg.tag && (
                  <span className="tag">
                    <RichText value={msg.tag} />
                  </span>
                )}
                {msg.time && <span className="muted small">{msg.time}</span>}
              </div>
              <div className="chat-text">
                <RichText value={msg.text} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CallView({ m }: { m: CallMedia }) {
  return (
    <div className="media call">
      <div className="call-header">
        <div className="call-ring">📞</div>
        <div>
          <div className="call-name">
            <RichText value={m.callerName} />
          </div>
          <div className="call-number">
            <RichText value={m.callerNumber} />
          </div>
        </div>
      </div>
      <div className="call-body">
        {m.lines.map((l, i) =>
          l.who === 'sms' ? (
            <div key={i} className="sms">
              <div className="small">💬 New SMS</div>
              <RichText value={l.text} />
            </div>
          ) : (
            <div key={i} className={`bubble ${l.who}`}>
              <RichText value={l.text} />
            </div>
          ),
        )}
      </div>
    </div>
  )
}

function IrlView({ m }: { m: IrlMedia }) {
  return (
    <div className="media irl">
      <div className="irl-stage">
        <div className="irl-art">{m.art}</div>
        <div className="irl-location">📍 {m.location}</div>
      </div>
      <div className="irl-lines">
        {m.lines.map((l, i) =>
          l.who === 'narrator' ? (
            <p key={i} className="narrator">
              <RichText value={l.text} />
            </p>
          ) : (
            <p key={i}>
              <strong>{l.who}:</strong> <RichText value={l.text} />
            </p>
          ),
        )}
      </div>
    </div>
  )
}

function TaskView({ m }: { m: TaskMedia }) {
  return (
    <div className="media task">
      <div className="task-header">
        <span className="task-icon">{m.icon}</span>
        <div>
          <div className="muted small">{m.app}</div>
          <div className="task-title">{m.title}</div>
        </div>
      </div>
      <div className="task-body">
        {m.body.map((p, i) => (
          <p key={i}>
            <RichText value={p} />
          </p>
        ))}
      </div>
    </div>
  )
}
