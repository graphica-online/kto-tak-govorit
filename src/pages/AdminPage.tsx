import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import animalsData from '../data/animals.json'
import categoriesData from '../data/categories.json'
import type { Animal } from '../data/types'

/* ══════════════════════════════════════════════════════════════
   ⚠️  ПОМЕНЯЙТЕ ПАРОЛЬ НА СВОЙ!
   ══════════════════════════════════════════════════════════════ */
const ADMIN_KEY = 'admin'

type Category = { id: string; name: string; emoji: string }
const categories = categoriesData as Category[]
const initialAnimals = animalsData as Animal[]

/* ─── Транслитерация ─── */
function slugify(name: string): string {
  const map: Record<string, string> = {
    'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo',
    'ж':'zh','з':'z','и':'i','й':'y','к':'k','л':'l','м':'m',
    'н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u',
    'ф':'f','х':'kh','ц':'ts','ч':'ch','ш':'sh','щ':'shch',
    'ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya',
  }
  return name.toLowerCase().split('').map(c => map[c] || c).join('')
    .replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

/* ─── Конвертация в WebP (1920, 85%) ─── */
function convertToWebP(file: File, maxWidth = 1920, quality = 0.85): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let w = img.width
      let h = img.height
      if (w > maxWidth) {
        h = Math.round(h * (maxWidth / w))
        w = maxWidth
      }
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('Canvas не поддерживается'))
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, w, h)
      canvas.toBlob(
        blob => {
          if (!blob) return reject(new Error('Конвертация не удалась'))
          const newName = file.name.replace(/\.[^.]+$/, '.webp')
          resolve(new File([blob], newName, { type: 'image/webp' }))
        },
        'image/webp',
        quality
      )
    }
    img.onerror = () => reject(new Error('Не удалось загрузить изображение'))
    img.src = URL.createObjectURL(file)
  })
}

/* ─── Стили ─── */
const card: React.CSSProperties = {
  background: 'var(--c-bg)', borderRadius: 20, padding: 24, boxShadow: 'var(--shadow-m)',
}
const inp: React.CSSProperties = {
  width: '100%', height: 44, padding: '0 14px',
  border: '1px solid var(--c-border-strong)', borderRadius: 10,
  fontSize: 15, background: 'var(--c-bg)', color: 'var(--c-text-strong)',
}
const lbl: React.CSSProperties = {
  fontSize: 13, fontWeight: 600, color: 'var(--c-text-muted)', marginBottom: 4, display: 'block',
}
const dz = (a: boolean): React.CSSProperties => ({
  border: `2px dashed ${a ? 'var(--c-brand)' : 'var(--c-border-strong)'}`,
  borderRadius: 14, padding: 20, textAlign: 'center',
  background: a ? 'var(--c-brand-soft)' : 'var(--c-bg-soft)',
  cursor: 'pointer', transition: 'all .15s', fontSize: 14, color: 'var(--c-text-muted)',
})

const emptyForm = {
  name: '', animalClass: 'Млекопитающее', habitat: '',
  description: '', categories: [] as string[], silent: false,
  credit: 'Pixabay, CC0',
}

