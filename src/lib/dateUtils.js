// src/lib/dateUtils.js

// valida se é uma string YYYY-MM-DD válida
const isValidDateString = (str) => {
  return typeof str === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(str);
};

// converte qualquer input para YYYY-MM-DD string
const normalizeToDateString = (input) => {
  if (isValidDateString(input)) {
    return input;
  }
  
  if (input instanceof Date && !isNaN(input.getTime())) {
    return input.toISOString().split('T')[0];
  }
  
  if (typeof input === 'string') {
    const d = new Date(input);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
  }
  
  return null;
};

// hoje como YYYY-MM-DD
export const today = () => {
  return new Date().toISOString().split('T')[0];
};

// formata YYYY-MM-DD para dd/mm/aaaa (sempre consistente)
export const formatDate = (dateString, format = 'dd/mm/yyyy') => {
  if (!dateString) return "N/A";
  
  const normalized = normalizeToDateString(dateString);
  if (!normalized) return "Data inválida";
  
  const [year, month, day] = normalized.split('-');
  
  switch (format) {
    case 'dd/mm/yyyy':
      return `${day}/${month}/${year}`;
    case 'dd/mm':
      return `${day}/${month}`;
    case 'mm/yyyy':
      return `${month}/${year}`;
    default:
      return normalized; // retorna YYYY-MM-DD
  }
};

// calcula idade em meses baseado em strings YYYY-MM-DD
export const ageInMonths = (birthDateString) => {
  const birthStr = normalizeToDateString(birthDateString);
  const todayStr = today();
  
  if (!birthStr) return null;
  
  const [birthYear, birthMonth, birthDay] = birthStr.split('-').map(Number);
  const [todayYear, todayMonth, todayDay] = todayStr.split('-').map(Number);
  
  let months = (todayYear - birthYear) * 12 + (todayMonth - birthMonth);
  
  // ajuste pelo dia do mês
  if (todayDay < birthDay) {
    months -= 1;
  }
  
  return Math.max(months, 0);
};

// calcula idade formatada
export const calculateAge = (birthDateString) => {
  if (!birthDateString) return "Idade desconhecida";
  
  const months = ageInMonths(birthDateString);
  if (months === null) return "Data de nascimento inválida";
  
  if (months < 12) {
    return `${months} ${months === 1 ? "mês" : "meses"}`;
  }
  
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  let result = `${years} ${years === 1 ? "ano" : "anos"}`;
  if (remainingMonths > 0) {
    result += ` e ${remainingMonths} ${remainingMonths === 1 ? "mês" : "meses"}`;
  }
  
  return result;
};

// meses entre duas datas
export const monthsBetween = (fromDateString, toDateString = null) => {
  const fromStr = normalizeToDateString(fromDateString);
  const toStr = toDateString ? normalizeToDateString(toDateString) : today();
  
  if (!fromStr || !toStr) return null;
  
  const [fromYear, fromMonth, fromDay] = fromStr.split('-').map(Number);
  const [toYear, toMonth, toDay] = toStr.split('-').map(Number);
  
  let months = (toYear - fromYear) * 12 + (toMonth - fromMonth);
  
  if (toDay < fromDay) {
    months -= 1;
  }
  
  return months;
};

// adiciona dias a uma data YYYY-MM-DD
export const addDays = (dateString, days) => {
  const normalized = normalizeToDateString(dateString);
  if (!normalized || !Number.isFinite(days)) return null;
  
  const date = new Date(normalized + 'T00:00:00.000Z');
  date.setUTCDate(date.getUTCDate() + Number(days));
  
  return date.toISOString().split('T')[0];
};

// subtrai dias de uma data YYYY-MM-DD
export const subtractDays = (dateString, days) => {
  return addDays(dateString, -days);
};

// converte para YYYY-MM-DD (alias para compatibilidade)
export const toISODate = (dateInput) => {
  return normalizeToDateString(dateInput);
};

// quantos dias atrás foi uma data
export const getDaysAgo = (dateString) => {
  const targetStr = normalizeToDateString(dateString);
  const todayStr = today();
  
  if (!targetStr) return null;
  
  const targetDate = new Date(targetStr + 'T00:00:00.000Z');
  const todayDate = new Date(todayStr + 'T00:00:00.000Z');
  
  const diffMs = todayDate.getTime() - targetDate.getTime();
  return Math.floor(diffMs / (24 * 60 * 60 * 1000));
};

// quantos dias até uma data
export const getDaysUntil = (dateString) => {
  const targetStr = normalizeToDateString(dateString);
  const todayStr = today();
  
  if (!targetStr) return null;
  
  const targetDate = new Date(targetStr + 'T00:00:00.000Z');
  const todayDate = new Date(todayStr + 'T00:00:00.000Z');
  
  const diffMs = targetDate.getTime() - todayDate.getTime();
  return Math.ceil(diffMs / (24 * 60 * 60 * 1000));
};

// verifica se uma data é hoje
export const isToday = (dateString) => {
  const normalized = normalizeToDateString(dateString);
  return normalized === today();
};

// verifica se uma data é no passado
export const isPast = (dateString) => {
  const days = getDaysAgo(dateString);
  return days !== null && days > 0;
};

// verifica se uma data é no futuro
export const isFuture = (dateString) => {
  const days = getDaysUntil(dateString);
  return days !== null && days > 0;
};

// compara duas datas YYYY-MM-DD (-1, 0, 1)
export const compareDates = (dateA, dateB) => {
  const a = normalizeToDateString(dateA);
  const b = normalizeToDateString(dateB);
  
  if (!a || !b) return 0;
  
  return a.localeCompare(b);
};

// helper para validação de inputs de data
export const isValidDate = (dateString) => {
  return normalizeToDateString(dateString) !== null;
};