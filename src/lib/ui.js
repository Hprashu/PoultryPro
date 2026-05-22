export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function getInitials(name = 'Farmer') {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function formatCompactNumber(value = 0) {
  return new Intl.NumberFormat('en', {
    notation: Math.abs(value) >= 10000 ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(value)
}
