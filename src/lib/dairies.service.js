// src/lib/dairies.service.js
const KEY_MY_DAIRIES = 'milktech:my_dairies';
const KEY_MY_DAIRY_PRICES = (id) => `milktech:my_dairy_prices:${id}`;

const sameDay = (a, b) => {
  const da = new Date(a), db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
};

function read(key, fallback = '[]') {
  try { return JSON.parse(localStorage.getItem(key) || fallback); }
  catch { return JSON.parse(fallback); }
}
function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Aceita "YYYY-MM-DD" do <input type="date" /> e converte para ISO,
// ou reaproveita um ISO já válido.
function normalizeDateMaybeISO(d) {
  if (!d) return new Date().toISOString();
  // se vier no formato "YYYY-MM-DD", cria Date local e exporta ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
    const [y, m, day] = d.split('-').map(Number);
    const dt = new Date(y, m - 1, day, 12, 0, 0); // 12:00 para evitar fuso virar dia anterior
    return dt.toISOString();
  }
  // senão, tenta passar direto
  const maybe = new Date(d);
  return isNaN(maybe.getTime()) ? new Date().toISOString() : maybe.toISOString();
}

export const dairiesService = {
  // --------- Laticínios pessoais
  listMyDairies(ownerId) {
    return read(KEY_MY_DAIRIES).filter(d => d.owner_id === ownerId);
  },

  createMyDairy(ownerId, dto) {
    const all = read(KEY_MY_DAIRIES);
    const now = new Date().toISOString();
    const newDairy = {
      id: Date.now().toString(),
      owner_id: ownerId,
      // básicos
      name: dto.name?.trim(),
      cnpj: dto.cnpj?.trim() || '',
      phone: dto.phone?.trim() || '',
      responsavel: dto.responsavel?.trim() || '',
      // endereço (opcional)
      address: dto.address?.trim() || '',
      city: dto.city?.trim() || '',
      state: dto.state?.trim()?.toUpperCase() || '',
      created_at: now,
      updated_at: now,
    };
    all.push(newDairy);
    write(KEY_MY_DAIRIES, all);
    return newDairy;
  },

  updateMyDairy(id, dto) {
    const all = read(KEY_MY_DAIRIES);
    const updated = all.map(d =>
      d.id === id
        ? {
            ...d,
            ...(dto.name != null ? { name: dto.name.trim() } : {}),
            ...(dto.cnpj != null ? { cnpj: dto.cnpj.trim() } : {}),
            ...(dto.phone != null ? { phone: dto.phone.trim() } : {}),
            ...(dto.responsavel != null ? { responsavel: dto.responsavel.trim() } : {}),
            ...(dto.address != null ? { address: dto.address.trim() } : {}),
            ...(dto.city != null ? { city: dto.city.trim() } : {}),
            ...(dto.state != null ? { state: dto.state.trim().toUpperCase() } : {}),
            updated_at: new Date().toISOString(),
          }
        : d
    );
    write(KEY_MY_DAIRIES, updated);
    return updated.find(d => d.id === id);
  },

  deleteMyDairy(id) {
    const all = read(KEY_MY_DAIRIES).filter(d => d.id !== id);
    write(KEY_MY_DAIRIES, all);
    // também remove histórico de preços
    localStorage.removeItem(KEY_MY_DAIRY_PRICES(id));
  },

  // --------- Preços pessoais
  listMyDairyPrices(dairyId) {
    return read(KEY_MY_DAIRY_PRICES(dairyId));
  },

  addMyDairyPrice(dairyId, { price, date }) {
    const prices = read(KEY_MY_DAIRY_PRICES(dairyId));
    const eff = normalizeDateMaybeISO(date);

    // se já existir um preço na MESMA DATA, atualiza em vez de criar outro
    const idxSame = prices.findIndex(p => sameDay(p.effective_at, eff));
    const entry = {
      id: idxSame >= 0 ? prices[idxSame].id : Date.now().toString(),
      dairy_id: dairyId,
      price_per_liter: Number(price),
      effective_at: eff,
      created_at: idxSame >= 0 ? prices[idxSame].created_at : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (idxSame >= 0) prices[idxSame] = entry;
    else prices.push(entry);

    prices.sort((a, b) => new Date(b.effective_at) - new Date(a.effective_at));
    write(KEY_MY_DAIRY_PRICES(dairyId), prices);
    return entry;
  },

  updateMyDairyPrice(dairyId, priceId, payload) {
    const prices = read(KEY_MY_DAIRY_PRICES(dairyId));
    const idx = prices.findIndex(p => p.id === priceId);
    if (idx === -1) return null;

    const next = {
      ...prices[idx],
      ...(payload.price != null ? { price_per_liter: Number(payload.price) } : {}),
      ...(payload.date ? { effective_at: normalizeDateMaybeISO(payload.date) } : {}),
      updated_at: new Date().toISOString(),
    };

    prices[idx] = next;
    prices.sort((a, b) => new Date(b.effective_at) - new Date(a.effective_at));
    write(KEY_MY_DAIRY_PRICES(dairyId), prices);
    return next;
  },

  deleteMyDairyPrice(dairyId, priceId) {
    const prices = read(KEY_MY_DAIRY_PRICES(dairyId)).filter(p => p.id !== priceId);
    write(KEY_MY_DAIRY_PRICES(dairyId), prices);
  },

  // --------- Stub de “match” com oficiais (futuro)
  findMatchesWithOfficial(/* ownerId */) {
    return []; // mock por enquanto
  },
};
