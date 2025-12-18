import { query } from "@/lib/db";
import { NextResponse } from "next/server";

// PUT - Update existing record
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const { weightKg, reps, recordDate, notes } = await request.json();

    if (!weightKg || !reps || !recordDate) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    await query(
      "UPDATE exercise_records SET weight_kg = ?, reps = ?, record_date = ?, notes = ? WHERE id = ?",
      [weightKg, reps, recordDate, notes || null, id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating record:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update record" },
      { status: 500 }
    );
  }
}

// DELETE - Delete record
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    await query("DELETE FROM exercise_records WHERE id = ?", [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting record:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete record" },
      { status: 500 }
    );
  }
}
