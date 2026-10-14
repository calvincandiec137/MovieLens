export function parseCsv(text) {
  const clean = text.replace(/^\uFEFF/, '').trim()
  if (!clean) return []

  const rows = []
  let currentRow = []
  let currentField = ''
  let insideQuotes = false

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i]
    const nextChar = clean[i + 1]

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"'
        i++
      } else {
        insideQuotes = !insideQuotes
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentField.trim())
      currentField = ''
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++
      }
      currentRow.push(currentField.trim())
      if (currentRow.length > 0 && currentRow.some(f => f !== '')) {
        rows.push(currentRow)
      }
      currentRow = []
      currentField = ''
    } else {
      currentField += char
    }
  }

  if (currentField !== '' || currentRow.length > 0) {
    currentRow.push(currentField.trim())
    if (currentRow.some(f => f !== '')) {
      rows.push(currentRow)
    }
  }

  if (rows.length < 2) return []

  const headers = rows[0].map(h => h.toLowerCase())
  return rows.slice(1).map(row => {
    const item = {}
    headers.forEach((header, idx) => {
      item[header] = row[idx] !== undefined ? row[idx] : ''
    })
    return item
  })
}
