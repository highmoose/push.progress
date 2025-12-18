"use client";

import { useState, useEffect } from "react";
import { fetchExercises } from "@/hooks/useExercises";
import { fetchComparisonData } from "@/hooks/useComparison";
import {
  MUSCLE_GROUPS,
  DATE_FILTERS,
  DATE_FILTER_LABELS,
  DATE_FILTER_DAYS,
} from "@/lib/constants";
import LineChart from "./LineChart";
import { Button, Select, SelectItem } from "@heroui/react";

export default function ComparisonDrawer({ user, onClose }) {
  const [comparisonType, setComparisonType] = useState("exercise"); // 'exercise' or 'muscle'
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState("");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("");
  const [dateFilter, setDateFilter] = useState(DATE_FILTERS.LAST_30_DAYS);
  const [loading, setLoading] = useState(false);
  const [comparisonData, setComparisonData] = useState(null);

  const otherUserId = user.username === "Adam" ? 2 : 1;
  const otherUserName = user.username === "Adam" ? "Cory" : "Adam";

  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    if (
      (comparisonType === "exercise" && selectedExercise) ||
      (comparisonType === "muscle" && selectedMuscleGroup)
    ) {
      loadComparisonData();
    }
  }, [comparisonType, selectedExercise, selectedMuscleGroup, dateFilter]);

  const loadExercises = async () => {
    try {
      const data = await fetchExercises(user.id, { myListOnly: true });
      setExercises(data);
      if (data.length > 0) {
        setSelectedExercise(data[0].id.toString());
      }
    } catch (error) {
      console.error("Failed to load exercises:", error);
    }
  };

  const loadComparisonData = async () => {
    try {
      setLoading(true);
      const days = DATE_FILTER_DAYS[dateFilter];
      const options = { days };

      if (comparisonType === "exercise") {
        options.exerciseId = parseInt(selectedExercise);
      } else {
        options.muscleGroup = selectedMuscleGroup;
      }

      const data = await fetchComparisonData(user.id, otherUserId, options);
      setComparisonData(data);
    } catch (error) {
      console.error("Failed to load comparison data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-h-[90vh] overflow-y-auto rounded-t-2xl bg-[#0a0a0a] pb-6 shadow-[0_-24px_64px_0_rgba(255,255,255,0.12)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="h-1 w-12 rounded-full bg-gray-700" />
        </div>

        {/* Header */}
        <div className="px-6 pb-4">
          <h2 className="text-2xl font-semibold text-white font-[family-name:var(--font-tektur)]">
            Compare Progress
          </h2>
          <p className="text-sm text-gray-500">
            {user.username} vs {otherUserName}
          </p>
        </div>

        {/* Comparison Type Toggle */}
        <div className="px-6 pb-4">
          <div className="flex gap-2">
            <Button
              variant={comparisonType === "exercise" ? "solid" : "bordered"}
              onPress={() => setComparisonType("exercise")}
              className="flex-1"
            >
              Single Exercise
            </Button>
            <Button
              variant={comparisonType === "muscle" ? "solid" : "bordered"}
              onPress={() => setComparisonType("muscle")}
              className="flex-1"
            >
              Muscle Group Average
            </Button>
          </div>
        </div>

        {/* Selection */}
        <div className="px-6 pb-4">
          {comparisonType === "exercise" ? (
            <Select
              label="Select Exercise"
              variant="bordered"
              selectedKeys={[selectedExercise]}
              onSelectionChange={(keys) =>
                setSelectedExercise(Array.from(keys)[0])
              }
            >
              {exercises.map((exercise) => (
                <SelectItem key={exercise.id} value={exercise.id}>
                  {exercise.title}
                </SelectItem>
              ))}
            </Select>
          ) : (
            <Select
              label="Select Muscle Group"
              variant="bordered"
              placeholder="Select a muscle group..."
              selectedKeys={selectedMuscleGroup ? [selectedMuscleGroup] : []}
              onSelectionChange={(keys) =>
                setSelectedMuscleGroup(Array.from(keys)[0] || "")
              }
            >
              {MUSCLE_GROUPS.map((group) => (
                <SelectItem key={group} value={group}>
                  {group.charAt(0).toUpperCase() + group.slice(1)}
                </SelectItem>
              ))}
            </Select>
          )}
        </div>

        {/* Date Filter */}
        <div className="px-6 pb-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {Object.entries(DATE_FILTER_LABELS).map(([key, label]) => (
              <Button
                key={key}
                size="sm"
                variant={dateFilter === key ? "solid" : "bordered"}
                onPress={() => setDateFilter(key)}
                className={`whitespace-nowrap  font-[family-name:var(--font-tektur)] ${
                  dateFilter === key
                    ? "bg-[#1a1a1a] border-gray-600 rounded-full"
                    : "border-[#2a2a2a] text-gray-400 rounded-full"
                }`}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Comparison Chart */}
        <div className="px-6">
          <div className="rounded-lg bg-[#0f0f0f] p-4 pb-6">
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <p className="text-sm text-gray-500">Loading comparison...</p>
              </div>
            ) : !comparisonData ||
              (!selectedExercise && !selectedMuscleGroup) ? (
              <div className="flex h-64 items-center justify-center">
                <p className="text-sm text-gray-500">
                  {comparisonType === "muscle"
                    ? "Select a muscle group to compare"
                    : "Select an exercise to compare"}
                </p>
              </div>
            ) : comparisonData.user1.length === 0 &&
              comparisonData.user2.length === 0 ? (
              <div className="flex h-64 items-center justify-center">
                <p className="text-sm text-gray-500">
                  No data available for comparison
                </p>
              </div>
            ) : (
              <LineChart
                data={comparisonData.user1}
                otherData={comparisonData.user2}
                userName={user.username}
                otherUserName={otherUserName}
                isAverage={comparisonType === "muscle"}
              />
            )}
          </div>

          {comparisonData &&
            (comparisonData.user1.length > 0 ||
              comparisonData.user2.length > 0) && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg  bg-[#0f0f0f] p-3">
                  <p className="text-xs text-gray-500">
                    {user.username} Records
                  </p>
                  <p className="text-lg font-semibold text-primary font-[family-name:var(--font-tektur)]">
                    {comparisonData.user1.length}
                  </p>
                </div>
                <div className="rounded-lg  bg-[#0f0f0f] p-3">
                  <p className="text-xs text-gray-500">
                    {otherUserName} Records
                  </p>
                  <p className="text-lg font-semibold text-[#686868font-[family-name:var(--font-tektur)]">
                    {comparisonData.user2.length}
                  </p>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
