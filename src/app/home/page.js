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
import LineChart from "@/components/LineChart";
import LottieSpinner from "@/components/LottieSpinner";
import Image from "next/image";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("muscle"); // 'muscle' or 'type'
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [myListOnly, setMyListOnly] = useState(true);
  const [dateFilter, setDateFilter] = useState("30");
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
      <header className="sticky top-0 z-40  border-[#2a2a2a] bg-[#0a0a0a]/95 backdrop-blur-sm">
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
            className="text-gray-400 hover:text-white transition-colors mt-0.5"
            title="Logout"
          >
            <i className="bx bx-log-out text-2xl text-gray-500"></i>
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="sticky top-[60px] z-30 border-b border-[#2a2a2a] bg-[#0a0a0a]/60 backdrop-blur-lg px-4 py-4 space-y-3">
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

        {/* Filters Row */}
        <div className="flex gap-2">
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

          {/* Date Filter Dropdown */}
          <Select
            selectedKeys={[dateFilter]}
            defaultSelectedKeys={["30"]}
            onChange={(e) => setDateFilter(e.target.value)}
            variant="bordered"
            disallowEmptySelection
            classNames={{
              trigger:
                "border-[#2a2a2a] bg-[#0f0f0f] hover:border-gray-600 data-[hover=true]:border-gray-600",
              value: "text-gray-200 font-[family-name:var(--font-tektur)]",
              popoverContent: "bg-[#1a1a1a] border border-[#2a2a2a]",
            }}
          >
            <SelectItem key="7" value="7" textValue="Last 7 Days">
              Last 7 Days
            </SelectItem>
            <SelectItem key="30" value="30" textValue="Last 30 Days">
              Last 30 Days
            </SelectItem>
            <SelectItem key="90" value="90" textValue="Last 90 Days">
              Last 90 Days
            </SelectItem>
            <SelectItem key="180" value="180" textValue="Last 180 Days">
              Last 180 Days
            </SelectItem>
            <SelectItem key="365" value="365" textValue="Last Year">
              Last Year
            </SelectItem>
            <SelectItem key="all" value="all" textValue="All Time">
              All Time
            </SelectItem>
          </Select>
        </div>
      </div>

      {/* Exercise List */}
      <div className="flex-1 overflow-y-auto px-4 py-6 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LottieSpinner size={50} opacity={0.15} />
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
                        userId={user.id}
                        dateFilter={dateFilter}
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
                userId={user.id}
                dateFilter={dateFilter}
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
      <div className="fixed bottom-6 right-4 flex flex-col gap-3">
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

function ExerciseCard({ exercise, onSelect, userId, dateFilter }) {
  const [chartData, setChartData] = useState([]);
  const [loadingChart, setLoadingChart] = useState(true);
  const [progressPercent, setProgressPercent] = useState(null);

  useEffect(() => {
    const loadChartData = async () => {
      try {
        setLoadingChart(true);
        const daysParam = dateFilter === "all" ? "" : `&days=${dateFilter}`;
        const response = await fetch(
          `/api/records?userId=${userId}&exerciseId=${exercise.id}${daysParam}`
        );
        const data = await response.json();
        if (data.success) {
          setChartData(data.data);

          // Calculate progress percentage
          if (data.data.length >= 2) {
            const firstRecord = data.data[0];
            const lastRecord = data.data[data.data.length - 1];
            const firstWeight = parseFloat(firstRecord.weight_kg);
            const lastWeight = parseFloat(lastRecord.weight_kg);
            const percentChange =
              ((lastWeight - firstWeight) / firstWeight) * 100;
            setProgressPercent(percentChange);
          } else if (data.data.length === 1) {
            setProgressPercent(0);
          } else {
            setProgressPercent(null);
          }
        }
      } catch (error) {
        console.error("Failed to load chart data:", error);
      } finally {
        setLoadingChart(false);
      }
    };

    loadChartData();
  }, [exercise.id, userId, dateFilter]);

  return (
    <Card
      isPressable
      onPress={onSelect}
      className="bg-[#0f0f0f] w-full border-none shadow-none"
    >
      <CardBody className="relative flex-row items-center gap-3 px-4 py-3">
        <div className="flex-1">
          <h3 className="font-medium text-[15px] text-white font-[family-name:var(--font-tektur)]">
            {exercise.title}
          </h3>
          <p className="text-xs text-gray-500 capitalize">
            {exercise.muscle_group} • {exercise.type}
          </p>
        </div>
        {!loadingChart && chartData.length > 0 && (
          <div className="absolute w-40 h-10 right-2 opacity-60">
            <LineChart data={chartData} mini={true} />
          </div>
        )}
        {!loadingChart && progressPercent !== null && progressPercent !== 0 && (
          <div
            className={`absolute flex items-center bottom-2 right-2 text-[11px] shadow-[0px_0px_20px_10px_rgba(15,15,15,0.5)] bg-[#0f0f0f]/50 text-zinc-600`}
          >
            <div>
              {progressPercent > 0 ? (
                <i className="bx bx-up-arrow-alt text-[14px] leading-none"></i>
              ) : (
                <i className="bx bx-down-arrow-alt text-[14px] leading-none"></i>
              )}
            </div>
            <span className="leading-none mb-1">
              {progressPercent % 1 === 0
                ? progressPercent.toFixed(0)
                : progressPercent.toFixed(1)}
              %{" "}
            </span>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
