import urlencode from 'urlencode3'

export const urlParse = (url: string) => {
  if(!url) return { location: url, query: [] }

  const linkSplit = url.split('?')

  const location = linkSplit[0]
  const search = linkSplit.length > 1 ? urlencode.decode(linkSplit[1]) : ''

  const query = search
    .split('&')
    .filter(Boolean)
    .map((q) => {
      const params = q.split('=')
      const [key] = params
      const value = params.filter((param) => param !== key).join('=')

      return {
        key,
        value
      }
    })

  return {
    location,
    query
  }
}

export const matchPath = <T>(pathName: string, path: string): T | null => {
  if (!pathName || !path) return null

  const pathNames = pathName.split('/')
  const paths = path.split('/')

  const initParams = <Record<string, string>>{}
  const params = paths
    .map((path, index) => ({ key: path, value: pathNames[index] }))
    .filter(({ key }) => Boolean(key) && key.includes(':'))
    .reduce((prev, next) => ({ ...prev, [next.key.replace(':', '')]: next.value }), initParams)

  return params as T
}