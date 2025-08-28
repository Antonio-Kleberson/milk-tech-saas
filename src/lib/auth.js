// import { toast } from '@/components/ui/use-toast'; // <- não usado; pode remover
import { storage } from '@/lib/storage';

const makeId = () => (globalThis.crypto?.randomUUID?.() || String(Date.now()));

export const auth = {
  login: async (email, password) => {
    const em = String(email || '').trim();
    const pw = String(password || '').trim();

    if (!em || !pw) {
      return { user: null, error: 'Informe email e senha.' };
    }

    const users = storage.getUsers();
    const user = users.find(u => u.email === em && u.password === pw);

    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      storage.setCurrentUser(userWithoutPassword);
      return { user: userWithoutPassword, error: null };
    }

    return { user: null, error: 'Email ou senha inválidos' };
  },

  register: async (userData) => {
    const email = String(userData?.email || '').trim();
    const password = String(userData?.password || '').trim();

    if (!email || !password) {
      return { user: null, error: 'Informe email e senha.' };
    }

    const users = storage.getUsers();
    const existingUser = users.find(u => u.email === email);

    if (existingUser) {
      return { user: null, error: 'Email já cadastrado' };
    }

    const newUser = {
      id: makeId(),
      ...userData,
      email,
      password,
      created_at: new Date().toISOString(),
    };

    users.push(newUser);
    storage.setUsers(users);

    const { password: _, ...userWithoutPassword } = newUser;
    storage.setCurrentUser(userWithoutPassword);

    return { user: userWithoutPassword, error: null };
  },

  logout: () => {
    storage.clearCurrentUser();
  },

  getCurrentUser: () => {
    return storage.getCurrentUser();
  },

  isAuthenticated: () => {
    return storage.getCurrentUser() !== null;
  }
};
