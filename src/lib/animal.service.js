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

function normalize(a) {
  return {
    id: a.id,
    owner_id: a.owner_id,
    name: a.name || "",
    earring: a.earring || "",
    type: a.type || "vaca",
    breed: a.breed || "",
    status: a.status || "ativo",
    stage: a.stage || "",
    birth_date: a.birth_date || "",
    dam_id: a.dam_id || "",
    sire_id: a.sire_id || "",
    notes: a.notes || "",
    created_at: a.created_at || new Date().toISOString(),
    updated_at: a.updated_at || new Date().toISOString(),
  };
}

export const animalService = {
  list(ownerId) {
    return read()
      .filter((a) => a.owner_id === ownerId)
      .map(normalize);
  },
  get(id) {
    const a = read().find((x) => x.id === id);
    return a ? normalize(a) : null;
  },
  create(ownerId, dto) {
    const data = read();
    const item = normalize({ id: Date.now().toString(), owner_id: ownerId, ...dto });
    data.push(item);
    write(data);
    return item;
  },
  update(id, dto) {
    const data = read();
    const idx = data.findIndex((x) => x.id === id);
    if (idx === -1) return null;
    const next = normalize({ ...data[idx], ...dto, updated_at: new Date().toISOString() });
    data[idx] = next;
    write(data);
    return next;
  },
  remove(id) {
    write(read().filter((x) => x.id !== id));
  },
  isEarringUnique(ownerId, earring, ignoreId) {
    return !read().some(
      (a) => a.owner_id === ownerId && a.earring === earring && a.id !== ignoreId,
    );
  },
};
