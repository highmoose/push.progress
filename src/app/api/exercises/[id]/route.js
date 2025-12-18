import { query } from "@/lib/db";
import { NextResponse } from "next/server";

// DELETE - Soft delete exercise (requires confirmation)
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const { confirmTitle } = await request.json();

    // Get the exercise to verify the title
    const [exercise] = await query(
      "SELECT title FROM exercises WHERE id = ? AND is_deleted = 0",
      [id]
    );

    if (!exercise) {
      return NextResponse.json(
        { success: false, error: "Exercise not found" },
        { status: 404 }
      );
    }

    if (exercise.title !== confirmTitle) {
      return NextResponse.json(
        { success: false, error: "Title confirmation does not match" },
        { status: 400 }
      );
    }

    // Soft delete
    await query(
      "UPDATE exercises SET is_deleted = 1, deleted_at = NOW() WHERE id = ?",
      [id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting exercise:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete exercise" },
      { status: 500 }
    );
  }
}
