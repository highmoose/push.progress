"use client";

import { useState } from "react";
import { createExercise } from "@/hooks/useExercises";
import { MUSCLE_GROUPS, EXERCISE_TYPES } from "@/lib/constants";
import { Button, Input, Select, SelectItem } from "@heroui/react";

export default function AddExerciseModal({ user, onClose, onSuccess }) {
  const [title, setTitle] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("");
  const [type, setType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setTouched(true);

    if (!title || !muscleGroup || !type) {
      setError("All fields are required");
      return;
    }

    try {
      setIsSubmitting(true);
      await createExercise({
        title,
        muscleGroup,
        type,
        userId: user.id,
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create exercise");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-[#0a0a0a] p-6 shadow-[0_0_64px_0_rgba(255,255,255,0.12)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white font-[family-name:var(--font-tektur)]">
            Add New Exercise
          </h2>
          <p className="text-xs text-gray-500">
            Create an exercise that both users can use
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <Input
            type="text"
            variant="bordered"
            label="Exercise Name"
            placeholder="e.g., Bench Press"
            value={title}
            onValueChange={setTitle}
            isInvalid={touched && !title}
          />

          {/* Muscle Group */}
          <Select
            label="Muscle Group"
            variant="bordered"
            placeholder="Select muscle group..."
            selectedKeys={muscleGroup ? [muscleGroup] : []}
            onSelectionChange={(keys) =>
              setMuscleGroup(Array.from(keys)[0] || "")
            }
            isInvalid={touched && !muscleGroup}
          >
            {MUSCLE_GROUPS.map((group) => (
              <SelectItem key={group} value={group}>
                {group.charAt(0).toUpperCase() + group.slice(1)}
              </SelectItem>
            ))}
          </Select>

          {/* Type */}
          <Select
            label="Exercise Type"
            variant="bordered"
            placeholder="Select type..."
            selectedKeys={type ? [type] : []}
            onSelectionChange={(keys) => setType(Array.from(keys)[0] || "")}
            isInvalid={touched && !type}
          >
            {EXERCISE_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </SelectItem>
            ))}
          </Select>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg border border-red-900/30 bg-red-950/20 px-4 py-2">
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="bordered"
              onPress={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              color="primary"
              isDisabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Creating..." : "Create Exercise"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
