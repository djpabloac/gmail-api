export const extractEmails = (text: string) => {
  const emails = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi)
  if (!emails) return [text]

  return emails.map((email) => email)
}