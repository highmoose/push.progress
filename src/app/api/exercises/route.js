import { query } from "@/lib/db";
import { NextResponse } from "next/server";

// GET - Get all exercises (with optional filter for user's list)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const muscleGroup = searchParams.get("muscleGroup");
    const type = searchParams.get("type");
    const myListOnly = searchParams.get("myListOnly") === "true";

    let sql = `
      SELECT e.*, 
             CASE WHEN ue.id IS NOT NULL THEN 1 ELSE 0 END as in_my_list,
             u.username as created_by
      FROM exercises e
      LEFT JOIN user_exercises ue ON e.id = ue.exercise_id AND ue.user_id = ?
      LEFT JOIN users u ON e.created_by_user_id = u.id
      WHERE e.is_deleted = 0
    `;
    const params = [userId];

    if (muscleGroup) {
      sql += " AND e.muscle_group = ?";
      params.push(muscleGroup);
    }

    if (type) {
      sql += " AND e.type = ?";
      params.push(type);
    }

    if (myListOnly) {
      sql += " AND ue.id IS NOT NULL";
    }

    sql += " ORDER BY e.muscle_group, e.title";

    const exercises = await query(sql, params);
    return NextResponse.json({ success: true, data: exercises });
  } catch (error) {
    console.error("Error fetching exercises:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch exercises" },
      { status: 500 }
    );
  }
}

// POST - Create new exercise
export async function POST(request) {
  try {
    const { title, muscleGroup, type, userId } = await request.json();

    if (!title || !muscleGroup || !type || !userId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await query(
      "INSERT INTO exercises (title, muscle_group, type, created_by_user_id) VALUES (?, ?, ?, ?)",
      [title, muscleGroup, type, userId]
    );

    return NextResponse.json({
      success: true,
      data: { id: result.insertId, title, muscleGroup, type },
    });
  } catch (error) {
    console.error("Error creating exercise:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create exercise" },
      { status: 500 }
    );
  }
}
