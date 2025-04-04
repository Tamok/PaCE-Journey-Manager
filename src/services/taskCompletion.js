// src/services/taskCompletion.js
// Define task weights
const taskWeights = { approval: 1, regular: 2 };

// Checks if task dependencies are complete
export const canCompleteTask = (taskId, taskPositions, completedTasks) => {
  const task = taskPositions[taskId].task;
  return task.dependencies.every(dep => completedTasks.includes(dep));
};

// Calculates weighted completion
export const calculateCompletion = (taskPositions, completedTasks) => {
  const totalWeight = Object.values(taskPositions).reduce((sum, { task }) => (
    sum + (task.isApproval ? taskWeights.approval : taskWeights.regular)
  ), 0);

  const completedWeight = completedTasks.reduce((sum, taskId) => (
    sum + (taskPositions[taskId].task.isApproval ? taskWeights.approval : taskWeights.regular)
  ), 0);

  return Math.round((completedWeight / totalWeight) * 100);
};
