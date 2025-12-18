import { query } from "@/lib/db";
import { NextResponse } from "next/server";

// GET - Get exercise records
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const exerciseId = searchParams.get("exerciseId");
    const days = searchParams.get("days"); // null for all time

    if (!userId || !exerciseId) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters" },
        { status: 400 }
      );
    }

    let sql = `
      SELECT * FROM exercise_records 
      WHERE user_id = ? AND exercise_id = ?
    `;
    const params = [userId, exerciseId];

    if (days) {
      sql += " AND record_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)";
      params.push(parseInt(days));
    }

    sql += " ORDER BY record_date ASC";

    const records = await query(sql, params);
    return NextResponse.json({ success: true, data: records });
  } catch (error) {
    console.error("Error fetching records:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch records" },
      { status: 500 }
    );
  }
}

// POST - Create new record
export async function POST(request) {
  try {
    const { userId, exerciseId, weightKg, reps, recordDate, notes } =
      await request.json();

    if (!userId || !exerciseId || !weightKg || !reps || !recordDate) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if a record already exists for this user, exercise, and date
    const existingRecord = await query(
      "SELECT id FROM exercise_records WHERE user_id = ? AND exercise_id = ? AND record_date = ?",
      [userId, exerciseId, recordDate]
    );

    if (existingRecord.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "You already have a record for this exercise on this date. Please edit the existing record instead.",
        },
        { status: 409 }
      );
    }

    const result = await query(
      "INSERT INTO exercise_records (user_id, exercise_id, weight_kg, reps, record_date, notes) VALUES (?, ?, ?, ?, ?, ?)",
      [userId, exerciseId, weightKg, reps, recordDate, notes || null]
    );

    return NextResponse.json({
      success: true,
      data: { id: result.insertId },
    });
  } catch (error) {
    console.error("Error creating record:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create record" },
      { status: 500 }
    );
  }
}
