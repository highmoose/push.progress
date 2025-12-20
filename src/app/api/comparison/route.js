import { query } from "@/lib/db";
import { NextResponse } from "next/server";

// GET - Get comparison data for muscle group or specific exercise
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId1 = searchParams.get("userId1");
    const userId2 = searchParams.get("userId2");
    const exerciseId = searchParams.get("exerciseId");
    const muscleGroup = searchParams.get("muscleGroup");
    const days = searchParams.get("days");

    if (!userId1 || !userId2) {
      return NextResponse.json(
        { success: false, error: "Missing user IDs" },
        { status: 400 }
      );
    }

    let user1Data, user2Data;

    if (exerciseId) {
      // Single exercise comparison
      user1Data = await getExerciseRecords(userId1, exerciseId, days);
      user2Data = await getExerciseRecords(userId2, exerciseId, days);
    } else if (muscleGroup) {
      // Muscle group average comparison
      user1Data = await getMuscleGroupAverage(userId1, muscleGroup, days);
      user2Data = await getMuscleGroupAverage(userId2, muscleGroup, days);
    } else {
      return NextResponse.json(
        { success: false, error: "Must provide exerciseId or muscleGroup" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        user1: user1Data,
        user2: user2Data,
      },
    });
  } catch (error) {
    console.error("Error fetching comparison data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch comparison data" },
      { status: 500 }
    );
  }
}

async function getExerciseRecords(userId, exerciseId, days) {
  let sql = `
    SELECT weight_kg, reps, record_date 
    FROM exercise_records 
    WHERE user_id = ? AND exercise_id = ?
  `;
  const params = [userId, exerciseId];

  if (days) {
    sql += " AND record_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)";
    params.push(parseInt(days));
  }

  sql += " ORDER BY record_date ASC";

  return await query(sql, params);
}

async function getMuscleGroupAverage(userId, muscleGroup, days) {
  // Step 1: Get all records for this muscle group with calculated 1RM
  let sql = `
    SELECT 
      er.exercise_id,
      er.weight_kg,
      er.reps,
      er.record_date,
      (er.weight_kg * (1 + er.reps / 30)) as estimated_1rm
    FROM exercise_records er
    JOIN exercises e ON er.exercise_id = e.id
    WHERE er.user_id = ? 
      AND e.muscle_group = ?
      AND e.is_deleted = 0
  `;
  const params = [userId, muscleGroup];

  if (days) {
    sql += " AND er.record_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)";
    params.push(parseInt(days));
  }

  sql += " ORDER BY er.record_date ASC";

  const records = await query(sql, params);

  // Step 2: Group by exercise and find best 1RM per exercise
  const exerciseBestMap = {};
  records.forEach((record) => {
    if (
      !exerciseBestMap[record.exercise_id] ||
      record.estimated_1rm > exerciseBestMap[record.exercise_id]
    ) {
      exerciseBestMap[record.exercise_id] = record.estimated_1rm;
    }
  });

  // Step 3: Get top 3 exercises by best 1RM
  const topExercises = Object.values(exerciseBestMap)
    .sort((a, b) => b - a)
    .slice(0, 3);

  if (topExercises.length === 0) {
    return [];
  }

  // Step 4: Calculate the average of top exercises for each date
  const dateMap = {};
  records.forEach((record) => {
    const date = record.record_date;
    if (!dateMap[date]) {
      dateMap[date] = [];
    }
    // Only include records from exercises that are in our top 3
    const exerciseBest = exerciseBestMap[record.exercise_id];
    if (topExercises.includes(exerciseBest)) {
      dateMap[date].push(record.estimated_1rm);
    }
  });

  // Step 5: Create final data points with averaged 1RMs per date
  return Object.keys(dateMap)
    .sort()
    .map((date) => ({
      weight_kg:
        dateMap[date].reduce((sum, val) => sum + val, 0) / dateMap[date].length,
      record_date: date,
    }));
}
