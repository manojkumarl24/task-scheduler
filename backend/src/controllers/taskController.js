import * as taskService from "../services/taskService.js";

export const createTask = async (req, res) => {
  try {
    const { name, resourceId, duration } = req.body;
    if (!name || !resourceId || !duration) return res.status(400).json({ error: "name, resourceId and duration required" });

    const user = req.user;

    const task = await taskService.scheduleTask({ name, resourceId, duration: +duration, user });
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const listTasks = async (req, res) => {
  const { resourceId, status, userId, limit = 50, offset = 0 } = req.query;
  const user = req.user;
  let result = [];
  if(user.role === "admin"){
    if (userId) {
      result = await taskService.listTasks({resourceId,status,userId: queryUserId.toString(), limit: +limit,offset: +offset,});
    } else {
      result = await taskService.listAllTasks();
    }
  } else {
    result = await taskService.listTasks({resourceId,status,userId: user.sub || user.id || user.userId,limit: +limit,offset: +offset, });
  }
  res.json(result);
};

export const getTaskById = async (req, res) => {
  const task = await taskService.getTaskById(req.params.id);
  if (!task) return res.status(404).json({ error: "Task not found" });
  res.json(task);
};

export const terminateTask = async (req, res) => {
  const taskId = req.params.id;
  const user = req.user;
  try {
    const result = await taskService.terminateTask({ taskId, user });
    if (result === null) return res.status(404).json({ error: "Task not found" });
    if (result.error === "Forbidden") return res.status(403).json({ error: "Not allowed to terminate this task" });
    return res.json(result);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};


export const listAllTasks = async (req, res) => {
  const all = await taskService.listAllTasks();
  res.json(all);
};
