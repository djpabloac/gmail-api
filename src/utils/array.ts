export const keyBy = <T>(arr: T[], key: string) => arr.reduce((acc: Record<string, T>, el: any) => {
  acc[el[key]] = el

  return acc
}, {})