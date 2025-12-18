// API Hooks for Exercises

export async function fetchExercises(userId, filters = {}) {
  const params = new URLSearchParams({
    userId: userId.toString(),
    ...filters,
  });

  const response = await fetch(`/api/exercises?${params}`);
  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Failed to fetch exercises");
  }

  return data.data;
}

export async function createExercise(exerciseData) {
  const response = await fetch("/api/exercises", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(exerciseData),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Failed to create exercise");
  }

  return data.data;
}

export async function deleteExercise(exerciseId, confirmTitle) {
  const response = await fetch(`/api/exercises/${exerciseId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ confirmTitle }),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Failed to delete exercise");
  }

  return data;
}

export async function addExerciseToList(userId, exerciseId) {
  const response = await fetch("/api/user-exercises", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, exerciseId }),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Failed to add exercise to list");
  }

  return data;
}

export async function removeExerciseFromList(userId, exerciseId) {
  const response = await fetch("/api/user-exercises", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, exerciseId }),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Failed to remove exercise from list");
  }

  return data;
}
