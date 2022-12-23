import urlencode from 'urlencode3'

export const extractEmails = (text: string) => {
  const emails = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi)
  if (!emails) return [text]

  return emails.map((email) => email)
}

export const extractTagsA = (text: string) => {
  const links = text.match(/<a\b[^>]*>(.*?)<\/a>/gi)
  if (!links) return [text]

  return links.map((link) => link)
}

export const extractTextBetweenSquareBrackets = (text: string) => {
  if(!text.includes('[') && !text.includes(']')) return []

  const squareBrackets = text.match(/\[(.*?)\]/gi)

  const links = !squareBrackets ?
    [text] :
    squareBrackets.map((squareBracket) => squareBracket)

  return links.map((link) => urlencode.decode(link?.replace(/\[/g, '').replace(/\]/g, '')))
}