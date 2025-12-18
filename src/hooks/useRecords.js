// API Hooks for Exercise Records

export async function fetchRecords(userId, exerciseId, days = null) {
  const params = new URLSearchParams({
    userId: userId.toString(),
    exerciseId: exerciseId.toString(),
  });

  if (days) {
    params.append("days", days.toString());
  }

  const response = await fetch(`/api/records?${params}`);
  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Failed to fetch records");
  }

  return data.data;
}

export async function createRecord(recordData) {
  const response = await fetch("/api/records", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(recordData),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Failed to create record");
  }

  return data.data;
}

export async function updateRecord(recordId, recordData) {
  const response = await fetch(`/api/records/${recordId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(recordData),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Failed to update record");
  }

  return data;
}

export async function deleteRecord(recordId) {
  const response = await fetch(`/api/records/${recordId}`, {
    method: "DELETE",
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Failed to delete record");
  }

  return data;
}
