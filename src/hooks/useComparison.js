// API Hooks for Comparison Data

export async function fetchComparisonData(userId1, userId2, options = {}) {
  const params = new URLSearchParams({
    userId1: userId1.toString(),
    userId2: userId2.toString(),
  });

  if (options.exerciseId) {
    params.append("exerciseId", options.exerciseId.toString());
  }

  if (options.muscleGroup) {
    params.append("muscleGroup", options.muscleGroup);
  }

  if (options.days) {
    params.append("days", options.days.toString());
  }

  const response = await fetch(`/api/comparison?${params}`);
  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Failed to fetch comparison data");
  }

  return data.data;
}
