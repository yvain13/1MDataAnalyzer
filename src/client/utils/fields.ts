export function value(field: any): string {
  if (!field) return ''
  if (typeof field === 'object') return field.value ?? ''
  return String(field)
}

export function display(field: any): string {
  if (!field) return ''
  if (typeof field === 'object') return field.display_value ?? field.value ?? ''
  return String(field)
}
