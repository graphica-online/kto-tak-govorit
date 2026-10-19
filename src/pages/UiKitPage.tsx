export default function UiKitPage() {
  const accents = [
    { name: 'red', color: 'hsl(0, 100%, 55%)' },
    { name: 'orange', color: 'hsl(25, 100%, 55%)' },
    { name: 'amber', color: 'hsl(38, 100%, 50%)' },
    { name: 'green', color: 'hsl(145, 100%, 42%)' },
    { name: 'teal', color: 'hsl(175, 100%, 40%)' },
    { name: 'blue', color: 'hsl(215, 100%, 55%)' },
    { name: 'indigo', color: 'hsl(240, 100%, 65%)' },
    { name: 'purple', color: 'hsl(270, 100%, 60%)' },
    { name: 'pink', color: 'hsl(330, 100%, 60%)' },
  ]

  const categories = [
    { emoji: '🎲', label: 'Все', count: 55, active: false },
    { emoji: '🦁', label: 'Саванна', count: 9, active: true },
    { emoji: '🐄', label: 'Ферма', count: 10, active: false },
    { emoji: '🌲', label: 'Лес', count: 10, active: false },
    { emoji: '🐱', label: 'Питомцы', count: 6, active: false },
    { emoji: '🦉', label: 'Птицы', count: 8, active: false },
    { emoji: '🐬', label: 'Море', count: 6, active: false },
    { emoji: '🐝', label: 'Насекомые', count: 6, active: false },
  ]

  const sectionTitle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    color: 'var(--c-text-dim)',
    marginBottom: 20,
  }

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 20px' }}>
      {/* Header */}
      <h1 style={{ fontSize: 42, fontWeight: 800, letterSpacing: '-.02em', color: 'var(--c-text-strong)', lineHeight: 1.1, marginBottom: 8 }}>
        🎨 UI Kit
      </h1>
      <p style={{ fontSize: 17, color: 'var(--c-text-muted)', marginBottom: 48 }}>
        Все компоненты системы. HSL S=100% — чистые насыщенные цвета.
      </p>

      {/* ─── Акценты ─── */}
      <section style={{ marginBottom: 48 }}>
        <div style={sectionTitle}>Акцентные палитры · HSL S=100%</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {accents.map(a => (
            <button
              key={a.name}
              onClick={() => (document.body.dataset.accent = a.name)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                padding: 12, borderRadius: 20, background: 'var(--c-bg)',
                border: '1px solid var(--c-border)', cursor: 'pointer', minWidth: 90,
                transition: 'transform .15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: a.color }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text-strong)' }}>{a.name}</span>
              <span style={{ fontSize: 11, color: 'var(--c-text-dim)' }}>{a.color}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ─── Кнопки ─── */}
      <section style={{ marginBottom: 48 }}>
        <div style={sectionTitle}>Кнопки</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <button style={{
            height: 50, padding: '0 28px', borderRadius: 14, background: 'var(--c-brand)',
            color: '#fff', fontWeight: 600, fontSize: 16, border: 'none', cursor: 'pointer',
            boxShadow: 'var(--shadow-brand)',
          }}>Primary</button>
          <button style={{
            height: 50, padding: '0 28px', borderRadius: 14, background: 'transparent',
            color: 'var(--c-text-strong)', fontWeight: 600, fontSize: 16,
            border: '1px solid var(--c-border-strong)', cursor: 'pointer',
          }}>Outline</button>
          <button style={{
            height: 50, padding: '0 28px', borderRadius: 14, background: 'transparent',
            color: 'var(--c-text-strong)', fontWeight: 600, fontSize: 16,
            border: 'none', cursor: 'pointer',
          }}>Ghost</button>
          <button style={{
            height: 50, padding: '0 28px', borderRadius: 14, background: 'var(--c-bg-dark)',
            color: '#fff', fontWeight: 600, fontSize: 16, border: 'none', cursor: 'pointer',
          }}>Dark</button>
          <button disabled style={{
            height: 50, padding: '0 28px', borderRadius: 14, background: 'var(--c-bg-mute)',
            color: 'var(--c-text-dim)', fontWeight: 600, fontSize: 16,
            border: 'none', cursor: 'not-allowed',
          }}>Disabled</button>
        </div>

        <div style={{ ...sectionTitle, marginTop: 32 }}>Размеры</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <button style={{ height: 38, padding: '0 16px', borderRadius: 10, background: 'var(--c-brand)', color: '#fff', fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer' }}>Small · 38</button>
          <button style={{ height: 50, padding: '0 28px', borderRadius: 14, background: 'var(--c-brand)', color: '#fff', fontWeight: 600, fontSize: 16, border: 'none', cursor: 'pointer' }}>Medium · 50</button>
          <button style={{ height: 60, padding: '0 32px', borderRadius: 14, background: 'var(--c-brand)', color: '#fff', fontWeight: 600, fontSize: 17, border: 'none', cursor: 'pointer' }}>Large · 60</button>
        </div>

        <div style={{ ...sectionTitle, marginTop: 32 }}>Icon-кнопки</div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--c-bg)', border: '1px solid var(--c-border)', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>☰</button>
          <button style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--c-bg)', border: '1px solid var(--c-border)', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          <button style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--c-brand)', border: 'none', cursor: 'pointer', fontSize: 22, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-brand)' }}>▶</button>
        </div>
      </section>

      {/* ─── Bubbles ─── */}
      <section style={{ marginBottom: 48 }}>
        <div style={sectionTitle}>Категории · Bubbles</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {categories.map(b => (
            <button
              key={b.label}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 20px', borderRadius: 999, fontSize: 15, fontWeight: 600,
                whiteSpace: 'nowrap', cursor: 'pointer', transition: 'all .25s',
                ...(b.active
                  ? { background: 'var(--c-brand)', color: '#fff', border: '1px solid var(--c-brand)', boxShadow: 'var(--shadow-brand)' }
                  : { background: 'var(--c-bg)', color: 'var(--c-text-strong)', border: '1px solid var(--c-border)' }),
              }}
            >
              <span style={{ fontSize: 18 }}>{b.emoji}</span>
              {b.label}
              <span style={{ fontSize: 12, opacity: 0.6 }}>{b.count}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ─── Badges ─── */}
      <section style={{ marginBottom: 48 }}>
        <div style={sectionTitle}>Бейджи</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <span style={{ display: 'inline-flex', padding: '5px 12px', borderRadius: 999, fontSize: 13, fontWeight: 600, background: 'var(--c-bg-soft)', color: 'var(--c-text-strong)' }}>Default</span>
          <span style={{ display: 'inline-flex', padding: '5px 12px', borderRadius: 999, fontSize: 13, fontWeight: 600, background: 'var(--c-brand-soft)', color: 'var(--c-brand)' }}>Brand</span>
          <span style={{ display: 'inline-flex', padding: '5px 12px', borderRadius: 999, fontSize: 13, fontWeight: 600, background: 'rgba(34,160,107,.1)', color: '#22A06B' }}>✓ Онлайн</span>
          <span style={{ display: 'inline-flex', padding: '5px 12px', borderRadius: 999, fontSize: 13, fontWeight: 600, background: 'rgba(207,45,45,.1)', color: '#CF2D2D' }}>✕ Ошибка</span>
          <span style={{ display: 'inline-flex', padding: '5px 12px', borderRadius: 999, fontSize: 13, fontWeight: 600, background: 'var(--c-bg-dark)', color: '#fff' }}>Dark</span>
          <span style={{ display: 'inline-flex', padding: '5px 12px', borderRadius: 999, fontSize: 13, fontWeight: 600, background: 'var(--c-bg-soft)', color: 'var(--c-text-muted)' }}>🔇 Без звука</span>
        </div>
      </section>

      {/* ─── Типографика ─── */}
      <section style={{ marginBottom: 48 }}>
        <div style={sectionTitle}>Типографика</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h1 style={{ fontSize: 56, fontWeight: 800, letterSpacing: '-.03em', lineHeight: 1.05, color: 'var(--c-text-strong)' }}>H1 · 56px · 800</h1>
          <h2 style={{ fontSize: 42, fontWeight: 700, letterSpacing: '-.02em', lineHeight: 1.1, color: 'var(--c-text-strong)' }}>H2 · 42px · 700</h2>
          <h3 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-.01em', lineHeight: 1.15, color: 'var(--c-text-strong)' }}>H3 · 28px · 700</h3>
          <h4 style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.25, color: 'var(--c-text-strong)' }}>H4 · 22px · 600</h4>
          <p style={{ fontSize: 17, color: 'var(--c-text-muted)', lineHeight: 1.5 }}>Lead · 17px · Muted</p>
          <p style={{ fontSize: 15, color: 'var(--c-text)', lineHeight: 1.5 }}>Body · 15px · Regular</p>
          <p style={{ fontSize: 13, color: 'var(--c-text-muted)', lineHeight: 1.4 }}>Small · 13px · Muted</p>
        </div>
      </section>

      {/* ─── Play + Nav ─── */}
      <section style={{ marginBottom: 48 }}>
        <div style={sectionTitle}>Play + Навигация</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--c-brand)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-brand)' }}>▶</button>
          <button style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--c-bg)', color: 'var(--c-text-strong)', border: '1px solid var(--c-border)', cursor: 'pointer', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
          <button style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--c-bg)', color: 'var(--c-text-strong)', border: '1px solid var(--c-border)', cursor: 'pointer', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text-dim)', fontVariantNumeric: 'tabular-nums' }}>03 / 09</span>
        </div>
      </section>

      {/* ─── Settings ─── */}
      <section style={{ marginBottom: 48 }}>
        <div style={sectionTitle}>Настройки (фрагмент)</div>
        <div style={{ maxWidth: 480, padding: 24, background: 'var(--c-bg)', borderRadius: 28, boxShadow: 'var(--shadow-m)' }}>
          {[
            { title: 'Автоплей', desc: 'Звук при показе карточки', on: true },
            { title: 'Циклическая навигация', desc: 'После последнего → первое', on: false },
            { title: 'Показывать без звука', desc: 'Бабочка, улитка и др.', on: true },
          ].map(s => (
            <div key={s.title} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--c-border)' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--c-text-strong)' }}>{s.title}</div>
                <div style={{ fontSize: 13, color: 'var(--c-text-muted)' }}>{s.desc}</div>
              </div>
              <div style={{
                width: 48, height: 28, borderRadius: 999, cursor: 'pointer', position: 'relative',
                background: s.on ? 'var(--c-brand)' : 'var(--c-border-strong)',
                transition: 'background .25s',
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', background: '#fff',
                  position: 'absolute', top: 3, left: s.on ? 23 : 3,
                  boxShadow: '0 2px 6px rgba(0,0,0,.2)', transition: 'left .25s',
                }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer style={{ textAlign: 'center', padding: '32px 0', color: 'var(--c-text-dim)' }}>
        <p style={{ fontSize: 13 }}>UI Kit · Кто так говорит? · v1.0 · HSL S=100%</p>
      </footer>
    </div>
  )
}