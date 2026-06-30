import { initialForm } from './constants'
import type { Form } from './types'

function detectDelimiter(line: string): string {
  const semis = (line.match(/;/g) ?? []).length
  const commas = (line.match(/,/g) ?? []).length
  return semis > commas ? ';' : ','
}

function parseLine(line: string, delimiter: string): string[] {
  if (delimiter === ';') return line.split(';').map(v => v.trim())
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (const ch of line) {
    if (ch === '"') { inQuotes = !inQuotes }
    else if (ch === ',' && !inQuotes) { result.push(current.trim()); current = '' }
    else { current += ch }
  }
  result.push(current.trim())
  return result
}

function extractKey(header: string): string {
  return header.toLowerCase().split(/[\s(]/)[0].trim()
}

function mapRow(headers: string[], values: string[]): Form {
  const row: Record<string, string> = { ...initialForm }
  headers.forEach((h, i) => {
    const key = extractKey(h)
    const val = (values[i] ?? '').trim()
    if (key === 'gender') {
      const v = val.toLowerCase()
      row.gender = (v === 'female' || v === 'f' || v === '1') ? '1' : '0'
    } else if (key === 'is_smoker' || key === 'smoker') {
      const v = val.toLowerCase()
      row.is_smoker = (v === '1' || v === 'yes' || v === 'true' || v === 'smoker') ? '1' : '0'
    } else if (key in initialForm) {
      row[key] = val
    }
  })
  return row as Form
}

export const CsvService = {
  parseFile(file: File): Promise<Form[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.onload = (e) => {
        const text = (e.target?.result as string) ?? ''
        const lines = text.split(/\r?\n/).filter(l => l.trim())
        if (lines.length < 2) {
          reject(new Error('CSV must have a header row and at least one data row'))
          return
        }
        const delim = detectDelimiter(lines[0])
        const headers = parseLine(lines[0], delim)
        const rows = lines.slice(1).map(line => mapRow(headers, parseLine(line, delim)))
        resolve(rows)
      }
      reader.readAsText(file)
    })
  },
}
