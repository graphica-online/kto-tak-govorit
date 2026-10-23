import { useState, useRef, useCallback } from 'react'
import animalsData from '../data/animals.json'
import categoriesData from '../data/categories.json'
import type { Animal } from '../data/types'

const PASSWORD = 'admin'
const categories = categoriesData as { id: string; name: string }[]

interface PhotoDraft {
  file: File
  dataUrl: string
  webpBlob: Blob | null
  fileName: string
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('admin') === '1')
  const [pw, setPw] = useState('')
  const [animals, setAnimals] = useState<Animal[]>(() => [...(animalsData as Animal[])])
  const [editId, setEditId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Partial<Animal>>({})
  const [photos, setPhotos] = useState<Record<string, PhotoDraft>>({})
  const [copied, setCopied] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

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

  const convertToWebP = (file: File, animalId: string): Promise<PhotoDraft> => {
    return new Promise(resolve => {
      const reader = new FileReader()
      reader.onload = () => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const maxW = 1920
          const scale = img.width > maxW ? maxW / img.width : 1
          canvas.width = img.width * scale
          canvas.height = img.height * scale
          const ctx = canvas.getContext('2d')!
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          canvas.toBlob(blob => {
            const fileName = `${animalId}.webp`
            resolve({
              file,
              dataUrl: canvas.toDataURL('image/webp', 0.85),
              webpBlob: blob,
              fileName,
            })
          }, 'image/webp', 0.85)
        }
        img.src = reader.result as string
      }
      reader.readAsDataURL(file)
    })
  }

  const handlePhotoUpload = async (animalId: string, file: File) => {
    const draft = await convertToWebP(file, animalId)
    setPhotos(prev => ({ ...prev, [animalId]: draft }))
    setAnimals(prev => prev.map(a => a.id === animalId ? { ...a, photo: `/photos/${draft.fileName}` } : a))
    if (editId === animalId) {
      setDraft(prev => ({ ...prev, photo: `/photos/${draft.fileName}` }))
    }
  }

  const downloadPhoto = (animalId: string) => {
    const p = photos[animalId]
    if (!p?.webpBlob) return
    const url = URL.createObjectURL(p.webpBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = p.fileName
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadAllPhotos = () => {
    Object.entries(photos).forEach(([id]) => {
      setTimeout(() => downloadPhoto(id), 200)
    })
  }

  const getJsonOutput = () => JSON.stringify(animals, null, 2)

  const copyJson = async () => {
    await navigator.clipboard.writeText(getJsonOutput())
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
      habitat: '', photo: `/photos/${id}.webp`, sounds: [], silent: false, credit: '',
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

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>
      <h1 style={{ color: 'var(--c-text-strong)', marginBottom: 8 }}>Админ-панель</h1>
      <p style={{ color: 'var(--c-text-muted)', fontSize: 13, marginBottom: 20 }}>
        Добавляй и редактируй животных. Фото конвертируется в WebP автоматически.
      </p>

      {/* Действия */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <button onClick={startNew} style={{ padding: '8px 16px', borderRadius: 10, background: 'var(--c-brand)', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
          + Новое животное
        </button>
        <button onClick={copyJson} style={{ padding: '8px 16px', borderRadius: 10, background: 'var(--c-bg)', border: '1px solid var(--c-border)', color: 'var(--c-text-strong)', fontWeight: 600, cursor: 'pointer' }}>
          {copied ? '✓ Скопировано!' : '📋 Скопировать JSON'}
        </button>
        <button onClick={downloadAllPhotos} style={{ padding: '8px 16px', borderRadius: 10, background: 'var(--c-bg)', border: '1px solid var(--c-border)', color: 'var(--c-text-strong)', fontWeight: 600, cursor: 'pointer' }}>
          📷 Скачать все фото
        </button>
      </div>

      {/* Список */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {animals.map(a => (
          <div key={a.id} className="glass" style={{
            padding: '14px 18px', borderRadius: 14,
            display: 'flex', alignItems: 'center', gap: 12,
            border: editId === a.id ? '2px solid var(--c-brand)' : '1px solid var(--c-border)',
          }}>
            {/* Превью фото */}
            <div style={{ width: 48, height: 48, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: 'var(--c-bg-mute)' }}>
              {(photos[a.id]?.dataUrl || a.photo) ? (
                <img src={photos[a.id]?.dataUrl || a.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🐾</div>
              )}
            </div>

            {/* Инфо */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, color: 'var(--c-text-strong)', fontSize: 15 }}>{a.name || a.id}</div>
              <div style={{ fontSize: 12, color: 'var(--c-text-muted)' }}>
                {a.categories.join(', ')} · {a.silent ? '🔇' : `🔊 ${a.sounds.length}`}
                {photos[a.id] ? ' · 📷 новое фото' : ''}
              </div>
            </div>

            {/* Кнопки */}
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              {photos[a.id] && (
                <button onClick={() => downloadPhoto(a.id)} title="Скачать фото"
                  style={{ padding: '6px 10px', borderRadius: 8, background: 'var(--c-bg-soft)', border: '1px solid var(--c-border)', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--c-text-strong)' }}>
                  📷 Скачать
                </button>
              )}
              <button onClick={() => startEdit(a)} style={{ padding: '6px 10px', borderRadius: 8, background: 'var(--c-bg-soft)', border: '1px solid var(--c-border)', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--c-text-strong)' }}>
                ✏️
              </button>
              <button onClick={() => deleteAnimal(a.id)} style={{ padding: '6px 10px', borderRadius: 8, background: 'transparent', border: '1px solid var(--c-border)', cursor: 'pointer', fontSize: 12, color: '#e53e3e' }}>
                🗑
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Редактор */}
      {editId && (
        <div className="glass" style={{ marginTop: 20, padding: 24, borderRadius: 20 }}>
          <h3 style={{ color: 'var(--c-text-strong)', marginBottom: 16 }}>Редактирование: {editId}</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-text-muted)' }}>Имя</label>
              <input style={inputStyle} value={draft.name ?? ''} onChange={e => setDraft(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-text-muted)' }}>Класс</label>
              <input style={inputStyle} value={draft.animalClass ?? ''} onChange={e => setDraft(p => ({ ...p, animalClass: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-text-muted)' }}>Среда обитания</label>
              <input style={inputStyle} value={draft.habitat ?? ''} onChange={e => setDraft(p => ({ ...p, habitat: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-text-muted)' }}>Фото</label>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input type="file" accept="image/*" ref={fileRef} style={{ display: 'none' }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(editId, f) }} />
                <button onClick={() => fileRef.current?.click()}
                  style={{ padding: '8px 14px', borderRadius: 8, background: 'var(--c-brand)', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: 13 }}>
                  {photos[editId] ? '📷 Заменить фото' : '📷 Загрузить фото'}
                </button>
                {photos[editId] && <span style={{ fontSize: 12, color: 'var(--c-text-muted)' }}>{photos[editId].fileName}</span>}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-text-muted)' }}>Описание</label>
            <textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} value={draft.description ?? ''}
              onChange={e => setDraft(p => ({ ...p, description: e.target.value }))} />
          </div>

          <div style={{ marginTop: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-text-muted)' }}>Категории</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
              {categories.map(c => {
                const active = (draft.categories ?? []).includes(c.id)
                return (
                  <button key={c.id} onClick={() => toggleCategory(c.id)}
                    style={{
                      padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer',
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

          <div style={{ marginTop: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-text-muted)' }}>Звуки (пути через запятую)</label>
            <input style={inputStyle} value={(draft.sounds ?? []).join(', ')}
              onChange={e => setDraft(p => ({ ...p, sounds: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
              placeholder="/sounds/owl-1.mp3, /sounds/owl-2.mp3" />
          </div>

          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={draft.silent ?? false} onChange={e => setDraft(p => ({ ...p, silent: e.target.checked }))} />
            <label style={{ fontSize: 13, color: 'var(--c-text-strong)' }}>Без звука</label>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button onClick={saveEdit} style={{ padding: '10px 24px', borderRadius: 10, background: 'var(--c-brand)', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
              ✓ Сохранить
            </button>
            <button onClick={() => { setEditId(null); setDraft({}) }} style={{ padding: '10px 24px', borderRadius: 10, background: 'transparent', border: '1px solid var(--c-border)', color: 'var(--c-text-strong)', fontWeight: 600, cursor: 'pointer' }}>
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* JSON превью */}
      <details style={{ marginTop: 24 }}>
        <summary style={{ cursor: 'pointer', fontWeight: 600, color: 'var(--c-text-muted)', fontSize: 13 }}>Показать JSON</summary>
        <pre style={{
          marginTop: 8, padding: 16, borderRadius: 12,
          background: 'var(--c-bg-mute)', color: 'var(--c-text-strong)',
          fontSize: 12, overflow: 'auto', maxHeight: 400,
        }}>{getJsonOutput()}</pre>
      </details>
    </div>
  )
}