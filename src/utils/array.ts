export const keyBy = <T>(arr: T[], key: string) => arr.reduce((acc: Record<string, T>, el: T) => {
  acc[String((el as Record<string, unknown>)[key])] = el

  return acc
}, {} as Record<string, T>)