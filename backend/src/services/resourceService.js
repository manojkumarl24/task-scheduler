import { v4 as uuidv4 } from "uuid";

// Each resource holds running[] and queue[]; taskService handles timers.
const resources = new Map();


export const createResource = async ({ name, capacity  }) => {
  const id = uuidv4();
  const resource = {
    id,
    name,
    capacity,
    running: [], 
    queue: [],   
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  resources.set(id, resource);
  return resource;
};

export const listResources = async ({ limit = 50, offset = 0 } = {}) => {
  const all = Array.from(resources.values());
  return all.slice(offset, offset + limit);
};

export const getResource = async (id) => {
  return resources.get(id) || null;
};

export const updateResource = async (id, { name, capacity }) => {
  const resource = resources.get(id);
  if (!resource) throw new Error("Resource not found");
  if (name) resource.name = name;
  if (capacity) resource.capacity = capacity;
  resource.updatedAt = new Date().toISOString();
  resources.set(id, resource);
  return resource;
};

export const deleteResource = async (id) => {
  const resource = resources.get(id);
  if (!resource) throw new Error("Resource not found");
  // prevent deletion if running tasks exist
  if (resource.running.length > 0) throw new Error("Resource has running tasks");
  resources.delete(id);
  return true;
};


export const _getInternalMap = () => resources;
