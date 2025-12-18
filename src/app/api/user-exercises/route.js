import { query } from "@/lib/db";
import { NextResponse } from "next/server";

// POST - Add exercise to user's list
export async function POST(request) {
  try {
    const { userId, exerciseId } = await request.json();

    if (!userId || !exerciseId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    await query(
      "INSERT IGNORE INTO user_exercises (user_id, exercise_id) VALUES (?, ?)",
      [userId, exerciseId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding exercise to list:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add exercise to list" },
      { status: 500 }
    );
  }
}

// DELETE - Remove exercise from user's list
export async function DELETE(request) {
  try {
    const { userId, exerciseId } = await request.json();

    if (!userId || !exerciseId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    await query(
      "DELETE FROM user_exercises WHERE user_id = ? AND exercise_id = ?",
      [userId, exerciseId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing exercise from list:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove exercise from list" },
      { status: 500 }
    );
  }
}
