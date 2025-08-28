const KEY = 'milktech:animal_vaccines';

function read() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } }
function write(data) { localStorage.setItem(KEY, JSON.stringify(data)); }

function norm(v) {
  return {
    id: v.id,
    animal_id: v.animal_id,
    name: v.name || '',
    applied_at: v.applied_at || '',
    next_due_at: v.next_due_at || '',
    notes: v.notes || '',
    created_at: v.created_at || new Date().toISOString(),
    updated_at: v.updated_at || new Date().toISOString(),
  };
}

export const animalVaccines = {
  list() { return read().map(norm); },
  listByAnimal(animalId) { return read().filter(v => v.animal_id === animalId).map(norm); },
  add(animalId, dto) {
    const data = read();
    const item = norm({ id: Date.now().toString(), animal_id: animalId, ...dto });
    data.push(item); write(data); return item;
  },
  update(id, dto) {
    const data = read(); const idx = data.findIndex(v => v.id === id);
    if (idx === -1) return null;
    const next = norm({ ...data[idx], ...dto, updated_at: new Date().toISOString() });
    data[idx] = next; write(data); return next;
  },
  remove(id) { write(read().filter(v => v.id !== id)); }
};
