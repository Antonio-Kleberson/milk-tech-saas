// src/lib/dateUtils.js
const safeDate = (input) => {
  const d = input instanceof Date ? input : new Date(input);
  return Number.isFinite(d.getTime()) ? d : null;
};

export const formatDate = (
  dateString,
  options = { day: '2-digit', month: '2-digit', year: 'numeric' }
) => {
  if (!dateString) return 'N/A';
  const d = safeDate(dateString);
  if (!d) return 'Data inválida';
  try {
    return d.toLocaleDateString('pt-BR', options);
  } catch {
    return 'Data inválida';
  }
};

export const ageInMonths = (birthDate) => {
  const b = safeDate(birthDate);
  if (!b) return null;
  const today = new Date();

  let months = (today.getFullYear() - b.getFullYear()) * 12 + (today.getMonth() - b.getMonth());
  // Ajuste pelo dia do mês (se ainda não “fez” o mês corrente)
  if (today.getDate() < b.getDate()) months -= 1;
  return Math.max(months, 0);
};

export const calculateAge = (birthDate) => {
  if (!birthDate) return 'Idade desconhecida';
  const b = safeDate(birthDate);
  if (!b) return 'Data de nascimento inválida';

  const m = ageInMonths(birthDate);
  if (m === null) return 'Idade desconhecida';
  if (m < 12) {
    return `${m} ${m === 1 ? 'mês' : 'meses'}`;
  }
  const years = Math.floor(m / 12);
  const rem = m % 12;
  return `${years} ${years === 1 ? 'ano' : 'anos'}${rem > 0 ? ` e ${rem} ${rem === 1 ? 'mês' : 'meses'}` : ''}`;
};

export const monthsBetween = (fromDate, toDate = new Date()) => {
  const a = safeDate(fromDate);
  const b = safeDate(toDate);
  if (!a || !b) return null;
  let months = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  if (b.getDate() < a.getDate()) months -= 1;
  return months;
};

export const startOfDay = (dateInput = new Date()) => {
  const d = safeDate(dateInput);
  if (!d) return null;
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

export const endOfDay = (dateInput = new Date()) => {
  const d = safeDate(dateInput);
  if (!d) return null;
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
};

export const addDays = (dateInput, days) => {
  const d = safeDate(dateInput);
  if (!d || !Number.isFinite(days)) return null;
  const x = new Date(d);
  x.setDate(x.getDate() + Number(days));
  return x;
};

export const toISODate = (dateInput = new Date()) => {
  const d = safeDate(dateInput);
  if (!d) return null;
  const x = startOfDay(d);
  // YYYY-MM-DD
  return x ? x.toISOString().slice(0, 10) : null;
};

export const getDaysAgo = (dateString) => {
  const target = startOfDay(dateString);
  const today = startOfDay(new Date());
  if (!target || !today) return null;
  const diffMs = today - target;
  return Math.floor(diffMs / 86400000);
};

export const getDaysUntil = (dateString) => {
  const target = startOfDay(dateString);
  const today = startOfDay(new Date());
  if (!target || !today) return null;
  const diffMs = target - today;
  return Math.ceil(diffMs / 86400000);
};
