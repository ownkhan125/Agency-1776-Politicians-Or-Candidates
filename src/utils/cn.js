export const cn = (...inputs) =>
  inputs
    .flat(Infinity)
    .filter((v) => typeof v === 'string' && v.length > 0)
    .join(' ')
