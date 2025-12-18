"use client";

import { useState, useEffect } from "react";
import { Button, Checkbox, Spinner } from "@heroui/react";
import {
  fetchExercises,
  addExerciseToList,
  removeExerciseFromList,
} from "@/hooks/useExercises";
import { MUSCLE_GROUPS } from "@/lib/constants";
import AddExerciseModal from "./AddExerciseModal";

export default function ManageExercisesDrawer({ user, onClose, onUpdate }) {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState(new Set());
  const [initialSelection, setInitialSelection] = useState(new Set());
  const [showAddExercise, setShowAddExercise] = useState(false);

  useEffect(() => {
    loadAllExercises();
  }, [user]);

  const loadAllExercises = async () => {
    try {
      setLoading(true);
      // Fetch all exercises without filtering
      const data = await fetchExercises(user.id, { myListOnly: false });
      setExercises(data);

      // Track which exercises are currently in user's list
      const inListExercises = new Set(
        data.filter((ex) => ex.in_my_list).map((ex) => ex.id)
      );
      setSelectedExercises(inListExercises);
      setInitialSelection(new Set(inListExercises));
    } catch (error) {
      console.error("Failed to load exercises:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleExercise = (exerciseId) => {
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

  const handleSelectAll = (muscleGroup) => {
    const muscleExercises = exercises
      .filter((ex) => ex.muscle_group === muscleGroup)
      .map((ex) => ex.id);

    const allSelected = muscleExercises.every((id) =>
      selectedExercises.has(id)
    );

    setSelectedExercises((prev) => {
      const newSet = new Set(prev);
      if (allSelected) {
        // Deselect all in this group
        muscleExercises.forEach((id) => newSet.delete(id));
      } else {
        // Select all in this group
        muscleExercises.forEach((id) => newSet.add(id));
      }
      return newSet;
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Determine which exercises to add and remove
      const toAdd = Array.from(selectedExercises).filter(
        (id) => !initialSelection.has(id)
      );
      const toRemove = Array.from(initialSelection).filter(
        (id) => !selectedExercises.has(id)
      );

      // Execute all add/remove operations
      await Promise.all([
        ...toAdd.map((exerciseId) => addExerciseToList(user.id, exerciseId)),
        ...toRemove.map((exerciseId) =>
          removeExerciseFromList(user.id, exerciseId)
        ),
      ]);

      onUpdate();
      onClose();
    } catch (error) {
      console.error("Failed to save exercise list:", error);
    } finally {
      setSaving(false);
    }
  };

  const groupedExercises = () => {
    const groups = {};
    MUSCLE_GROUPS.forEach((group) => {
      groups[group] = exercises.filter((ex) => ex.muscle_group === group);
    });
    return groups;
  };

  const hasChanges = () => {
    if (selectedExercises.size !== initialSelection.size) return true;
    for (const id of selectedExercises) {
      if (!initialSelection.has(id)) return true;
    }
    return false;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#0a0a0a] flex flex-col shadow-[-24px_0_64px_0_rgba(255,255,255,0.12)]">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0a0a0a] px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold text-white font-[family-name:var(--font-tektur)]">
              Manage Exercise List
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <i className="bx bx-x text-2xl"></i>
            </button>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Select exercises to add to your list
          </p>
          <Button
            color="primary"
            onPress={() => setShowAddExercise(true)}
            className="w-full font-[family-name:var(--font-tektur)]"
          >
            <i className="bx bx-plus text-xl"></i>
            Add New Exercise
          </Button>
        </div>

        {/* Exercise List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedExercises()).map(
                ([group, exs]) =>
                  exs.length > 0 && (
                    <div key={group}>
                      {/* Muscle Group Header */}
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                          {group}
                        </h3>
                        <button
                          onClick={() => handleSelectAll(group)}
                          className="text-xs text-primary hover:text-blue-300 transition-colors"
                        >
                          {exs.every((ex) => selectedExercises.has(ex.id))
                            ? "Deselect All"
                            : "Select All"}
                        </button>
                      </div>

                      {/* Exercise Items */}
                      <div className="space-y-2">
                        {exs.map((exercise) => (
                          <label
                            key={exercise.id}
                            className="flex items-start gap-3 p-3 rounded-lg border border-[#2a2a2a] bg-[#0f0f0f] hover:border-gray-600 transition-colors cursor-pointer"
                          >
                            <Checkbox
                              isSelected={selectedExercises.has(exercise.id)}
                              onValueChange={() =>
                                handleToggleExercise(exercise.id)
                              }
                              className="mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-white text-sm font-[family-name:var(--font-tektur)]">
                                {exercise.title}
                              </p>
                              <p className="text-xs text-gray-500 capitalize">
                                {exercise.type}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )
              )}

              {exercises.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-sm text-gray-500 text-center">
                    No exercises available.
                    <br />
                    Create an exercise to get started.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[#0a0a0a] px-6 py-4">
          <div className="flex gap-3">
            <Button
              variant="bordered"
              onPress={onClose}
              className="flex-1 border-[#2a2a2a]"
              isDisabled={saving}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleSave}
              className="flex-1"
              isDisabled={saving || !hasChanges()}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
          {selectedExercises.size > 0 && (
            <p className="text-xs text-gray-500 text-center mt-3">
              {selectedExercises.size} exercise
              {selectedExercises.size !== 1 ? "s" : ""} selected
            </p>
          )}
        </div>
      </div>

      {/* Add Exercise Modal */}
      {showAddExercise && (
        <AddExerciseModal
          user={user}
          onClose={() => setShowAddExercise(false)}
          onSuccess={() => {
            loadAllExercises();
            onUpdate();
          }}
        />
      )}
    </>
  );
}
