import { NavLink } from 'react-router-dom'
import { useSettings, type ThemeMode } from '../store/useSettings'

interface NavbarProps {
  onOpenCheatsheet: () => void
  onOpenSettings: () => void
  onShuffle: () => void
  shuffleActive: boolean
  onToggleAutoplay: () => void
  autoplayActive: boolean
}

export default function Navbar({
  onOpenCheatsheet,
  onOpenSettings,
  onShuffle,
  shuffleActive,
  onToggleAutoplay,
  autoplayActive,
}: NavbarProps) {
  const settings = useSettings()
  const isMuted = settings.volume === 0
  const toggleMute = () => settings.update('volume', isMuted ? 80 : 0)

  const isDark = settings.theme === 'dark' ||
    (settings.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  const toggleTheme = () => {
    const next: ThemeMode = isDark ? 'light' : 'dark'
    settings.update('theme', next)
  }

  const btnBase: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '5px 10px',
    borderRadius: 8,
    border: 'none',
    background: 'transparent',
    color: 'var(--c-text-secondary)',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s ease',
  }

  const btnActive: React.CSSProperties = {
    ...btnBase,
    background: 'var(--c-accent)',
    color: '#fff',
  }

  return (
    <header
      className="glass"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        gap: 8,
        borderBottom: '1px solid rgba(128,128,128,0.12)',
      }}
    >
      {/* Логотип */}
      <NavLink
        to="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          textDecoration: 'none',
          color: 'var(--c-text-strong)',
          fontWeight: 700,
          fontSize: 14,
          flexShrink: 0,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="4" r="2" />
          <circle cx="18" cy="8" r="2" />
          <circle cx="4" cy="8" r="2" />
          <path d="M12 14c-2.5 0-4.5 1.5-5 3.5-.3 1.2.6 2.5 2 2.5h6c1.4 0 2.3-1.3 2-2.5-.5-2-2.5-3.5-5-3.5z" />
        </svg>
        <span className="nav-logo-full">Кто так говорит?</span>
        <span className="nav-logo-short">КТГ</span>
      </NavLink>

      {/* Навигация */}
      <nav style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        {[
          { to: '/', label: 'Главная' },
          { to: '/uikit', label: 'UI Kit' },
          { to: '/about', label: 'О проекте' },
        ].map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            style={({ isActive }) => ({
              padding: '5px 10px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              textDecoration: 'none',
              color: isActive ? 'var(--c-accent)' : 'var(--c-text-secondary)',
              background: isActive ? 'rgba(128,128,128,0.08)' : 'transparent',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            })}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* Кнопки */}
      <div style={{ display: 'flex', gap: 2, alignItems: 'center', flexShrink: 0 }}>

        {/* Автоплей */}
        <button onClick={onToggleAutoplay} style={autoplayActive ? btnActive : btnBase} title="Автоплей">
          {autoplayActive ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.14v13.72a1 1 0 001.5.86l11-6.86a1 1 0 000-1.72l-11-6.86A1 1 0 008 5.14z" /></svg>
          )}
          <span className="nav-btn-text">Автоплей</span>
        </button>

        {/* Звук */}
        <button onClick={toggleMute} style={isMuted ? btnActive : btnBase} title={isMuted ? 'Включить звук' : 'Выключить звук'}>
          {isMuted ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" /></svg>
          )}
          <span className="nav-btn-text">Звук</span>
        </button>

        {/* Случайный */}
        <button onClick={onShuffle} style={shuffleActive ? btnActive : btnBase} title="Случайный порядок">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" /><polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" /><line x1="4" y1="4" x2="9" y2="9" /></svg>
          <span className="nav-btn-text">Случайный</span>
        </button>

        {/* Разделитель */}
        <div style={{ width: 1, height: 20, background: 'var(--c-border)', margin: '0 2px' }} />

        {/* Тема */}
        <button onClick={toggleTheme} style={btnBase} title={isDark ? 'Светлая тема' : 'Тёмная тема'}>
          {isDark ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>
          )}
          <span className="nav-btn-text">Тема</span>
        </button>

        {/* Горячие клавиши */}
        <button onClick={onOpenCheatsheet} style={btnBase} title="Горячие клавиши">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M8 16h8" /></svg>
          <span className="nav-btn-text">Клавиши</span>
        </button>

        {/* Настройки */}
        <button onClick={onOpenSettings} style={btnBase} title="Настройки">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>
          <span className="nav-btn-text">Настройки</span>
        </button>
      </div>

      <style>{`
        .nav-logo-full { display: none; }
        .nav-logo-short { display: inline; }
        .nav-btn-text { display: none; }
        @media (min-width: 768px) {
          .nav-logo-full { display: inline; }
          .nav-logo-short { display: none; }
          .nav-btn-text { display: inline; }
        }
      `}</style>
    </header>
  )
}