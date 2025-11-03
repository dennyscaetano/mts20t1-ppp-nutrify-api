// Repositório com persistência simples em arquivos JSON (data/)
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_DIR = path.resolve(__dirname, '..', '..', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const FOODS_FILE = path.join(DATA_DIR, 'foods.json');
const MEALS_FILE = path.join(DATA_DIR, 'meals.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJson(file) {
  try {
    if (!fs.existsSync(file)) return [];
    const content = fs.readFileSync(file, 'utf8');
    return JSON.parse(content || '[]');
  } catch (err) {
    // If parse fails, return empty and overwrite on next save
    return [];
  }
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

function toMap(arr) {
  const m = new Map();
  for (const item of arr) m.set(item.id, item);
  return m;
}

ensureDataDir();

// Load initial data
const db = {
  users: toMap(readJson(USERS_FILE)),
  foods: toMap(readJson(FOODS_FILE)),
  meals: toMap(readJson(MEALS_FILE))
};

function persistUsers() { writeJson(USERS_FILE, Array.from(db.users.values())); }
function persistFoods() { writeJson(FOODS_FILE, Array.from(db.foods.values())); }
function persistMeals() { writeJson(MEALS_FILE, Array.from(db.meals.values())); }

function generateId() { return uuidv4(); }

// Users
const UserRepo = {
  create: async (data) => {
    const id = generateId();
    const now = new Date().toISOString();
    const user = { ...data, role: data.role || 'user', id, createdAt: now, updatedAt: now };
    db.users.set(id, user);
    persistUsers();
    return user;
  },
  count: async () => db.users.size,
  findByEmail: async (email) => {
    for (const user of db.users.values()) if (user.email === email) return user;
    return null;
  },
  findById: async (id) => db.users.get(id) || null,
  update: async (id, data) => {
    const existing = db.users.get(id);
    if (!existing) return null;
    const now = new Date().toISOString();
    const updated = { ...existing, ...data, id, updatedAt: now };
    db.users.set(id, updated);
    persistUsers();
    return updated;
  }
};

// Foods
const FoodRepo = {
  create: async (data) => {
    const id = generateId();
    const now = new Date().toISOString();
    const food = { ...data, id, createdAt: now, updatedAt: now };
    db.foods.set(id, food);
    persistFoods();
    return food;
  },
  findAll: async () => Array.from(db.foods.values()),
  findById: async (id) => db.foods.get(id) || null,
  update: async (id, data) => {
    const existing = db.foods.get(id);
    if (!existing) return null;
    const now = new Date().toISOString();
    const updated = { ...existing, ...data, id, updatedAt: now };
    db.foods.set(id, updated);
    persistFoods();
    return updated;
  },
  delete: async (id) => {
    const res = db.foods.delete(id);
    persistFoods();
    return res;
  }
};

// Meals
const MealRepo = {
  create: async (data) => {
    const id = generateId();
    const now = new Date().toISOString();
    const meal = { ...data, id, createdAt: now, updatedAt: now };
    db.meals.set(id, meal);
    persistMeals();
    return meal;
  },
  findAll: async () => Array.from(db.meals.values()),
  findByUserId: async (userId) => Array.from(db.meals.values()).filter(m => m.user === userId),
  findById: async (id) => db.meals.get(id) || null,
  update: async (id, data) => {
    const existing = db.meals.get(id);
    if (!existing) return null;
    const now = new Date().toISOString();
    const updated = { ...existing, ...data, id, updatedAt: now };
    db.meals.set(id, updated);
    persistMeals();
    return updated;
  },
  delete: async (id) => {
    const res = db.meals.delete(id);
    persistMeals();
    return res;
  }
};

function reset() {
  db.users.clear();
  db.foods.clear();
  db.meals.clear();
  persistUsers();
  persistFoods();
  persistMeals();
}

module.exports = { UserRepo, FoodRepo, MealRepo, reset };

