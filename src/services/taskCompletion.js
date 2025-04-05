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
  if (!taskPositions || Object.keys(taskPositions).length === 0) {
    return 0;
  }
  const totalWeight = Object.values(taskPositions).reduce((sum, { task }) => {
    return sum + (task.isApproval ? taskWeights.approval : taskWeights.regular);
  }, 0);

  const completedWeight = completedTasks.reduce((sum, taskId) => {
    if (!taskPositions[taskId]) return sum;
    return sum + (taskPositions[taskId].task.isApproval ? taskWeights.approval : taskWeights.regular);
  }, 0);

  return Math.round((completedWeight / totalWeight) * 100);
};
