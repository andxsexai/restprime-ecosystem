import JSZip from 'jszip'
import * as XLSX from 'xlsx'
import { insightFromRows, insightFromText } from './view.js'

export async function readUpload(file, placeName) {
  const ext = file.name.split('.').pop().toLowerCase()
  if (['xlsx', 'xls', 'csv'].includes(ext)) {
    const book = XLSX.read(await file.arrayBuffer(), { type: 'array' })
    const sheet = book.Sheets[book.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })
    const { dishes, insight } = insightFromRows(rows, placeName)
    return { name: file.name, kind: 'Excel', dishes, insight }
  }
  if (ext === 'docx') {
    const zip = await JSZip.loadAsync(await file.arrayBuffer())
    const xml = await zip.file('word/document.xml')?.async('string')
    if (!xml) throw new Error(`В ${file.name} нет текста документа`)
    const text = xml.replace(/<w:p[^>]*>/g, '\n').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    const parsed = insightFromText(text, file.name, placeName)
    return { name: file.name, kind: 'Word', ...parsed }
  }
  if (ext === 'pdf') {
    const raw = new TextDecoder('latin1').decode(await file.arrayBuffer())
    const text = [...raw.matchAll(/\(([^()\\\r\n]{3,})\)/g)].map((match) => match[1]).join(' ')
    const parsed = insightFromText(text, file.name, placeName)
    return { name: file.name, kind: 'PDF', ...parsed }
  }
  throw new Error('Нужен файл .docx, .xlsx или .pdf')
}
