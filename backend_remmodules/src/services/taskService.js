import { v4 as uuidv4 } from "uuid";
import * as resourceService from "./resourceService.js";

// timers: taskId -> { timerId, resourceId }
const timers = new Map();

//Mutex implementation per resource to queue async operations
const resourceLocks = new Map();

const acquireLock = async (resourceId) => {
  if (!resourceLocks.has(resourceId)) resourceLocks.set(resourceId, []);
  const queue = resourceLocks.get(resourceId);

  let resolver;
  const p = new Promise(resolve => (resolver = resolve));
  queue.push(resolver);

  if (queue.length === 1) resolver();

  await p;

  return () => {
    queue.shift(); 
    if (queue.length > 0) {
      const next = queue[0];
      next();
    } else {
      resourceLocks.delete(resourceId); 
    }
  };
};

const resourcesMap = resourceService._getInternalMap();


export const scheduleTask = async ({ name, resourceId, duration, user }) => {
  let resource = resourcesMap.get(resourceId);
  if (!resource) throw new Error("Resource not found");

  const unlock = await acquireLock(resourceId);
  try {
    const task = {
      id: uuidv4(),
      name,
      resourceId,
      userId:  user.id || user.userId, 
      username: user.username || user.name,
      role: user.role || "user",
      duration,
      status: "queued",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (resource.running.length < resource.capacity) {
      task.status = "running";
      resource.running.push(task);
      startAutoTermination(task, user);
    } else {
      if (task.role === "admin") {
        resource.queue.unshift(task);
      } else {
        resource.queue.push(task);
      }
    }
    resource.updatedAt = new Date().toISOString();
    resourcesMap.set(resourceId, resource);
    return task;

  } finally {
    unlock();
  }
};

const startAutoTermination = (task, user) => {
  if (timers.has(task.id)) {
    clearTimeout(timers.get(task.id).timerId);
    timers.delete(task.id);
  }

  const ms = task.duration * 1000;
  const timerId = setTimeout(async () => {
    try {
      await terminateTask({ taskId: task.id, user, auto: true });
    } catch (err) {
      console.error("Auto termination error:", err);
    }
  }, ms);

  timers.set(task.id, { timerId, resourceId: task.resourceId });
};

export const listTasks = async ({ resourceId, status, userId, limit = 50, offset = 0,} = {}) => {
  let tasks = [];

  if (resourceId) {
    const resource = resourcesMap.get(resourceId) || { running: [], queue: [] };
    tasks = [...resource.running, ...resource.queue];
  } else {
    for (const res of resourcesMap.values()) {
      tasks.push(...res.running, ...res.queue);
    }
  }

  if (status) {
    tasks = tasks.filter((t) => t.status === status);
  }

  if (userId) {
    tasks = tasks.filter((t) => t.userId === userId);
  }

  return tasks.slice(offset, offset + limit);
};


export const getTaskById = async (taskId) => {
  for (const res of resourcesMap.values()) {
    const t = res.running.find(t => t.id === taskId) || res.queue.find(t => t.id === taskId);
    if (t) return t;
  }
  return null;
};



export const terminateTask = async ({ taskId, user, auto = false }) => {
  for (const [resourceId, resource] of resourcesMap.entries()) {
    const unlock = await acquireLock(resourceId);
    try {
      let idx = resource.running.findIndex(t => t.id === taskId);
      if (idx !== -1) {
        const [task] = resource.running.splice(idx, 1);

        // permission
        const ownerId = task.userId;
        const requesterId = user?.sub || user?.id || user?.userId;
        if (!auto && ownerId !== requesterId && user.role !== "admin") {
          resource.running.splice(idx, 0, task);
          return { error: "Forbidden" };
        }

        task.status = "terminated";
        task.updatedAt = new Date().toISOString();

        // clear timer if present
        if (timers.has(task.id)) {
          clearTimeout(timers.get(task.id).timerId);
          timers.delete(task.id);
        }

        // promote next queued (if any) to running
        if (resource.queue.length > 0) {
          const next = resource.queue.shift();
          next.status = "running";
          next.updatedAt = new Date().toISOString();
          resource.running.push(next);
          startAutoTermination(next);
        }

        resourcesMap.set(resourceId, resource);
        return task;
      }

      // check queue
      idx = resource.queue.findIndex(t => t.id === taskId);
      if (idx !== -1) {
        const [task] = resource.queue.splice(idx, 1);
        const ownerId = task.userId;
        const requesterId = user.sub || user.id || user.userId;
        if (!auto && ownerId !== requesterId && user.role !== "admin") {
          resource.queue.splice(idx, 0, task);
          return { error: "Forbidden" };
        }
        task.status = "terminated";
        task.updatedAt = new Date().toISOString();
        resourcesMap.set(resourceId, resource);
        return task;
      }
    } finally {
      unlock();
    }
  }
  return null;
};

export const listAllTasks = async () => {
  const all = [];
  for (const res of resourcesMap.values()) {
    all.push(...res.running, ...res.queue);
  }
  return all;
};
