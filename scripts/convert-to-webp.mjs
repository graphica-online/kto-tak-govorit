import sharp from 'sharp'
import { readdir, stat } from 'fs/promises'
import { join, parse } from 'path'

const PHOTOS_DIR = 'public/photos'
const TARGET_WIDTH = 1280
const QUALITY = 82

async function convert() {
  let files
  try {
    files = await readdir(PHOTOS_DIR)
  } catch {
    console.error(`❌ Папка ${PHOTOS_DIR} не найдена. Создайте её и положите туда .jpg файлы.`)
    process.exit(1)
  }

  const images = files.filter(f => /\.(jpg|jpeg|png)$/i.test(f))

  if (images.length === 0) {
    console.log('⚠️  Нет .jpg/.png файлов в public/photos/')
    return
  }

  console.log(`\n🖼️  Найдено ${images.length} изображений\n`)

  let converted = 0
  let skipped = 0

  for (const file of images) {
    const inputPath = join(PHOTOS_DIR, file)
    const { name } = parse(file)
    const outputPath = join(PHOTOS_DIR, `${name}.webp`)

    // Проверяем есть ли уже webp
    try {
      await stat(outputPath)
      console.log(`  ⏭  ${name}.webp уже существует — пропускаю`)
      skipped++
      continue
    } catch {
      // файла нет — конвертируем
    }

    try {
      const info = await sharp(inputPath)
        .resize(TARGET_WIDTH, null, { withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toFile(outputPath)

      const sizeKB = (info.size / 1024).toFixed(1)
      console.log(`  ✅ ${name}.webp — ${info.width}×${info.height}, ${sizeKB} КБ`)
      converted++
    } catch (err) {
      console.error(`  ❌ ${file}: ${err.message}`)
    }
  }

  console.log(`\n📊 Итого: ${converted} сконвертировано, ${skipped} пропущено\n`)
}

convert()