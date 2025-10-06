import * as authService from "../services/authService.js";

export const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  const user = await authService.validateUser(username, password);
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = authService.issueToken(user);
  
  return res.json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      token,
    });
  };

export const profile = (req, res) => {
  res.json({ user: req.user });
};
