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

// gera ID único seguro
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// valida e converte número
function safeNumber(value) {
  const num = Number(value);
  return isNaN(num) || !isFinite(num) ? 0 : Math.max(0, num);
}

// garante formato YYYY-MM-DD
function normalizeDate(date) {
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }
  if (date instanceof Date) {
    return date.toISOString().split("T")[0];
  }
  return new Date().toISOString().split("T")[0]; // fallback = hoje
}

// compara datas como strings YYYY-MM-DD
function isSameDate(dateA, dateB) {
  return normalizeDate(dateA) === normalizeDate(dateB);
}

export const milkProduction = {
  list(ownerId, { from, to } = {}) {
    let all = normalize(read()).filter((x) => x.owner_id === ownerId);

    if (from) {
      const fromStr = normalizeDate(from);
      all = all.filter((x) => normalizeDate(x.date) >= fromStr);
    }
    if (to) {
      const toStr = normalizeDate(to);
      all = all.filter((x) => normalizeDate(x.date) <= toStr);
    }

    return all.sort((a, b) => {
      const dateCompare = normalizeDate(b.date).localeCompare(normalizeDate(a.date));
      if (dateCompare !== 0) return dateCompare;
      return a.shift.localeCompare(b.shift); // manhã antes da tarde
    });
  },

  createOrUpdate(ownerId, dto) {
    if (!ownerId || !dto.date || !dto.shift) {
      throw new Error("ownerId, date e shift são obrigatórios");
    }

    const data = normalize(read());
    const normalizedDate = normalizeDate(dto.date);

    const idx = data.findIndex(
      (x) =>
        x.owner_id === ownerId &&
        isSameDate(x.date, normalizedDate) &&
        x.shift === dto.shift
    );

    if (idx >= 0) {
      const next = {
        ...data[idx],
        liters: safeNumber(dto.liters),
        dairy_type: dto.dairy_type,
        dairy_id: dto.dairy_id,
        notes: dto.notes || "",
        date: normalizedDate,
        updated_at: new Date().toISOString(),
      };
      if (dto.unit_price_at_sale != null) {
        next.unit_price_at_sale = safeNumber(dto.unit_price_at_sale);
      }
      data[idx] = next;
      write(data);
      return next;
    }

    const item = {
      id: generateId(),
      owner_id: ownerId,
      date: normalizedDate,
      shift: dto.shift,
      liters: safeNumber(dto.liters),
      dairy_type: dto.dairy_type,
      dairy_id: dto.dairy_id,
      unit_price_at_sale:
        dto.unit_price_at_sale != null ? safeNumber(dto.unit_price_at_sale) : null,
      notes: dto.notes || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    data.push(item);
    write(data);
    return item;
  },

  update(id, dto) {
    if (!id) return null;

    const data = normalize(read());
    const idx = data.findIndex((x) => x.id === id);
    if (idx === -1) return null;

    const current = data[idx];
    const next = {
      ...current,
      updated_at: new Date().toISOString(),
    };

    if (dto.date != null) next.date = normalizeDate(dto.date);
    if (dto.shift && ["morning", "afternoon"].includes(dto.shift))
      next.shift = dto.shift;
    if (dto.liters != null) next.liters = safeNumber(dto.liters);
    if (dto.dairy_type) next.dairy_type = dto.dairy_type;
    if (dto.dairy_id != null) next.dairy_id = dto.dairy_id;
    if (dto.unit_price_at_sale != null)
      next.unit_price_at_sale = safeNumber(dto.unit_price_at_sale);
    if (dto.notes != null) next.notes = dto.notes;

    // se mudou date/shift -> checar conflito
    const conflictIdx = data.findIndex(
      (x, i) =>
        i !== idx &&
        x.owner_id === next.owner_id &&
        isSameDate(x.date, next.date) &&
        x.shift === next.shift
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
    const data = read();
    const next = data.filter((x) => x.id !== id);
    write(next);
    return data.length !== next.length;
  },

  sumMonth(ownerId, year, month) {
    const from = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const to = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    return this.list(ownerId, { from, to }).reduce((s, x) => s + safeNumber(x.liters), 0);
  },

  sumMonthByShift(ownerId, year, month) {
    const from = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const to = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    const list = this.list(ownerId, { from, to });
    const morning = list
      .filter((x) => x.shift === "morning")
      .reduce((s, x) => s + safeNumber(x.liters), 0);
    const afternoon = list
      .filter((x) => x.shift === "afternoon")
      .reduce((s, x) => s + safeNumber(x.liters), 0);
    return { morning, afternoon, total: morning + afternoon };
  },

  aggregateByDay(ownerId, { from, to } = {}) {
    const map = new Map();
    this.list(ownerId, { from, to }).forEach((x) => {
      const key = normalizeDate(x.date);
      if (!map.has(key)) {
        map.set(key, { date: key, manha: 0, tarde: 0, total: 0, bruto: 0, items: [] });
      }
      const acc = map.get(key);
      acc.items.push(x);
      const liters = safeNumber(x.liters);
      const price = safeNumber(x.unit_price_at_sale);
      if (x.shift === "morning") acc.manha += liters;
      if (x.shift === "afternoon") acc.tarde += liters;
      acc.bruto += liters * price;
      acc.total = acc.manha + acc.tarde;
    });
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  },

  totalsForMonth(ownerId, jsDate = new Date()) {
    const year = jsDate.getFullYear();
    const month = jsDate.getMonth() + 1;
    const from = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const to = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    const days = this.aggregateByDay(ownerId, { from, to });
    return days.reduce(
      (acc, d) => {
        acc.manha += d.manha;
        acc.tarde += d.tarde;
        acc.total += d.total;
        acc.bruto += d.bruto;
        return acc;
      },
      { manha: 0, tarde: 0, total: 0, bruto: 0 }
    );
  },
};