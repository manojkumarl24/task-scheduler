import * as userService from "../services/userService.js";

export const createUser = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password) return res.status(400).json({ error: "username & password required" });
    const user = await userService.createUser({ username, password, role });
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const listUsers = async (req, res) => {
  const { limit = 50, offset = 0 } = req.query;
  const users = await userService.listUsers({ limit: +limit, offset: +offset });
  res.json(users);
};

export const getUser = async (req, res) => {
  const user = await userService.getUser(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
};

export const updateUser = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const user = await userService.updateUser(req.params.id, { username, password, role });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    await userService.deleteUser(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
