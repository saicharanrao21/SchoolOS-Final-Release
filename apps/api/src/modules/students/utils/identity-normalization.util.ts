export function normalizeName(name: string): string {
  if (!name) return '';
  return name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

export function normalizePhone(phone: string): string {
  if (!phone) return '';
  return phone.replace(/[^0-9]/g, '');
}

export function normalizeEmail(email: string): string {
  if (!email) return '';
  return email.trim().toLowerCase();
}
