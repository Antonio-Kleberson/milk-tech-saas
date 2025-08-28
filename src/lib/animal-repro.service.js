// src/lib/animal-repro.service.js
const KEY = 'milktech:animal_repro';

function read() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  catch { return []; }
}
function write(data) { localStorage.setItem(KEY, JSON.stringify(data)); }

const isKind = (k) => ['ia','cobertura','diagnostico','parto'].includes(k);

function addDays(yyyyMmDd, days) {
  const [y,m,d] = yyyyMmDd.split('-').map(Number);
  const base = new Date(y, m-1, d);
  base.setDate(base.getDate() + days);
  const yy = base.getFullYear();
  const mm = String(base.getMonth()+1).padStart(2,'0');
  const dd = String(base.getDate()).padStart(2,'0');
  return `${yy}-${mm}-${dd}`;
}

export const animalRepro = {
  list() { return read().sort((a,b)=>a.date.localeCompare(b.date)); },
  listByAnimal(animal_id) { return this.list().filter(x => x.animal_id === animal_id); },
  create(dto) {
    if (!dto?.animal_id) throw new Error('animal_id é obrigatório');
    if (!dto?.date) throw new Error('date é obrigatório (YYYY-MM-DD)');
    if (!isKind(dto?.kind)) throw new Error('kind inválido');
    const item = {
      id: Date.now().toString(),
      animal_id: dto.animal_id,
      kind: dto.kind, // ia | cobertura | diagnostico | parto
      date: dto.date, // YYYY-MM-DD
      result: dto.result || '', // diagnostico: positivo/negativo ; parto: vivo/morto
      calf_sex: dto.calf_sex || '', // parto: M/F/'' 
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
      ...(dto.kind ? { kind: dto.kind } : {}),
      ...(dto.date ? { date: dto.date } : {}),
      ...(dto.result !== undefined ? { result: dto.result || '' } : {}),
      ...(dto.calf_sex !== undefined ? { calf_sex: dto.calf_sex || '' } : {}),
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

  // ---- Helpers de estado reprodutivo ----
  lastService(animal_id) {
    const events = this.listByAnimal(animal_id).filter(e => e.kind==='ia' || e.kind==='cobertura')
      .sort((a,b)=>b.date.localeCompare(a.date));
    return events[0] || null;
  },
  lastDiagnosis(animal_id) {
    const events = this.listByAnimal(animal_id).filter(e => e.kind==='diagnostico')
      .sort((a,b)=>b.date.localeCompare(a.date));
    return events[0] || null;
  },
  expectedCalvingDate(animal_id) {
    // DPP = 283 dias após a ÚLTIMA IA/COBERTURA se houver diagnóstico POSITIVO depois dela
    const service = this.lastService(animal_id);
    if (!service) return null;
    const diags = this.listByAnimal(animal_id)
      .filter(e => e.kind==='diagnostico' && e.result.toLowerCase()==='positivo' && e.date >= service.date)
      .sort((a,b)=>b.date.localeCompare(a.date));
    if (!diags[0]) return null;
    return addDays(service.date, 283);
  },
  state(animal_id) {
    const s = this.lastService(animal_id);
    const d = this.lastDiagnosis(animal_id);
    const dpp = this.expectedCalvingDate(animal_id);
    if (d && d.result.toLowerCase()==='positivo' && dpp) {
      return { status: 'prenhe', service: s, diagnosis: d, dpp };
    }
    if (s && (!d || d.date < s.date)) {
      return { status: 'servida', service: s, diagnosis: d || null, dpp: null };
    }
    return { status: 'vazia', service: s || null, diagnosis: d || null, dpp: null };
  },
};
