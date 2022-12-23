import { convert } from 'html-to-text'

export const convertHtmlToText = (html: string) => {
  if (!html) return ''

  // Convert html to text
  const text = convert(html, {
    preserveNewlines: true,
    selectors       : [
      { format: 'skip', selector: 'img'},
      { format: 'skip', selector: 'br'}
    ]
  })

  // Remove character spacial
  const textLexical = text.replace(new RegExp('-', 'g'), '')
    .replace(new RegExp('_', 'g'), '')
    .replace(new RegExp('>', 'g'), '')
    // eslint-disable-next-line no-control-regex
    .replace(new RegExp('\r?\n', 'g'), ' ')
    .split(' ')
    .filter(Boolean)
    .join(' ')

  return textLexical
}