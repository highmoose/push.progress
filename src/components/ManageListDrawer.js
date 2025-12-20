"use client";

import { useState, useEffect } from "react";
import {
  fetchExercises,
  addExerciseToList,
  removeExerciseFromList,
} from "@/hooks/useExercises";
import { MUSCLE_GROUPS } from "@/lib/constants";
import { Button, Checkbox } from "@heroui/react";

export default function ManageExercisesDrawer({ user, onClose, onUpdate }) {
  const [allExercises, setAllExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExercises, setSelectedExercises] = useState(new Set());
  const [initialExercises, setInitialExercises] = useState(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAllExercises();
  }, []);

  const loadAllExercises = async () => {
    try {
      setLoading(true);
      const data = await fetchExercises(user.id, { myListOnly: false });
      setAllExercises(data);

      // Set initially selected exercises
      const initialSet = new Set(
        data.filter((ex) => ex.in_my_list).map((ex) => ex.id)
      );
      setSelectedExercises(initialSet);
      setInitialExercises(initialSet);
    } catch (error) {
      console.error("Failed to load exercises:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (exerciseId) => {
    setSelectedExercises((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(exerciseId)) {
        newSet.delete(exerciseId);
      } else {
        newSet.add(exerciseId);
      }
      return newSet;
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Find exercises to add (in selected but not in initial)
      const toAdd = [...selectedExercises].filter(
        (id) => !initialExercises.has(id)
      );

      // Find exercises to remove (in initial but not in selected)
      const toRemove = [...initialExercises].filter(
        (id) => !selectedExercises.has(id)
      );

      // Execute all add operations
      for (const exerciseId of toAdd) {
        await addExerciseToList(user.id, exerciseId);
      }

      // Execute all remove operations
      for (const exerciseId of toRemove) {
        await removeExerciseFromList(user.id, exerciseId);
      }

      onUpdate();
      onClose();
    } catch (error) {
      console.error("Failed to save exercise list:", error);
      alert("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const groupedExercises = () => {
    const groups = {};
    MUSCLE_GROUPS.forEach((group) => {
      groups[group] = allExercises.filter((ex) => ex.muscle_group === group);
    });
    return groups;
  };

  const hasChanges = () => {
    if (selectedExercises.size !== initialExercises.size) return true;
    for (const id of selectedExercises) {
      if (!initialExercises.has(id)) return true;
    }
    return false;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black/50"
      onClick={onClose}
      style={{ overscrollBehavior: "none" }}
    >
      <div
        className="w-full max-h-[90vh] overflow-y-auto rounded-t-2xl bg-[#0a0a0a] pb-6 shadow-[0_-24px_64px_0_rgba(255,255,255,0.12)]"
        onClick={(e) => e.stopPropagation()}
        style={{ overscrollBehavior: "contain" }}
      >
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="h-1 w-12 rounded-full bg-gray-700" />
        </div>

        {/* Header */}
        <div className="px-2 pb-4">
          <h2 className="text-2xl font-semibold text-white font-[family-name:var(--font-tektur)]">
            Manage My Exercise List
          </h2>
          <p className="text-sm text-gray-500">
            Select exercises to add to your list
          </p>
        </div>

        {/* Exercise List */}
        <div className="px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-gray-500">Loading exercises...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedExercises()).map(
                ([group, exercises]) =>
                  exercises.length > 0 && (
                    <div key={group}>
                      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        {group}
                      </h3>
                      <div className="space-y-2">
                        {exercises.map((exercise) => (
                          <div
                            key={exercise.id}
                            className="flex items-center gap-3 rounded-lg border border-[#2a2a2a] bg-[#0f0f0f] p-3 transition-all hover:border-gray-600"
                          >
                            <Checkbox
                              isSelected={selectedExercises.has(exercise.id)}
                              onValueChange={() => handleToggle(exercise.id)}
                              size="sm"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-white text-sm">
                                {exercise.title}
                              </p>
                              <p className="text-xs text-gray-500 capitalize">
                                {exercise.type}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 px-6 pt-4 bg-[#0a0a0a]">
          <div className="flex gap-3">
            <Button
              variant="bordered"
              onPress={onClose}
              className="flex-1"
              isDisabled={saving}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleSave}
              className="flex-1"
              isDisabled={!hasChanges() || saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
