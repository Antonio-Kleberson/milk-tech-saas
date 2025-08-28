const KEY = "milktech:milk_production";

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}
function write(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

// normaliza registros antigos sem "shift"
function normalize(items) {
  return items.map((x) => ({ ...x, shift: x.shift || "morning" }));
}
function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function sameDay(a, b) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

export const milkProduction = {
  list(ownerId, { from, to } = {}) {
    let all = normalize(read()).filter((x) => x.owner_id === ownerId);
    if (from) all = all.filter((x) => startOfDay(x.date) >= startOfDay(from));
    if (to) all = all.filter((x) => startOfDay(x.date) <= startOfDay(to));
    // ordenar por data desc; manhã antes de tarde p/ consistência
    return all.sort((a, b) => {
      const d = new Date(b.date) - new Date(a.date);
      if (d !== 0) return d;
      return a.shift.localeCompare(b.shift);
    });
  },

  // upsert por (ownerId, date, shift)
  // dto: { date:'YYYY-MM-DD', shift:'morning'|'afternoon', liters, dairy_type, dairy_id, unit_price_at_sale?, notes? }
  createOrUpdate(ownerId, dto) {
    const data = normalize(read());
    const idx = data.findIndex(
      (x) => x.owner_id === ownerId && sameDay(x.date, dto.date) && x.shift === dto.shift,
    );

    if (idx >= 0) {
      const next = {
        ...data[idx],
        liters: Number(dto.liters),
        dairy_type: dto.dairy_type,
        dairy_id: dto.dairy_id,
        notes: dto.notes || "",
        ...(dto.unit_price_at_sale != null
          ? { unit_price_at_sale: Number(dto.unit_price_at_sale) }
          : {}),
        date: dto.date, // permite corrigir o dia
        updated_at: new Date().toISOString(),
      };
      data[idx] = next;
      write(data);
      return next;
    }

    const item = {
      id: Date.now().toString(),
      owner_id: ownerId,
      date: dto.date, // YYYY-MM-DD
      shift: dto.shift, // 'morning' | 'afternoon'
      liters: Number(dto.liters),
      dairy_type: dto.dairy_type, // 'official' | 'mine'
      dairy_id: dto.dairy_id,
      unit_price_at_sale: dto.unit_price_at_sale != null ? Number(dto.unit_price_at_sale) : null,
      notes: dto.notes || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    data.push(item);
    write(data);
    return item;
  },

  update(id, dto) {
    const data = normalize(read());
    const idx = data.findIndex((x) => x.id === id);
    if (idx === -1) return null;

    const next = {
      ...data[idx],
      ...(dto.date != null ? { date: dto.date } : {}),
      ...(dto.shift ? { shift: dto.shift } : {}),
      ...(dto.liters != null ? { liters: Number(dto.liters) } : {}),
      ...(dto.dairy_type ? { dairy_type: dto.dairy_type } : {}),
      ...(dto.dairy_id ? { dairy_id: dto.dairy_id } : {}),
      ...(dto.unit_price_at_sale != null
        ? { unit_price_at_sale: Number(dto.unit_price_at_sale) }
        : {}),
      ...(dto.notes != null ? { notes: dto.notes } : {}),
      updated_at: new Date().toISOString(),
    };

    // garantir unicidade caso tenha mudado (date/shift)
    const conflictIdx = data.findIndex(
      (x, i) =>
        i !== idx &&
        x.owner_id === next.owner_id &&
        sameDay(x.date, next.date) &&
        x.shift === next.shift,
    );
    if (conflictIdx >= 0) {
      data[conflictIdx] = { ...next, id: data[conflictIdx].id };
      data.splice(idx, 1);
    } else {
      data[idx] = next;
    }

    write(data);
    return next;
  },

  remove(id) {
    const next = read().filter((x) => x.id !== id);
    write(next);
  },

  // soma simples do mês (litros)
  sumMonth(ownerId, year, month) {
    const from = new Date(year, month - 1, 1);
    const to = new Date(year, month, 0);
    return this.list(ownerId, { from, to }).reduce((s, x) => s + Number(x.liters || 0), 0);
  },

  // soma por turno no mês (litros)
  sumMonthByShift(ownerId, year, month) {
    const from = new Date(year, month - 1, 1);
    const to = new Date(year, month, 0);
    const list = this.list(ownerId, { from, to });
    const morning = list
      .filter((x) => x.shift === "morning")
      .reduce((s, x) => s + Number(x.liters || 0), 0);
    const afternoon = list
      .filter((x) => x.shift === "afternoon")
      .reduce((s, x) => s + Number(x.liters || 0), 0);
    return { morning, afternoon, total: morning + afternoon };
  },

  // agrupado por dia: { date (YYYY-MM-DD), manha, tarde, total, bruto, items }
  aggregateByDay(ownerId, { from, to } = {}) {
    const map = new Map();
    this.list(ownerId, { from, to }).forEach((x) => {
      // guarda como YYYY-MM-DD para não ter problema de fuso
      const key = typeof x.date === "string" ? x.date : new Date(x.date).toISOString().slice(0, 10);
      if (!map.has(key)) {
        map.set(key, { date: key, manha: 0, tarde: 0, total: 0, bruto: 0, items: [] });
      }
      const acc = map.get(key);
      acc.items.push(x);
      if (x.shift === "morning") acc.manha += Number(x.liters || 0);
      if (x.shift === "afternoon") acc.tarde += Number(x.liters || 0);
      const price = Number(x.unit_price_at_sale || 0);
      acc.bruto += Number(x.liters || 0) * price;
      acc.total = acc.manha + acc.tarde;
    });
    // ordena por string YYYY-MM-DD (estável e correto)
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  },

  // totais do mês (litros e bruto)
  totalsForMonth(ownerId, jsDate = new Date()) {
    const from = new Date(jsDate.getFullYear(), jsDate.getMonth(), 1);
    const to = new Date(jsDate.getFullYear(), jsDate.getMonth() + 1, 0);
    const days = this.aggregateByDay(ownerId, { from, to });
    return days.reduce(
      (acc, d) => {
        acc.manha += d.manha;
        acc.tarde += d.tarde;
        acc.total += d.total;
        acc.bruto += d.bruto;
        return acc;
      },
      { manha: 0, tarde: 0, total: 0, bruto: 0 },
    );
  },
};
