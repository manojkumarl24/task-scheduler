import * as resourceService from "../services/resourceService.js";

export const createResource = async (req, res) => {
  try {
    const { name, capacity } = req.body;
    if (!name) return res.status(400).json({ error: "name required" });
    const resource = await resourceService.createResource({ name, capacity });
    res.status(201).json(resource);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /resources?limit=10&offset=0
export const listResources = async (req, res) => {
  const { limit = 50, offset = 0 } = req.query;
  const resources = await resourceService.listResources({ limit: +limit, offset: +offset });
  res.json(resources);
};

export const getResource = async (req, res) => {
  const resource = await resourceService.getResource(req.params.id);
  if (!resource) return res.status(404).json({ error: "Resource not found" });
  res.json(resource);
};

export const updateResource = async (req, res) => {
  try {
    const { name, capacity } = req.body;
    const resource = await resourceService.updateResource(req.params.id, { name, capacity });
    res.json(resource);
  } catch (err) {
    if (err.message === "Resource not found") return res.status(404).json({ error: err.message });
    res.status(400).json({ error: err.message });
  }
};

export const deleteResource = async (req, res) => {
  try {
    await resourceService.deleteResource(req.params.id);
    res.json({ message: "Resource deleted" });
  } catch (err) {
    if (err.message === "Resource not found") return res.status(404).json({ error: err.message });
    res.status(400).json({ error: err.message });
  }
};
