import { useState, useRef } from 'react'
import animalsData from '../data/animals.json'
import categoriesData from '../data/categories.json'
import type { Animal } from '../data/types'

const PASSWORD = 'admin'
const categories = categoriesData as { id: string; name: string }[]

export default function AdminPage() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('admin') === '1')
  const [pw, setPw] = useState('')
  const [animals, setAnimals] = useState<Animal[]>(() => [...(animalsData as Animal[])])
  const [editId, setEditId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Partial<Animal>>({})
  const [photoPreviews, setPhotoPreviews] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState(false)
  const photoRef = useRef<HTMLInputElement>(null)
  const soundRef = useRef<HTMLInputElement>(null)

  if (!authed) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <form onSubmit={e => { e.preventDefault(); if (pw === PASSWORD) { sessionStorage.setItem('admin', '1'); setAuthed(true) } }}
          style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 32, borderRadius: 20, background: 'var(--c-bg)', border: '1px solid var(--c-border)' }}>
          <h2 style={{ color: 'var(--c-text-strong)', margin: 0 }}>Вход в админку</h2>
          <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Пароль"
            style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid var(--c-border)', fontSize: 15 }} />
          <button type="submit" style={{ padding: '10px 20px', borderRadius: 10, background: 'var(--c-brand)', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer' }}>Войти</button>
        </form>
      </div>
    )
  }

  /* Фото — имя из файла */
  const handlePhoto = (file: File) => {
    if (!editId) return
    const path = `/photos/${file.name}`
    const reader = new FileReader()
    reader.onload = () => setPhotoPreviews(p => ({ ...p, [editId]: reader.result as string }))
    reader.readAsDataURL(file)
    setDraft(p => ({ ...p, photo: path }))
    setAnimals(prev => prev.map(a => a.id === editId ? { ...a, photo: path } : a))
  }

  /* Звуки — имена из файлов */
  const handleSounds = (files: FileList) => {
    if (!editId) return
    const newPaths = Array.from(files).map(f => `/sounds/${f.name}`)
    const current = draft.sounds ?? []
    const merged = [...current, ...newPaths]
    setDraft(p => ({ ...p, sounds: merged }))
    setAnimals(prev => prev.map(a => a.id === editId ? { ...a, sounds: merged } : a))
  }

  const removeSound = (idx: number) => {
    const updated = (draft.sounds ?? []).filter((_, i) => i !== idx)
    setDraft(p => ({ ...p, sounds: updated }))
    setAnimals(prev => prev.map(a => a.id === editId ? { ...a, sounds: updated } : a))
  }

  const copyJson = async () => {
    await navigator.clipboard.writeText(JSON.stringify(animals, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const startEdit = (animal: Animal) => {
    setEditId(animal.id)
    setDraft({ ...animal })
  }

  const startNew = () => {
    const id = prompt('ID животного (латиницей, например "fox"):')
    if (!id) return
    const newAnimal: Animal = {
      id, name: '', categories: [], description: '', animalClass: '',
      habitat: '', photo: '', sounds: [], silent: false, credit: '',
    }
    setAnimals(prev => [...prev, newAnimal])
    setEditId(id)
    setDraft({ ...newAnimal })
  }

  const saveEdit = () => {
    if (!editId) return
    setAnimals(prev => prev.map(a => a.id === editId ? { ...a, ...draft } as Animal : a))
    setEditId(null)
    setDraft({})
  }

  const deleteAnimal = (id: string) => {
    if (!confirm(`Удалить ${id}?`)) return
    setAnimals(prev => prev.filter(a => a.id !== id))
    if (editId === id) { setEditId(null); setDraft({}) }
  }

  const toggleCategory = (catId: string) => {
    const cats = draft.categories ?? []
    setDraft(prev => ({
      ...prev,
      categories: cats.includes(catId) ? cats.filter(c => c !== catId) : [...cats, catId],
    }))
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 12px', borderRadius: 8,
    border: '1px solid var(--c-border)', fontSize: 14,
    background: 'var(--c-bg)', color: 'var(--c-text-strong)',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, color: 'var(--c-text-muted)', marginBottom: 4, display: 'block',
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ color: 'var(--c-text-strong)', margin: 0 }}>Админ-панель</h1>
          <p style={{ color: 'var(--c-text-muted)', fontSize: 13, margin: '4px 0 0' }}>
            Имена фото и звуков берутся из загруженных файлов автоматически
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={startNew} style={{ padding: '8px 16px', borderRadius: 10, background: 'var(--c-brand)', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
            + Новое
          </button>
          <button onClick={copyJson} style={{ padding: '8px 16px', borderRadius: 10, background: 'var(--c-bg)', border: '1px solid var(--c-border)', color: 'var(--c-text-strong)', fontWeight: 600, cursor: 'pointer' }}>
            {copied ? '✓ Скопировано!' : '📋 Копировать JSON'}
          </button>
        </div>
      </div>

      {/* Две колонки */}
      <div style={{ display: 'grid', gridTemplateColumns: editId ? '1fr 1fr' : '1fr', gap: 20, alignItems: 'start' }}>

        {/* ЛЕВАЯ — список + редактор */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Список животных */}
          {animals.map(a => (
            <div key={a.id} className="glass" style={{
              padding: '12px 16px', borderRadius: 14,
              display: 'flex', alignItems: 'center', gap: 12,
              border: editId === a.id ? '2px solid var(--c-brand)' : '1px solid var(--c-border)',
              cursor: 'pointer',
            }} onClick={() => startEdit(a)}>
              <div style={{ width: 44, height: 44, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: 'var(--c-bg-mute)' }}>
                {(photoPreviews[a.id] || a.photo) ? (
                  <img src={photoPreviews[a.id] || a.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🐾</div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: 'var(--c-text-strong)', fontSize: 14 }}>{a.name || a.id}</div>
                <div style={{ fontSize: 11, color: 'var(--c-text-muted)' }}>
                  {a.categories.join(', ')} · {a.silent ? '🔇' : `🔊 ${a.sounds.length}`}
                </div>
              </div>
              <button onClick={e => { e.stopPropagation(); deleteAnimal(a.id) }}
                style={{ padding: '4px 8px', borderRadius: 6, background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 14, color: '#e53e3e' }}>
                🗑
              </button>
            </div>
          ))}

          {/* Редактор */}
          {editId && (
            <div className="glass" style={{ padding: 20, borderRadius: 20, border: '2px solid var(--c-brand)' }}>
              <h3 style={{ color: 'var(--c-text-strong)', marginBottom: 14, fontSize: 16 }}>✏️ {draft.name || editId}</h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={labelStyle}>Имя</label>
                  <input style={inputStyle} value={draft.name ?? ''} onChange={e => setDraft(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>Класс</label>
                  <input style={inputStyle} value={draft.animalClass ?? ''} onChange={e => setDraft(p => ({ ...p, animalClass: e.target.value }))} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Среда обитания</label>
                  <input style={inputStyle} value={draft.habitat ?? ''} onChange={e => setDraft(p => ({ ...p, habitat: e.target.value }))} />
                </div>
              </div>

              {/* Фото */}
              <div style={{ marginTop: 12 }}>
                <label style={labelStyle}>Фото</label>
                <input type="file" accept="image/*" ref={photoRef} style={{ display: 'none' }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) handlePhoto(f); e.target.value = '' }} />
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button onClick={() => photoRef.current?.click()}
                    style={{ padding: '7px 14px', borderRadius: 8, background: 'var(--c-brand)', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: 13 }}>
                    📷 {draft.photo ? 'Заменить' : 'Загрузить'}
                  </button>
                  {draft.photo && <span style={{ fontSize: 12, color: 'var(--c-text-muted)' }}>{draft.photo.replace('/photos/', '')}</span>}
                </div>
              </div>

              {/* Звуки */}
              <div style={{ marginTop: 12 }}>
                <label style={labelStyle}>Звуки</label>
                <input type="file" accept="audio/*" multiple ref={soundRef} style={{ display: 'none' }}
                  onChange={e => { const f = e.target.files; if (f && f.length) handleSounds(f); e.target.value = '' }} />
                <button onClick={() => soundRef.current?.click()}
                  style={{ padding: '7px 14px', borderRadius: 8, background: 'var(--c-bg-soft)', border: '1px solid var(--c-border)', color: 'var(--c-text-strong)', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
                  🔊 Добавить звук
                </button>
                {(draft.sounds ?? []).length > 0 && (
                  <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {(draft.sounds ?? []).map((s, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--c-text-muted)' }}>
                        <span style={{ flex: 1 }}>{s.replace('/sounds/', '')}</span>
                        <button onClick={() => removeSound(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e53e3e', fontSize: 12, padding: 0 }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Описание */}
              <div style={{ marginTop: 12 }}>
                <label style={labelStyle}>Описание</label>
                <textarea style={{ ...inputStyle, minHeight: 50, resize: 'vertical' }} value={draft.description ?? ''}
                  onChange={e => setDraft(p => ({ ...p, description: e.target.value }))} />
              </div>

              {/* Категории */}
              <div style={{ marginTop: 12 }}>
                <label style={labelStyle}>Категории</label>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 4 }}>
                  {categories.map(c => {
                    const active = (draft.categories ?? []).includes(c.id)
                    return (
                      <button key={c.id} onClick={() => toggleCategory(c.id)}
                        style={{
                          padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                          background: active ? 'var(--c-brand)' : 'var(--c-bg-soft)',
                          color: active ? '#fff' : 'var(--c-text-strong)',
                          border: active ? 'none' : '1px solid var(--c-border)',
                        }}>
                        {c.name}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Без звука */}
              <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <input type="checkbox" checked={draft.silent ?? false} onChange={e => setDraft(p => ({ ...p, silent: e.target.checked }))} />
                <label style={{ fontSize: 13, color: 'var(--c-text-strong)' }}>Без звука</label>
              </div>

              {/* Кнопки */}
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <button onClick={saveEdit} style={{ padding: '8px 20px', borderRadius: 10, background: 'var(--c-brand)', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                  ✓ Сохранить
                </button>
                <button onClick={() => { setEditId(null); setDraft({}) }} style={{ padding: '8px 20px', borderRadius: 10, background: 'transparent', border: '1px solid var(--c-border)', color: 'var(--c-text-strong)', fontWeight: 600, cursor: 'pointer' }}>
                  Отмена
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ПРАВАЯ — JSON */}
        {editId && (
          <div style={{ position: 'sticky', top: 72 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-text-muted)' }}>JSON</span>
              <button onClick={copyJson} style={{ padding: '4px 10px', borderRadius: 6, background: 'var(--c-bg-soft)', border: '1px solid var(--c-border)', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: 'var(--c-text-strong)' }}>
                {copied ? '✓' : '📋 Копировать'}
              </button>
            </div>
            <pre style={{
              padding: 16, borderRadius: 14,
              background: 'var(--c-bg-mute)', color: 'var(--c-text-strong)',
              fontSize: 11, lineHeight: 1.5, overflow: 'auto', maxHeight: 'calc(100vh - 120px)',
              border: '1px solid var(--c-border)',
            }}>{JSON.stringify(animals, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}