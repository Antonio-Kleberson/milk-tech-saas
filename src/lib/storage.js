// src/lib/storage.js
// Local storage utilities for data persistence (robusto e compatível)

const KEYS = {
  users: "milk_users",
  currentUser: "milk_current_user",
  dairies: "milk_dairies",
  milkPrices: "milk_prices",
  tanks: "milk_tanks",
  animals: "milk_animals",
  vaccines: "milk_vaccines",
  feedRecipes: "milk_feed_recipes",
  feedRecipeItems: "milk_feed_recipe_items",
};

// ------------ Helpers internos -------------

const safeParse = (str, fallback) => {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
};

const get = (key, fallback) => {
  const raw = localStorage.getItem(key);
  if (raw == null) return fallback;
  const parsed = safeParse(raw, fallback);
  return parsed ?? fallback;
};

const set = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Gerador de ID único
export const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Normaliza datas em formato YYYY-MM-DD
export const normalizeDate = (input) => {
  if (
    typeof input === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(input)
  ) {
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
  return new Date().toISOString().split("T")[0];
};

// ------------ Storage API -------------

export const storage = {
  // Users
  getUsers: () => get(KEYS.users, []),
  setUsers: (users) => set(KEYS.users, users),

  // Current user session
  getCurrentUser: () => get(KEYS.currentUser, null),
  setCurrentUser: (user) => set(KEYS.currentUser, user),
  clearCurrentUser: () => localStorage.removeItem(KEYS.currentUser),

  // Dairies
  getDairies: () => get(KEYS.dairies, []),
  setDairies: (dairies) => set(KEYS.dairies, dairies),

  // Milk prices
  getMilkPrices: () => get(KEYS.milkPrices, []),
  setMilkPrices: (prices) => set(KEYS.milkPrices, prices),

  // Tanks
  getTanks: () => get(KEYS.tanks, []),
  setTanks: (tanks) => set(KEYS.tanks, tanks),

  // Animals
  getAnimals: () => get(KEYS.animals, []),
  setAnimals: (animals) => set(KEYS.animals, animals),

  // Vaccines
  getVaccines: () => get(KEYS.vaccines, []),
  setVaccines: (vaccines) => set(KEYS.vaccines, vaccines),

  // Feed recipes
  getFeedRecipes: () => get(KEYS.feedRecipes, []),
  setFeedRecipes: (recipes) => set(KEYS.feedRecipes, recipes),

  // Feed recipe items
  getFeedRecipeItems: () => get(KEYS.feedRecipeItems, []),
  setFeedRecipeItems: (items) => set(KEYS.feedRecipeItems, items),

  // --- Helpers úteis ---

  /** Retorna o último preço válido de um laticínio (por data efetiva) */
  getLatestPriceByDairy(dairyId) {
    const prices = get(KEYS.milkPrices, []);
    const list = prices.filter((p) => p.dairy_id === dairyId);
    if (!list.length) return null;

    // Ordenar por string YYYY-MM-DD em vez de new Date para evitar fuso
    list.sort((a, b) =>
      normalizeDate(b.effective_at).localeCompare(normalizeDate(a.effective_at))
    );
    return list[0]; // { price_per_liter, effective_at, ... }
  },

  /** Limpa somente dados de demo (se você usar prefixo demo_ nos ids) */
  clearDemoData() {
    Object.values(KEYS).forEach((key) => {
      const list = get(key, []);
      const filtered = Array.isArray(list)
        ? list.filter((item) => !String(item.id).startsWith("demo_"))
        : list;
      set(key, filtered);
    });
  },
};

// ------------ Inicialização de dados de exemplo -------------

export const initializeSampleData = () => {
  if (storage.getDairies().length === 0) {
    const now = new Date().toISOString();

    const sampleDairies = [
      {
        id: "demo_d1",
        user_id: "dairy1",
        trade_name: "Laticínios Vale Verde",
        cnpj: "12.345.678/0001-90",
        phone: "(11) 98765-4321",
        address: "Rua das Flores, 123",
        city: "São Paulo",
        state: "SP",
        lat: -23.5505,
        lng: -46.6333,
        created_at: now,
      },
      {
        id: "demo_d2",
        user_id: "dairy2",
        trade_name: "Queijaria Montanha",
        cnpj: "98.765.432/0001-10",
        phone: "(31) 99876-5432",
        address: "Estrada Rural, 456",
        city: "Belo Horizonte",
        state: "MG",
        lat: -19.9167,
        lng: -43.9345,
        created_at: now,
      },
    ];
    storage.setDairies(sampleDairies);

    const samplePrices = [
      {
        id: "demo_p1",
        dairy_id: "demo_d1",
        price_per_liter: 2.15,
        effective_at: normalizeDate(now),
        created_at: now,
      },
      {
        id: "demo_p2",
        dairy_id: "demo_d2",
        price_per_liter: 2.25,
        effective_at: normalizeDate(now),
        created_at: now,
      },
    ];
    storage.setMilkPrices(samplePrices);

    const sampleTanks = [
      {
        id: "demo_t1",
        dairy_id: "demo_d1",
        name: "Tanque Central SP",
        city: "São Paulo",
        state: "SP",
        responsible_name: "João Silva",
        responsible_phone: "(11) 91234-5678",
        created_at: now,
      },
      {
        id: "demo_t2",
        dairy_id: "demo_d1",
        name: "Tanque Zona Norte",
        city: "São Paulo",
        state: "SP",
        responsible_name: "Maria Santos",
        responsible_phone: "(11) 92345-6789",
        created_at: now,
      },
    ];
    storage.setTanks(sampleTanks);

    const sampleRecipes = [
      {
        id: "demo_r1",
        owner_id: "producer1",
        name: "Ração Básica Gado Leiteiro",
        created_at: now,
      },
      {
        id: "demo_r2",
        owner_id: "producer1",
        name: "Ração Premium Lactação",
        created_at: now,
      },
    ];
    storage.setFeedRecipes(sampleRecipes);

    const sampleRecipeItems = [
      {
        id: "demo_ri1",
        recipe_id: "demo_r1",
        ingredient_name: "Milho",
        proportion_type: "percent",
        proportion_value: 75,
      },
      {
        id: "demo_ri2",
        recipe_id: "demo_r1",
        ingredient_name: "Farelo de Soja",
        proportion_type: "percent",
        proportion_value: 20,
      },
      {
        id: "demo_ri3",
        recipe_id: "demo_r1",
        ingredient_name: "Sal Mineral",
        proportion_type: "percent",
        proportion_value: 5,
      },
    ];
    storage.setFeedRecipeItems(sampleRecipeItems);
  }
};