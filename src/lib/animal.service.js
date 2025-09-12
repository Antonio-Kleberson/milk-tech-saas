const KEY = "milktech:animals";

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

// Gerador de ID único
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Normaliza data para YYYY-MM-DD
function normalizeDate(input) {
  if (!input) return "";
  if (typeof input === "string" && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return input;
  }
  if (input instanceof Date && !isNaN(input.getTime())) {
    return input.toISOString().split("T")[0];
  }
  if (typeof input === "string") {
    const d = new Date(input);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split("T")[0];
    }
  }
  return "";
}

function normalize(a) {
  return {
    id: a.id,
    owner_id: a.owner_id,
    name: String(a.name || "").trim(),
    earring: String(a.earring || "").trim(),
    type: a.type || "vaca",
    breed: String(a.breed || "").trim(),
    status: a.status || "ativo",
    stage: String(a.stage || "").trim(),
    birth_date: normalizeDate(a.birth_date),
    dam_id: a.dam_id || "",
    sire_id: a.sire_id || "",
    notes: String(a.notes || "").trim(),
    created_at: a.created_at || new Date().toISOString(),
    updated_at: a.updated_at || new Date().toISOString(),
  };
}

export const animalService = {
  list(ownerId) {
    if (!ownerId) return [];
    
    return read()
      .filter((a) => a.owner_id === ownerId)
      .map(normalize)
      .sort((a, b) => a.name.localeCompare(b.name)); // ordenar por nome
  },

  get(id) {
    if (!id) return null;
    
    const a = read().find((x) => x.id === id);
    return a ? normalize(a) : null;
  },

  create(ownerId, dto) {
    // Validações básicas
    if (!ownerId) {
      throw new Error("ownerId é obrigatório");
    }
    if (!dto.name || !String(dto.name).trim()) {
      throw new Error("Nome do animal é obrigatório");
    }
    if (!dto.earring || !String(dto.earring).trim()) {
      throw new Error("Brinco é obrigatório");
    }

    const earring = String(dto.earring).trim();
    
    // Verificar se brinco é único
    if (!this.isEarringUnique(ownerId, earring)) {
      throw new Error(`Brinco "${earring}" já está em uso`);
    }

    // Validar status
    const validStatuses = ["ativo", "inativo", "transferido"];
    if (dto.status && !validStatuses.includes(dto.status)) {
      throw new Error(`Status deve ser: ${validStatuses.join(", ")}`);
    }

    // Validar tipo
    const validTypes = ["vaca", "touro", "bezerro", "bezerra", "novilho", "novilha"];
    if (dto.type && !validTypes.includes(dto.type)) {
      throw new Error(`Tipo deve ser: ${validTypes.join(", ")}`);
    }

    const data = read();
    const item = normalize({
      id: generateId(),
      owner_id: ownerId,
      ...dto,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    
    data.push(item);
    write(data);
    return item;
  },

  update(id, dto) {
    if (!id) return null;
    
    const data = read();
    const idx = data.findIndex((x) => x.id === id);
    if (idx === -1) return null;

    const current = data[idx];
    
    // Se está mudando o brinco, verificar unicidade
    if (dto.earring && String(dto.earring).trim() !== current.earring) {
      const newEarring = String(dto.earring).trim();
      if (!newEarring) {
        throw new Error("Brinco não pode ser vazio");
      }
      if (!this.isEarringUnique(current.owner_id, newEarring, id)) {
        throw new Error(`Brinco "${newEarring}" já está em uso`);
      }
    }

    // Validar status se fornecido
    if (dto.status) {
      const validStatuses = ["ativo", "inativo", "transferido"];
      if (!validStatuses.includes(dto.status)) {
        throw new Error(`Status deve ser: ${validStatuses.join(", ")}`);
      }
    }

    // Validar tipo se fornecido
    if (dto.type) {
      const validTypes = ["vaca", "touro", "bezerro", "bezerra", "novilho", "novilha"];
      if (!validTypes.includes(dto.type)) {
        throw new Error(`Tipo deve ser: ${validTypes.join(", ")}`);
      }
    }

    const next = normalize({
      ...current,
      ...dto,
      id: current.id, // não permitir mudança de ID
      owner_id: current.owner_id, // não permitir mudança de owner
      updated_at: new Date().toISOString(),
    });
    
    data[idx] = next;
    write(data);
    return next;
  },

  remove(id) {
    if (!id) return false;
    
    const data = read();
    const filtered = data.filter((x) => x.id !== id);
    
    if (filtered.length === data.length) {
      return false; // não encontrou o animal
    }
    
    write(filtered);
    return true;
  },

  isEarringUnique(ownerId, earring, ignoreId = null) {
    if (!ownerId || !earring) return false;
    
    const normalizedEarring = String(earring).trim();
    if (!normalizedEarring) return false;
    
    return !read().some(
      (a) =>
        a.owner_id === ownerId &&
        String(a.earring || "").trim().toLowerCase() === normalizedEarring.toLowerCase() &&
        a.id !== ignoreId
    );
  },

  // Métodos auxiliares úteis
  
  /** Lista animais ativos apenas */
  listActive(ownerId) {
    return this.list(ownerId).filter((a) => a.status === "ativo");
  },

  /** Lista animais por tipo */
  listByType(ownerId, type) {
    return this.list(ownerId).filter((a) => a.type === type);
  },

  /** Busca animais por nome ou brinco */
  search(ownerId, query) {
    if (!query) return this.list(ownerId);
    
    const normalizedQuery = String(query).toLowerCase().trim();
    return this.list(ownerId).filter(
      (a) =>
        a.name.toLowerCase().includes(normalizedQuery) ||
        a.earring.toLowerCase().includes(normalizedQuery)
    );
  },

  /** Conta animais por status */
  countByStatus(ownerId) {
    const animals = this.list(ownerId);
    return animals.reduce(
      (acc, animal) => {
        acc[animal.status] = (acc[animal.status] || 0) + 1;
        return acc;
      },
      { ativo: 0, inativo: 0, transferido: 0 }
    );
  },
};