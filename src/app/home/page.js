"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Select,
  SelectItem,
  Card,
  CardBody,
  Spinner,
} from "@heroui/react";
import { fetchExercises } from "@/hooks/useExercises";
import { MUSCLE_GROUPS, EXERCISE_TYPES } from "@/lib/constants";
import ExerciseDrawer from "@/components/ExerciseDrawer";
import ComparisonDrawer from "@/components/ComparisonDrawer";
import AddExerciseModal from "@/components/AddExerciseModal";
import ManageExercisesDrawer from "@/components/ManageExercisesDrawer";
import Image from "next/image";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("muscle"); // 'muscle' or 'type'
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [myListOnly, setMyListOnly] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [showManageExercises, setShowManageExercises] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/");
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  useEffect(() => {
    if (user) {
      loadExercises();
    }
  }, [user, selectedFilter, filterType, myListOnly]);

  const loadExercises = async () => {
    try {
      setLoading(true);
      const filters = { myListOnly };

      if (selectedFilter !== "all") {
        if (filterType === "muscle") {
          filters.muscleGroup = selectedFilter;
        } else {
          filters.type = selectedFilter;
        }
      }

      const data = await fetchExercises(user.id, filters);
      setExercises(data);
    } catch (error) {
      console.error("Failed to load exercises:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/");
  };

  const groupedExercises = () => {
    const groups = {};
    const filterOptions =
      filterType === "muscle" ? MUSCLE_GROUPS : EXERCISE_TYPES;

    filterOptions.forEach((option) => {
      groups[option] = exercises.filter((ex) =>
        filterType === "muscle"
          ? ex.muscle_group === option
          : ex.type === option
      );
    });

    return groups;
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0a] font-[family-name:var(--font-roboto)]">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#2a2a2a] bg-[#0a0a0a]/95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Image
              src="/images/logo/push-logo-w.svg"
              alt="Push Progress Logo"
              width={28}
              height={28}
            />
            <div>
              {/* <h1 className="text-xl font-semibold text-white font-[family-name:var(--font-tektur)]">
                Push Progress
              </h1> */}
              <p className="text-sm text-gray-500">Welcome, {user.username}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-white transition-colors"
            title="Logout"
          >
            <i className="bx bx-log-out text-2xl"></i>
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="sticky top-[73px] z-30 border-b border-[#2a2a2a] bg-[#0a0a0a]/95 backdrop-blur-sm px-6 py-4 space-y-3">
        {/* Filter Type Toggle */}
        <div className="flex gap-2">
          <Button
            onPress={() => {
              setFilterType("muscle");
              setSelectedFilter("all");
            }}
            variant={filterType === "muscle" ? "solid" : "bordered"}
            color={filterType === "muscle" ? "primary" : "default"}
            className={`flex-1 font-[family-name:var(--font-tektur)] ${
              filterType === "muscle"
                ? ""
                : "border-[#2a2a2a] bg-transparent text-gray-400"
            }`}
          >
            Muscle Group
          </Button>
          <Button
            onPress={() => {
              setFilterType("type");
              setSelectedFilter("all");
            }}
            variant={filterType === "type" ? "solid" : "bordered"}
            color={filterType === "type" ? "primary" : "default"}
            className={`flex-1 font-[family-name:var(--font-tektur)] ${
              filterType === "type"
                ? ""
                : "border-[#2a2a2a] bg-transparent text-gray-400"
            }`}
          >
            Type
          </Button>
        </div>

        {/* Manage Exercises Button */}
        <Button
          onPress={() => setShowManageExercises(true)}
          variant="bordered"
          className="w-full border-[#2a2a2a] bg-[#0f0f0f] hover:border-gray-600"
        >
          <i className="bx bx-list-ul text-lg"></i>
          <span className="font-[family-name:var(--font-tektur)]">
            Manage My Exercise List
          </span>
        </Button>

        {/* Specific Filter Dropdown */}
        <Select
          selectedKeys={selectedFilter ? [selectedFilter] : ["all"]}
          defaultSelectedKeys={["all"]}
          onChange={(e) => setSelectedFilter(e.target.value)}
          variant="bordered"
          disallowEmptySelection
          classNames={{
            trigger:
              "border-[#2a2a2a] bg-[#0f0f0f] hover:border-gray-600 data-[hover=true]:border-gray-600",
            value:
              "text-gray-200 font-[family-name:var(--font-tektur)] capitalize",
            popoverContent: "bg-[#1a1a1a] border border-[#2a2a2a]",
          }}
        >
          <SelectItem
            key="all"
            value="all"
            textValue="All Muscle Groups"
            className="capitalize"
          >
            All {filterType === "muscle" ? "Muscle Groups" : "Types"}
          </SelectItem>
          {(filterType === "muscle" ? MUSCLE_GROUPS : EXERCISE_TYPES).map(
            (option) => (
              <SelectItem
                key={option}
                value={option}
                className="capitalize"
                textValue={option.charAt(0).toUpperCase() + option.slice(1)}
              >
                {option}
              </SelectItem>
            )
          )}
        </Select>
      </div>

      {/* Exercise List */}
      <div className="flex-1 overflow-y-auto px-6 py-6 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-gray-500">Loading exercises...</p>
          </div>
        ) : selectedFilter === "all" ? (
          Object.entries(groupedExercises()).map(
            ([group, exs]) =>
              exs.length > 0 && (
                <div key={group} className="mb-6">
                  <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    {group}
                  </h2>
                  <div className="space-y-2">
                    {exs.map((exercise) => (
                      <ExerciseCard
                        key={exercise.id}
                        exercise={exercise}
                        onSelect={() => setSelectedExercise(exercise)}
                      />
                    ))}
                  </div>
                </div>
              )
          )
        ) : (
          <div className="space-y-2">
            {exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onSelect={() => setSelectedExercise(exercise)}
              />
            ))}
          </div>
        )}

        {!loading && exercises.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-gray-500 mb-4">No exercises found</p>
            <Button
              onPress={() => setShowAddExercise(true)}
              color="primary"
              variant="light"
              size="sm"
            >
              Add your first exercise
            </Button>
          </div>
        )}
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3">
        <Button
          isIconOnly
          onPress={() => setShowComparison(true)}
          variant="bordered"
          className="w-12 h-12 rounded-lg  bg-primary"
          title="Compare"
        >
          <i className="bx bx-group text-2xl text-black"></i>
        </Button>
      </div>

      {/* Drawers and Modals */}
      {selectedExercise && (
        <ExerciseDrawer
          exercise={selectedExercise}
          user={user}
          onClose={() => setSelectedExercise(null)}
          onUpdate={loadExercises}
        />
      )}

      {showComparison && (
        <ComparisonDrawer
          user={user}
          onClose={() => setShowComparison(false)}
        />
      )}

      {showAddExercise && (
        <AddExerciseModal
          user={user}
          onClose={() => setShowAddExercise(false)}
          onSuccess={loadExercises}
        />
      )}

      {showManageExercises && (
        <ManageExercisesDrawer
          user={user}
          onClose={() => setShowManageExercises(false)}
          onUpdate={loadExercises}
        />
      )}
    </div>
  );
}

function ExerciseCard({ exercise, onSelect }) {
  return (
    <Card
      isPressable
      onPress={onSelect}
      className="bg-[#0f0f0f] border border-[#2a2a2a] w-full"
    >
      <CardBody className="flex-row items-center gap-3 px-4 py-3">
        <div className="flex-1">
          <h3 className="font-medium text-white font-[family-name:var(--font-tektur)]">
            {exercise.title}
          </h3>
          <p className="text-xs text-gray-500 capitalize">
            {exercise.muscle_group} • {exercise.type}
          </p>
        </div>
      </CardBody>
    </Card>
  );
}
