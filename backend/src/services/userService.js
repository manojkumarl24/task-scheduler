import { v4 as uuidv4 } from "uuid";

const users = new Map();

// seed an admin/user if empty
const seed = () => {
  if (users.size === 0) {
    const adminId = uuidv4();
    const userId = uuidv4();
    users.set(adminId, { id: adminId, username: "admin", password: "admin123", role: "admin", createdAt: new Date().toISOString() });
    users.set(userId, { id: userId, username: "user", password: "user123", role: "user", createdAt: new Date().toISOString() });
  }
};
seed();

export const createUser = async ({ username, password, role = "user" }) => {
  for (const u of users.values()) {
    if (u.username === username) throw new Error("Username exists");
  }
  const id = uuidv4();
  const user = { id, username, password, role, createdAt: new Date().toISOString() };
  users.set(id, user);
  return { ...user, password: undefined };
};

export const listUsers = async ({ limit = 50, offset = 0 } = {}) => {
  const arr = Array.from(users.values()).map(u => ({ ...u, password: undefined }));
  return arr.slice(offset, offset + limit);
};

export const getUser = async (id) => {
  const u = users.get(id);
  if (!u) return null;
  return { ...u, password: undefined };
};

export const updateUser = async (id, { username, password, role }) => {
  const user = users.get(id);
  if (!user) throw new Error("User not found");
  if (username) user.username = username;
  if (password) user.password = password;
  if (role) user.role = role;
  users.set(id, user);
  return { ...user, password: undefined };
};

export const deleteUser = async (id) => {
  const exists = users.has(id);
  if (!exists) throw new Error("User not found");
  users.delete(id);
  return true;
};


export const findByUsername = async (username) => {
  for (const u of users.values()) {
    if (u.username === username) return u;
  }
  return null;
};

export const getInternalStore = () => users;