/* ═══════════════════════════════════════════════════════════════ */
export default function AdminPage() {
  /* ═══ 1. АВТОРИЗАЦИЯ ═══ */
  const [isAuthed, setIsAuthed] = useState(() => {
    if (sessionStorage.getItem('admin_authed') === 'true') return true
    const params = new URLSearchParams(window.location.search)
    if (params.get('key') === ADMIN_KEY) {
      sessionStorage.setItem('admin_authed', 'true')
      return true
    }
    return false
  })
  const [passwordInput, setPasswordInput] = useState('')
  const [authError, setAuthError] = useState(false)

  useEffect(() => {
    if (isAuthed) return
    const params = new URLSearchParams(window.location.search)
    if (params.get('key') === ADMIN_KEY) {
      sessionStorage.setItem('admin_authed', 'true')
      setIsAuthed(true)
    }
  }, [isAuthed])

  const handleLogin = () => {
    if (passwordInput === ADMIN_KEY) {
      sessionStorage.setItem('admin_authed', 'true')
      setIsAuthed(true)
      setAuthError(false)
    } else {
      setAuthError(true)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('admin_authed')
    setIsAuthed(false)
  }

  /* ═══ 2. ДАННЫЕ ═══ */
  const [animals, setAnimals] = useState<Animal[]>(initialAnimals)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoConverting, setPhotoConverting] = useState(false)
  const [photoInfo, setPhotoInfo] = useState<string | null>(null)

  const [soundFiles, setSoundFiles] = useState<File[]>([])
  const [existingSounds, setExistingSounds] = useState<string[]>([])

  const [dragPhoto, setDragPhoto] = useState(false)
  const [dragSound, setDragSound] = useState(false)
  const [exportStatus, setExportStatus] = useState('')

  const photoRef = useRef<HTMLInputElement>(null)
  const soundRef = useRef<HTMLInputElement>(null)

  const allClasses = useMemo(() => {
    const s = new Set(animals.map(a => a.animalClass))
    return Array.from(s).sort()
  }, [animals])

  /* ═══ 3. ФОТО ═══ */
  const processPhoto = async (file: File) => {
    if (!file.type.startsWith('image/')) return
    setPhotoConverting(true)
    setPhotoInfo(null)
    const origKB = (file.size / 1024).toFixed(0)
    try {
      let final = file
      if (file.type !== 'image/webp') {
        final = await convertToWebP(file)
      }
      const newKB = (final.size / 1024).toFixed(0)
      const saved = Math.round((1 - final.size / file.size) * 100)
      setPhotoFile(final)
      setPhotoPreview(URL.createObjectURL(final))
      setPhotoInfo(
        file.type !== 'image/webp'
          ? `✨ ${origKB} КБ → ${newKB} КБ (−${saved}%)`
          : `✅ WebP: ${newKB} КБ`
      )
    } catch {
      setPhotoFile(file)
      setPhotoPreview(URL.createObjectURL(file))
      setPhotoInfo('⚠️ Не удалось сконвертировать')
    } finally {
      setPhotoConverting(false)
    }
  }

  const onPhotoDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault(); setDragPhoto(false)
    const f = e.dataTransfer.files[0]
    if (f) await processPhoto(f)
  }, [])

  const onPhotoSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) await processPhoto(f)
  }, [])

  /* ═══ 4. ЗВУКИ ═══ */
  const onSoundDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragSound(false)
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('audio/'))
    setSoundFiles(p => [...p, ...files])
  }, [])

  const onSoundSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(f => f.type.startsWith('audio/'))
    setSoundFiles(p => [...p, ...files])
  }, [])

  /* ═══ 5. КАТЕГОРИИ ═══ */
  const toggleCat = (id: string) => {
    setForm(p => ({
      ...p,
      categories: p.categories.includes(id)
        ? p.categories.filter(c => c !== id)
        : [...p.categories, id],
    }))
  }

  /* ═══ 6. РЕДАКТИРОВАНИЕ ═══ */
  const startEdit = (a: Animal) => {
    setEditingId(a.id)
    setForm({
      name: a.name, animalClass: a.animalClass, habitat: a.habitat,
      description: a.description, categories: [...a.categories],
      silent: a.silent, credit: a.credit,
    })
    setExistingSounds([...a.sounds])
    setSoundFiles([])
    setPhotoFile(null)
    setPhotoPreview(a.photo || null)
    setPhotoInfo(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelEdit = () => { setEditingId(null); resetForm() }

  const resetForm = () => {
    setForm(emptyForm)
    setPhotoFile(null); setPhotoPreview(null); setPhotoInfo(null)
    setSoundFiles([]); setExistingSounds([]); setEditingId(null)
  }

  /* ═══ 7. ПОСТРОЕНИЕ ДАННЫХ ЖИВОТНОГО ═══ */
  const buildAnimalData = (): Animal | null => {
    if (!form.name.trim() || form.categories.length === 0) return null

    const slug = editingId || slugify(form.name)
    const photoPath = photoFile
      ? `/photos/${slug}.webp`
      : (editingId ? (animals.find(a => a.id === slug)?.photo || '') : '')

    const totalSounds = existingSounds.length + soundFiles.length
    const soundPaths: string[] = []
    for (let i = 0; i < totalSounds; i++) {
      const ext = i < existingSounds.length
        ? '.' + (existingSounds[i].split('.').pop() || 'mp3')
        : '.' + (soundFiles[i - existingSounds.length]?.name.split('.').pop() || 'mp3')
      soundPaths.push(`/sounds/${slug}-${i + 1}${ext}`)
    }

    return {
      id: slug,
      name: form.name.trim(),
      categories: form.categories,
      description: form.description.trim(),
      animalClass: form.animalClass.trim(),
      habitat: form.habitat.trim(),
      photo: photoPath,
      sounds: soundPaths,
      silent: form.silent,
      credit: form.credit,
    }
  }

  /* ═══ 8. СОХРАНЕНИЕ ═══ */
  const saveAnimal = () => {
    const data = buildAnimalData()
    if (!data) {
      if (!form.name.trim()) alert('Введите название')
      else if (form.categories.length === 0) alert('Выберите категорию')
      return
    }
    if (editingId) {
      setAnimals(p => p.map(a => a.id === editingId ? data : a))
    } else {
      setAnimals(p => [...p, data])
    }
    resetForm()
  }

  const removeAnimal = (id: string) => {
    if (confirm('Удалить это животное?')) {
      setAnimals(p => p.filter(a => a.id !== id))
      if (editingId === id) cancelEdit()
    }
  }

  /* ═══ 9. СОХРАНИТЬ + СРАЗУ СКАЧАТЬ JSON ═══ */
  const saveAndExportJSON = () => {
    const data = buildAnimalData()
    if (!data) {
      if (!form.name.trim()) alert('Введите название')
      else if (form.categories.length === 0) alert('Выберите категорию')
      return
    }
    const updated = editingId
      ? animals.map(a => a.id === editingId ? data : a)
      : [...animals, data]

    const blob = new Blob([JSON.stringify(updated, null, 2)], { type: 'application/json' })
    saveAs(blob, 'animals.json')

    setAnimals(updated)
    resetForm()
  }

  /* ═══ 10. СОХРАНИТЬ + СРАЗУ СКАЧАТЬ ZIP ═══ */
  const saveAndExportZIP = async () => {
    const data = buildAnimalData()
    if (!data) {
      if (!form.name.trim()) alert('Введите название')
      else if (form.categories.length === 0) alert('Выберите категорию')
      return
    }
    const updated = editingId
      ? animals.map(a => a.id === editingId ? data : a)
      : [...animals, data]

    setExportStatus('Создаю архив...')
    const zip = new JSZip()
    zip.file('src/data/animals.json', JSON.stringify(updated, null, 2))

    if (photoFile) {
      const buf = await photoFile.arrayBuffer()
      zip.file(`public/photos/${data.id}.webp`, buf)
    }

    for (let i = 0; i < soundFiles.length; i++) {
      const f = soundFiles[i]
      const ext = '.' + (f.name.split('.').pop() || 'mp3')
      const idx = existingSounds.length + i + 1
      const buf = await f.arrayBuffer()
      zip.file(`public/sounds/${data.id}-${idx}${ext}`, buf)
    }

    const blob = await zip.generateAsync({ type: 'blob' })
    saveAs(blob, 'kto-tak-govorit-update.zip')
    setExportStatus('✅ Архив скачан!')
    setTimeout(() => setExportStatus(''), 4000)

    setAnimals(updated)
    resetForm()
  }

  /* ═══ 11. ЭКСПОРТ ТЕКУЩЕГО СОСТОЯНИЯ (БЕЗ СОХРАНЕНИЯ) ═══ */
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(animals, null, 2)], { type: 'application/json' })
    saveAs(blob, 'animals.json')
  }

  const exportZIP = async () => {
    setExportStatus('Создаю архив...')
    const zip = new JSZip()
    zip.file('src/data/animals.json', JSON.stringify(animals, null, 2))
    const blob = await zip.generateAsync({ type: 'blob' })
    saveAs(blob, 'kto-tak-govorit-update.zip')
    setExportStatus('✅ Архив скачан!')
    setTimeout(() => setExportStatus(''), 4000)
  }

  /* ═══ 12. ЭКРАН ВХОДА ═══ */
  if (!isAuthed) {
    return (
      <div style={{
        minHeight: 'calc(100vh - 56px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ ...card, width: 360, textAlign: 'center' }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--c-text-strong)', marginBottom: 8 }}>
            🔒 Админ-панель
          </h2>
          <p style={{ fontSize: 14, color: 'var(--c-text-muted)', marginBottom: 20 }}>
            Введите пароль для доступа
          </p>
          <input
            type="password"
            value={passwordInput}
            onChange={e => { setPasswordInput(e.target.value); setAuthError(false) }}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="Пароль"
            style={{ ...inp, textAlign: 'center', marginBottom: 12 }}
          />
          {authError && (
            <div style={{ fontSize: 13, color: 'var(--c-danger)', marginBottom: 12 }}>
              Неверный пароль
            </div>
          )}
          <button onClick={handleLogin} style={{
            width: '100%', height: 48, borderRadius: 14,
            background: 'var(--c-brand)', color: '#fff',
            border: 'none', cursor: 'pointer', fontSize: 16, fontWeight: 700,
          }}>
            Войти
          </button>
          <p style={{ fontSize: 12, color: 'var(--c-text-dim)', marginTop: 16 }}>
            Или откройте: <code style={{ fontSize: 11 }}>/admin?key=ваш_пароль</code>
          </p>
        </div>
      </div>
    )
  }

  /* ═══ 13. ОСНОВНАЯ АДМИНКА ═══ */
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px' }}>
      {/* Заголовок + Выход */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: 'var(--c-text-strong)' }}>
          ⚙ Админ-панель
        </h1>
        <button onClick={handleLogout} style={{
          padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
          background: 'var(--c-bg-soft)', border: '1px solid var(--c-border)',
          color: 'var(--c-text-muted)', cursor: 'pointer',
        }}>
          🔓 Выйти
        </button>
      </div>

      <p style={{ fontSize: 15, color: 'var(--c-text-muted)', marginBottom: 32 }}>
        {editingId
          ? `Редактирование: ${animals.find(a => a.id === editingId)?.name}`
          : 'Добавляйте животных, загружайте фото и звуки, экспортируйте архив.'}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

        {/* ═══ ЛЕВАЯ КОЛОНКА: ФОРМА ═══ */}
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--c-text-strong)' }}>
              {editingId ? '✏️ Редактирование' : '➕ Новое животное'}
            </h2>
            {editingId && (
              <button onClick={cancelEdit} style={{
                padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                background: 'var(--c-bg-soft)', border: '1px solid var(--c-border)',
                color: 'var(--c-text-muted)', cursor: 'pointer',
              }}>Отмена</button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Название */}
            <div>
              <label style={lbl}>Название *</label>
              <input style={inp} value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Например: Тигр" />
              {form.name && !editingId && (
                <span style={{ fontSize: 12, color: 'var(--c-text-dim)' }}>
                  ID: {slugify(form.name)} · Фото: {slugify(form.name)}.webp · Звуки: {slugify(form.name)}-1.mp3, -2...
                </span>
              )}
            </div>

            {/* Класс + Среда */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={lbl}>Класс животного</label>
                <input style={inp} value={form.animalClass} list="classes"
                  onChange={e => setForm(p => ({ ...p, animalClass: e.target.value }))} />
                <datalist id="classes">
                  {allClasses.map(c => <option key={c} value={c} />)}
                  <option value="Млекопитающее" /><option value="Птица" />
                  <option value="Рептилия" /><option value="Земноводное" />
                  <option value="Рыба" /><option value="Насекомое" />
                  <option value="Моллюск" /><option value="Ракообразное" />
                  <option value="Паукообразное" />
                </datalist>
              </div>
              <div>
                <label style={lbl}>Среда обитания</label>
                <input style={inp} value={form.habitat}
                  onChange={e => setForm(p => ({ ...p, habitat: e.target.value }))}
                  placeholder="Лес, Саванна..." />
              </div>
            </div>

            {/* Описание */}
            <div>
              <label style={lbl}>Описание</label>
              <textarea style={{ ...inp, height: 72, padding: '10px 14px', resize: 'vertical' }}
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Краткое описание для карточки..." />
            </div>

            {/* Категории */}
            <div>
              <label style={lbl}>Категории *</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {categories.map(c => (
                  <button key={c.id} onClick={() => toggleCat(c.id)} style={{
                    padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', border: '1px solid',
                    borderColor: form.categories.includes(c.id) ? 'var(--c-brand)' : 'var(--c-border)',
                    background: form.categories.includes(c.id) ? 'var(--c-brand)' : 'var(--c-bg)',
                    color: form.categories.includes(c.id) ? '#fff' : 'var(--c-text-strong)',
                  }}>{c.emoji} {c.name}</button>
                ))}
              </div>
            </div>

            {/* Фото */}
            <div>
              <label style={lbl}>
                Фото {editingId && !photoFile && '(не изменено)'}
                <span style={{ fontWeight: 400, color: 'var(--c-text-dim)', marginLeft: 8 }}>
                  → WebP, 1920px
                </span>
              </label>
              <div style={dz(dragPhoto)}
                onDragOver={e => { e.preventDefault(); setDragPhoto(true) }}
                onDragLeave={() => setDragPhoto(false)}
                onDrop={onPhotoDrop}
                onClick={() => !photoConverting && photoRef.current?.click()}>
                {photoConverting ? (
                  <div><div style={{ fontSize: 24 }}>⏳</div>Конвертирую в WebP...</div>
                ) : photoPreview ? (
                  <div>
                    <img src={photoPreview} alt="" style={{ maxHeight: 140, borderRadius: 8, margin: '0 auto' }} />
                    {photoInfo && <div style={{ fontSize: 12, color: 'var(--c-brand)', marginTop: 8, fontWeight: 600 }}>{photoInfo}</div>}
                    <div style={{ fontSize: 12, color: 'var(--c-text-dim)', marginTop: 4 }}>Кликните чтобы заменить</div>
                  </div>
                ) : (
                  <span>📁 Перетащите фото или кликните<br /><span style={{ fontSize: 12 }}>JPG, PNG, WebP</span></span>
                )}
                <input ref={photoRef} type="file" accept="image/*" hidden onChange={onPhotoSelect} />
              </div>
            </div>

            {/* Звуки */}
            <div>
              <label style={lbl}>
                Звуки {existingSounds.length + soundFiles.length > 0
                  ? `(${existingSounds.length + soundFiles.length})`
                  : ''}
                <span style={{ fontWeight: 400, color: 'var(--c-text-dim)', marginLeft: 8 }}>
                  → нумерация автоматическая
                </span>
              </label>

              {existingSounds.length > 0 && (
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 12, color: 'var(--c-text-dim)', marginBottom: 4 }}>Текущие:</div>
                  {existingSounds.map((s, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '4px 8px', background: 'var(--c-bg-soft)', borderRadius: 6,
                      fontSize: 13, marginBottom: 2,
                    }}>
                      <span style={{ color: 'var(--c-text-strong)' }}>🔊 {s.replace('/sounds/', '')}</span>
                      <button onClick={() => setExistingSounds(p => p.filter((_, j) => j !== i))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-danger)', fontSize: 12 }}>✕</button>
                    </div>
                  ))}
                </div>
              )}

              {soundFiles.length > 0 && (
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 12, color: 'var(--c-brand)', marginBottom: 4 }}>Новые:</div>
                  {soundFiles.map((f, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '4px 8px', background: 'var(--c-brand-soft)', borderRadius: 6,
                      fontSize: 13, marginBottom: 2,
                    }}>
                      <span style={{ color: 'var(--c-text-strong)' }}>
                        🆕 {f.name} <span style={{ color: 'var(--c-text-dim)' }}>({(f.size / 1024).toFixed(0)} КБ)</span>
                      </span>
                      <button onClick={() => setSoundFiles(p => p.filter((_, j) => j !== i))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-danger)', fontSize: 12 }}>✕</button>
                    </div>
                  ))}
                </div>
              )}

              <div style={dz(dragSound)}
                onDragOver={e => { e.preventDefault(); setDragSound(true) }}
                onDragLeave={() => setDragSound(false)}
                onDrop={onSoundDrop}
                onClick={() => soundRef.current?.click()}>
                <span>📁 Перетащите аудио или кликните<br /><span style={{ fontSize: 12 }}>MP3, OGG, WAV · Несколько файлов</span></span>
                <input ref={soundRef} type="file" accept="audio/*" multiple hidden onChange={onSoundSelect} />
              </div>
            </div>

            {/* Без звука */}
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
              <input type="checkbox" checked={form.silent}
                onChange={e => setForm(p => ({ ...p, silent: e.target.checked }))}
                style={{ accentColor: 'var(--c-brand)' }} />
              Без звука
            </label>

            {/* Лицензия */}
            <div>
              <label style={lbl}>Автор / Лицензия</label>
              <input style={inp} value={form.credit}
                onChange={e => setForm(p => ({ ...p, credit: e.target.value }))} />
            </div>

            {/* ═══ КНОПКИ СОХРАНЕНИЯ ═══ */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={saveAnimal} disabled={photoConverting} style={{
                flex: 1, height: 50, borderRadius: 14,
                background: photoConverting ? 'var(--c-bg-mute)' : editingId ? '#22A06B' : 'var(--c-brand)',
                color: photoConverting ? 'var(--c-text-dim)' : '#fff',
                border: 'none', cursor: photoConverting ? 'not-allowed' : 'pointer',
                fontSize: 15, fontWeight: 700,
                boxShadow: photoConverting ? 'none' : editingId ? '0 8px 24px rgba(34,160,107,.25)' : 'var(--shadow-brand)',
              }}>
                {photoConverting ? '⏳' : editingId ? '💾 Сохранить' : '✅ Добавить'}
              </button>
              <button onClick={saveAndExportJSON} disabled={photoConverting}
                title="Сохранить и сразу скачать JSON с актуальными данными" style={{
                height: 50, padding: '0 14px', borderRadius: 14,
                background: photoConverting ? 'var(--c-bg-mute)' : 'var(--c-bg-dark)',
                color: photoConverting ? 'var(--c-text-dim)' : '#fff',
                border: 'none', cursor: photoConverting ? 'not-allowed' : 'pointer',
                fontSize: 13, fontWeight: 600,
              }}>
                📥 JSON
              </button>
              <button onClick={saveAndExportZIP} disabled={photoConverting}
                title="Сохранить и сразу скачать ZIP с фото, звуками и JSON" style={{
                height: 50, padding: '0 14px', borderRadius: 14,
                background: photoConverting ? 'var(--c-bg-mute)' : '#1a1a2e',
                color: photoConverting ? 'var(--c-text-dim)' : '#fff',
                border: 'none', cursor: photoConverting ? 'not-allowed' : 'pointer',
                fontSize: 13, fontWeight: 600,
              }}>
                📦 ZIP
              </button>
            </div>
          </div>
        </div>

        {/* ═══ ПРАВАЯ КОЛОНКА: ЭКСПОРТ + СПИСОК ═══ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Экспорт всего */}
          <div style={card}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--c-text-strong)', marginBottom: 12 }}>
              📦 Экспорт всех данных
            </h2>
            <p style={{ fontSize: 13, color: 'var(--c-text-muted)', marginBottom: 16, lineHeight: 1.5 }}>
              Для коммита в проект. Распакуйте, затем:
            </p>
            <pre style={{
              background: 'var(--c-bg-dark)', color: '#a5f3a0', padding: 14,
              borderRadius: 10, fontSize: 13, lineHeight: 1.6, marginBottom: 16, overflow: 'auto',
            }}>
{`git add .
git commit -m "обновлены животные"
git push`}
            </pre>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={exportZIP} style={{
                flex: 1, height: 44, borderRadius: 12, background: 'var(--c-brand)',
                color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700,
              }}>📥 Скачать ZIP</button>
              <button onClick={exportJSON} style={{
                height: 44, padding: '0 20px', borderRadius: 12,
                background: 'var(--c-bg-soft)', color: 'var(--c-text-strong)',
                border: '1px solid var(--c-border)', cursor: 'pointer', fontSize: 14, fontWeight: 600,
              }}>JSON</button>
            </div>
            {exportStatus && (
              <div style={{ marginTop: 8, fontSize: 14, fontWeight: 600, color: 'var(--c-brand)' }}>
                {exportStatus}
              </div>
            )}
          </div>

          {/* Список животных */}
          <div style={{ ...card, flex: 1, overflow: 'auto', maxHeight: 600 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--c-text-strong)', marginBottom: 12 }}>
              📋 Все животные ({animals.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {animals.map(a => (
                <div key={a.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', borderRadius: 12,
                  background: editingId === a.id ? 'var(--c-brand-soft)' : 'var(--c-bg-soft)',
                  border: editingId === a.id ? '1px solid var(--c-brand)' : '1px solid transparent',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--c-text-strong)' }}>
                      {a.name}
                      {a.silent && <span style={{ marginLeft: 6, fontSize: 12, opacity: 0.5 }}>🔇</span>}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--c-text-dim)' }}>
                      {a.animalClass} · {a.categories.map(c => categories.find(cat => cat.id === c)?.emoji).join(' ')} · {a.sounds.length} звук(ов)
                    </div>
                  </div>
                  <button onClick={() => startEdit(a)} title="Редактировать" style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 14,
                  }}>✏️</button>
                  <button onClick={() => removeAnimal(a.id)} title="Удалить" style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 14, color: 'var(--c-text-dim)',
                  }}>✕</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}