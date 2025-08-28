// src/lib/animal-movements.service.js
const KEY = 'milktech:animal_movements';

function read() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  catch { return []; }
}
function write(data) { localStorage.setItem(KEY, JSON.stringify(data)); }

const isValidType = (t) => ['compra','venda','obito','transferencia'].includes(t);

export const animalMovements = {
  list() { return read().sort((a,b) => a.date.localeCompare(b.date)); },
  listByAnimal(animal_id) { return this.list().filter(x => x.animal_id === animal_id); },
  recentForAnimal(animal_id, limit=3) {
    return this.listByAnimal(animal_id).sort((a,b)=>b.date.localeCompare(a.date)).slice(0, limit);
  },
  create(dto) {
    if (!dto?.animal_id) throw new Error('animal_id é obrigatório');
    if (!dto?.date) throw new Error('date é obrigatório (YYYY-MM-DD)');
    if (!isValidType(dto?.type)) throw new Error('type inválido');
    const item = {
      id: Date.now().toString(),
      animal_id: dto.animal_id,
      type: dto.type, // compra | venda | obito | transferencia
      date: dto.date, // YYYY-MM-DD (local)
      amount: dto.amount != null ? Number(dto.amount) : null, // compra/venda
      notes: dto.notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const data = read(); data.push(item); write(data);
    return item;
  },
  update(id, dto) {
    const data = read();
    const idx = data.findIndex(x => x.id === id);
    if (idx === -1) return null;
    const next = {
      ...data[idx],
      ...(dto.type ? { type: dto.type } : {}),
      ...(dto.date ? { date: dto.date } : {}),
      ...(dto.amount !== undefined ? { amount: dto.amount != null ? Number(dto.amount) : null } : {}),
      ...(dto.notes !== undefined ? { notes: dto.notes || '' } : {}),
      updated_at: new Date().toISOString(),
    };
    data[idx] = next; write(data); return next;
  },
  remove(id) {
    const next = read().filter(x => x.id !== id);
    write(next);
  },
  removeByAnimal(animal_id) {
    const next = read().filter(x => x.animal_id !== animal_id);
    write(next);
  },
};
