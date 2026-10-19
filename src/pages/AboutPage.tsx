export default function AboutPage() {
  const section: React.CSSProperties = {
    padding: '32px 20px',
    maxWidth: 720,
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  }

  const card: React.CSSProperties = {
    padding: '24px 28px',
    borderRadius: 16,
    background: 'var(--c-bg-card)',
    border: '1px solid var(--c-border)',
  }

  const h2: React.CSSProperties = {
    fontSize: 18,
    fontWeight: 700,
    color: 'var(--c-text-strong)',
    marginBottom: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  }

  const p: React.CSSProperties = {
    fontSize: 14,
    lineHeight: 1.7,
    color: 'var(--c-text-secondary)',
    margin: 0,
  }

  const tag: React.CSSProperties = {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    background: 'rgba(128,128,128,0.1)',
    color: 'var(--c-text-secondary)',
  }

  return (
    <div style={section}>

      {/* ── Заголовок ── */}
      <div style={{ textAlign: 'center', padding: '20px 0 8px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--c-text-strong)', margin: 0 }}>
          Кто так говорит?
        </h1>
        <p style={{ ...p, marginTop: 8, fontSize: 15, color: 'var(--c-text-strong)' }}>
          Интерактивное приложение для малышей 1.5–4 лет
        </p>
      </div>

      {/* ── О проекте ── */}
      <div className="glass" style={{ padding: '24px 28px', borderRadius: 16 }}>
        <h2 style={h2}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--c-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
          О проекте
        </h2>
        <p style={p}>
          «Кто так говорит?» — бесплатное веб-приложение, которое помогает малышам
          знакомиться с животными через фотографии и настоящие звуки.
          Ребёнок видит крупное фото, нажимает кнопку — и слышит, как мяукает кошка,
          лает собака или рычит лев.
        </p>
        <p style={{ ...p, marginTop: 12 }}>
          Приложение работает прямо в браузере — ничего скачивать не нужно.
          Подходит для телефона, планшета и компьютера.
        </p>
      </div>

      {/* ── Как это работает ── */}
      <div style={card}>
        <h2 style={h2}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--c-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
          Как это работает
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            ['1', 'Выберите категорию животных внизу экрана'],
            ['2', 'Листайте фотографии стрелками или свайпами'],
            ['3', 'Нажмите «Послушать» — раздастся настоящий звук'],
            ['4', 'Включите автоплей — животные будут сменяться сами'],
          ].map(([num, text]) => (
            <div key={num} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{
                width: 24, height: 24, borderRadius: 8,
                background: 'var(--c-accent)', color: '#fff',
                fontSize: 12, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginTop: 1,
              }}>
                {num}
              </span>
              <span style={{ ...p, lineHeight: 1.6 }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Категории ── */}
      <div style={card}>
        <h2 style={h2}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--c-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
          7 категорий животных
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {['Домашние', 'Ферма', 'Африка', 'Лес', 'Птицы', 'Море', 'Насекомые'].map(c => (
            <span key={c} style={tag}>{c}</span>
          ))}
        </div>
      </div>

      {/* ── Приватность ── */}
      <div style={card}>
        <h2 style={h2}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--c-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
          Приватность
        </h2>
        <p style={p}>
          Приложение не собирает никаких данных. Нет cookies, нет аналитики,
          нет рекламы, нет трекинга. Все настройки хранятся только
          в вашем браузере (localStorage) и никуда не отправляются.
        </p>
      </div>

      {/* ── Технологии ── */}
      <div style={card}>
        <h2 style={h2}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--c-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
          Технологии
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {['React 19', 'TypeScript', 'Vite 6', 'Tailwind CSS v4', 'Zustand', 'Framer Motion', 'Vercel'].map(t => (
            <span key={t} style={{ ...tag, background: 'rgba(0,128,255,0.08)', color: 'var(--c-accent)' }}>{t}</span>
          ))}
        </div>
      </div>

      {/* ── Автор ── */}
      <div className="glass" style={{ padding: '24px 28px', borderRadius: 16 }}>
        <h2 style={h2}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--c-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          Автор
        </h2>
        <p style={{ ...p, color: 'var(--c-text-strong)', fontWeight: 600, fontSize: 15 }}>
          Алексей Семёнов
        </p>
        <p style={{ ...p, marginTop: 4 }}>
          UI/UX и веб-дизайнер, 15+ лет в индустрии.
        </p>
        <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
          <a
            href="https://github.com/graphica-online"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 8,
              background: 'var(--c-accent)', color: '#fff',
              fontSize: 13, fontWeight: 600, textDecoration: 'none',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
            GitHub
          </a>
          <a
            href="https://github.com/graphica-online/kto-tak-govorit"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 8,
              border: '1px solid var(--c-border)',
              background: 'transparent', color: 'var(--c-text-strong)',
              fontSize: 13, fontWeight: 600, textDecoration: 'none',
            }}
          >
            Исходный код
          </a>
        </div>
      </div>

      {/* ── Подвал ── */}
      <p style={{ ...p, textAlign: 'center', fontSize: 12, padding: '8px 0 20px' }}>
        Сделано с любовью для маленьких исследователей 🐾
      </p>
    </div>
  )
}