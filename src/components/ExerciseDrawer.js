"use client";

import { useState, useEffect } from "react";
import {
  fetchRecords,
  createRecord,
  updateRecord,
  deleteRecord,
} from "@/hooks/useRecords";
import {
  DATE_FILTERS,
  DATE_FILTER_LABELS,
  DATE_FILTER_DAYS,
} from "@/lib/constants";
import LineChart from "./LineChart";
import { Button, Input, Switch, Tabs, Tab, DatePicker } from "@heroui/react";
import { parseDate, today } from "@internationalized/date";

export default function ExerciseDrawer({ exercise, user, onClose, onUpdate }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState(DATE_FILTERS.LAST_30_DAYS);
  const [showOtherUser, setShowOtherUser] = useState(false);
  const [otherUserRecords, setOtherUserRecords] = useState([]);
  const [activeTab, setActiveTab] = useState("chart");
  const [editingRecord, setEditingRecord] = useState(null);
  const [deletingRecord, setDeletingRecord] = useState(null);
  const [errorModal, setErrorModal] = useState({ show: false, message: "" });

  // Add record form
  const [weightKg, setWeightKg] = useState("");
  const [reps, setReps] = useState("");
  const [recordDate, setRecordDate] = useState(today("UTC"));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);

  const otherUserId = user.username === "Adam" ? 2 : 1;

  useEffect(() => {
    loadRecords();
  }, [dateFilter]);

  useEffect(() => {
    if (showOtherUser) {
      loadOtherUserRecords();
    }
  }, [showOtherUser, dateFilter]);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const days = DATE_FILTER_DAYS[dateFilter];
      const data = await fetchRecords(user.id, exercise.id, days);
      setRecords(data);
    } catch (error) {
      console.error("Failed to load records:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadOtherUserRecords = async () => {
    try {
      const days = DATE_FILTER_DAYS[dateFilter];
      const data = await fetchRecords(otherUserId, exercise.id, days);
      setOtherUserRecords(data);
    } catch (error) {
      console.error("Failed to load other user records:", error);
    }
  };

  const handleAddRecord = async (e) => {
    e.preventDefault();

    setTouched(true);

    // Parse values and validate
    const weight = parseFloat(weightKg);
    const repCount = parseInt(reps);

    // Check if values are valid numbers (allows 0)
    if (isNaN(weight) || weight < 0 || isNaN(repCount) || repCount < 0) return;

    try {
      setIsSubmitting(true);
      await createRecord({
        userId: user.id,
        exerciseId: exercise.id,
        weightKg: weight,
        reps: repCount,
        recordDate: recordDate.toString(),
      });

      setWeightKg("");
      setReps("");
      setRecordDate(today("UTC"));
      setTouched(false);
      loadRecords();
      onUpdate();
    } catch (error) {
      console.error("Failed to add record:", error);
      setErrorModal({
        show: true,
        message: "Failed to add record. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRecord = async (recordId) => {
    try {
      await deleteRecord(recordId);
      setDeletingRecord(null);
      loadRecords();
      onUpdate();
    } catch (error) {
      console.error("Failed to delete record:", error);
      setErrorModal({
        show: true,
        message: "Failed to delete record. Please try again.",
      });
    }
  };

  const handleUpdateRecord = async (recordId, updatedData) => {
    try {
      await updateRecord(recordId, updatedData);
      setEditingRecord(null);
      loadRecords();
      onUpdate();
    } catch (error) {
      console.error("Failed to update record:", error);
      setErrorModal({
        show: true,
        message: "Failed to update record. Please try again.",
      });
    }
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
        {/* Header */}
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-start justify-between mb-1">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-white font-[family-name:var(--font-tektur)]">
                {exercise.title}
              </h2>
              <p className="text-xs text-gray-500 capitalize">
                {exercise.muscle_group} • {exercise.type}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors -mt-1 ml-2"
            >
              <i className="bx bx-x text-2xl"></i>
            </button>
          </div>
        </div>

        {/* Date Filter - Only show on chart view */}
        {activeTab === "chart" && (
          <div className="flex justify-center px-4 pb-1.5 mt-1.5">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {Object.entries(DATE_FILTER_LABELS).map(([key, label]) => (
                <Button
                  key={key}
                  size="sm"
                  variant={dateFilter === key ? "solid" : "bordered"}
                  onPress={() => setDateFilter(key)}
                  className={`whitespace-nowrap font-[family-name:var(--font-tektur)] text-[11px] ${
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
        )}

        {/* Compare Toggle and Tabs - Only show on chart view */}
        {activeTab === "chart" && (
          <div className="px-4 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">
                Compare with {user.username === "Adam" ? "Cory" : "Adam"}
              </span>
              <Switch
                isSelected={showOtherUser}
                onValueChange={setShowOtherUser}
                size="sm"
              />
            </div>
            <Tabs
              selectedKey={activeTab}
              onSelectionChange={setActiveTab}
              size="sm"
              color="primary"
              variant="solid"
              classNames={{
                tabList: "bg-[#0f0f0f] p-1 gap-1",
                tab: "px-3 py-1.5",
              }}
            >
              <Tab
                key="chart"
                title={<i className="bx bx-line-chart text-lg"></i>}
              />
              <Tab
                key="list"
                title={<i className="bx bx-list-ul text-lg"></i>}
              />
            </Tabs>
          </div>
        )}

        {/* Tabs only - Show on list view */}
        {activeTab === "list" && (
          <div className="px-4 pb-4 -mt-3 flex justify-end">
            <Tabs
              selectedKey={activeTab}
              onSelectionChange={setActiveTab}
              size="sm"
              color="primary"
              variant="solid"
              classNames={{
                tabList: "bg-[#0f0f0f] p-1 gap-1",
                tab: "px-3 py-1.5",
              }}
            >
              <Tab
                key="chart"
                title={<i className="bx bx-line-chart text-lg"></i>}
              />
              <Tab
                key="list"
                title={<i className="bx bx-list-ul text-lg"></i>}
              />
            </Tabs>
          </div>
        )}

        {/* Chart View */}
        {activeTab === "chart" && (
          <div className="px-4 pb-6">
            <div className="rounded-lg bg-[#0f0f0f] min-h-[350px] ">
              {!loading && records.length === 0 ? (
                <div className="flex h-[330px] items-center justify-center">
                  <p className="text-sm text-gray-500">
                    No data yet. Add your first record below!
                  </p>
                </div>
              ) : (
                <>
                  {/* Stats Section */}
                  {records.length > 0 && (
                    <div className="grid grid-cols-3 pt-3 px-6">
                      <div className="text-center flex items-center gap-1 mx-auto">
                        <p className="text-[11px] text-zinc-500">Progress</p>
                        <p
                          className={`text-[11px] flex items-center ${(() => {
                            const sortedRecords = [...records].sort(
                              (a, b) =>
                                new Date(a.record_date) -
                                new Date(b.record_date)
                            );
                            const firstWeight = parseFloat(
                              sortedRecords[0].weight_kg
                            );
                            const lastWeight = parseFloat(
                              sortedRecords[sortedRecords.length - 1].weight_kg
                            );
                            const progress =
                              ((lastWeight - firstWeight) / firstWeight) * 100;
                            return progress >= 0
                              ? "text-[#D0F500]"
                              : "text-red-500";
                          })()}`}
                        >
                          {(() => {
                            const sortedRecords = [...records].sort(
                              (a, b) =>
                                new Date(a.record_date) -
                                new Date(b.record_date)
                            );
                            const firstWeight = parseFloat(
                              sortedRecords[0].weight_kg
                            );
                            const lastWeight = parseFloat(
                              sortedRecords[sortedRecords.length - 1].weight_kg
                            );
                            const progress =
                              ((lastWeight - firstWeight) / firstWeight) * 100;
                            return (
                              <>
                                {progress >= 0 ? (
                                  <i className="bx bx-up-arrow-alt text-[14px] leading-none pb-[1px]"></i>
                                ) : (
                                  <i className="bx bx-down-arrow-alt text-[14px] leading-none pb-[1px]"></i>
                                )}
                                {progress.toFixed(1)}%
                              </>
                            );
                          })()}
                        </p>
                      </div>
                      <div className="text-center flex items-center gap-1 mx-auto">
                        <p className="text-[11px] text-zinc-600">Current</p>
                        <p className="text-[11px] text-white">
                          {" "}
                          {(() => {
                            const sortedRecords = [...records].sort(
                              (a, b) =>
                                new Date(a.record_date) -
                                new Date(b.record_date)
                            );
                            return parseFloat(
                              sortedRecords[sortedRecords.length - 1].weight_kg
                            );
                          })()}{" "}
                          KG
                        </p>
                      </div>
                      <div className="text-center flex items-center gap-1 mx-auto">
                        <p className="text-[11px] text-zinc-500">Workouts</p>
                        <p className="text-[11px] text-white">
                          {" "}
                          {records.length}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Chart */}
                  <LineChart
                    key={`chart-${activeTab}-${dateFilter}`}
                    data={records}
                    otherData={showOtherUser ? otherUserRecords : null}
                    userName={user.username}
                    otherUserName={user.username === "Adam" ? "Cory" : "Adam"}
                    loading={loading}
                  />
                </>
              )}
            </div>
          </div>
        )}

        {/* List View */}
        {activeTab === "list" && (
          <div className="px-4 pb-6">
            <div className="h-[350px] overflow-y-auto relative">
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                  <LottieSpinner size={120} opacity={0.15} />
                </div>
              )}
              {records.length === 0 ? (
                <div className="flex h-[150px] items-center justify-center">
                  <p className="text-sm text-gray-500">
                    No records yet. Add your first record below!
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {records
                    .sort(
                      (a, b) =>
                        new Date(b.record_date) - new Date(a.record_date)
                    )
                    .map((record) => (
                      <RecordItem
                        key={record.id}
                        record={record}
                        onEdit={() => setEditingRecord(record)}
                        onDelete={() => setDeletingRecord(record)}
                      />
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add Record Form */}
        <div className="px-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Add New Record
          </h3>
          <form onSubmit={handleAddRecord} className="space-y-3">
            <div className="grid grid-cols-5 gap-3">
              <Input
                variant="bordered"
                type="number"
                label="Weight (KG)"
                placeholder="0.0"
                value={weightKg}
                onValueChange={setWeightKg}
                step="0.5"
                isInvalid={touched && weightKg === ""}
                className="col-span-2"
              />
              <Input
                variant="bordered"
                type="number"
                label="Reps"
                placeholder="0"
                value={reps}
                onValueChange={setReps}
                isInvalid={touched && reps === ""}
                className="col-span-1"
              />

              <DatePicker
                variant="bordered"
                label="Date"
                value={recordDate}
                onChange={setRecordDate}
                className="col-span-2"
                showMonthAndYearPickers
                granularity="day"
                locale="en-GB"
                classNames={{
                  base: "cursor-pointer",
                  inputWrapper: "cursor-pointer",
                  input: "cursor-pointer",
                }}
              />
            </div>

            <Button
              type="submit"
              color="primary"
              isDisabled={isSubmitting}
              className="w-full"
            >
              <i className="bx bx-plus text-lg"></i>

              <p className="mt-0.5">
                {isSubmitting ? "Adding..." : "Add Record"}
              </p>
            </Button>
          </form>
        </div>
      </div>

      {/* Edit Record Modal */}
      {editingRecord && (
        <EditRecordModal
          record={editingRecord}
          onClose={() => setEditingRecord(null)}
          onSave={(data) => handleUpdateRecord(editingRecord.id, data)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingRecord && (
        <DeleteConfirmModal
          record={deletingRecord}
          onClose={() => setDeletingRecord(null)}
          onConfirm={() => handleDeleteRecord(deletingRecord.id)}
        />
      )}

      {/* Error Modal */}
      {errorModal.show && (
        <ErrorModal
          message={errorModal.message}
          onClose={() => setErrorModal({ show: false, message: "" })}
        />
      )}
    </div>
  );
}

function RecordItem({ record, onEdit, onDelete }) {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#0f0f0f] hover:bg-[#1a1a1a] transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-white text-[15px] tracking-wide ">
              <span className="text-primary ">{record.weight_kg} KG</span> ×{" "}
              {record.reps} <span>Reps</span>
            </p>
            <p className="text-xs text-gray-500 -mt-[1px]">
              {formatDate(record.record_date)}
            </p>
          </div>
        </div>
      </div>
      <div className="flex ">
        <Button
          isIconOnly
          size="sm"
          variant="light"
          onPress={onEdit}
          className="text-gray-400 hover:text-white"
        >
          <i className="bx bx-pencil text-[16px]"></i>
        </Button>
        <Button
          isIconOnly
          size="sm"
          variant="light"
          onPress={onDelete}
          className="text-gray-400 hover:text-red-400"
        >
          <i className="bx bx-trash text-[16px]"></i>
        </Button>
      </div>
    </div>
  );
}

function EditRecordModal({ record, onClose, onSave }) {
  const [weightKg, setWeightKg] = useState(record.weight_kg);
  const [reps, setReps] = useState(record.reps);
  const [recordDate, setRecordDate] = useState(
    parseDate(record.record_date.split("T")[0])
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      await onSave({
        weightKg: parseFloat(weightKg),
        reps: parseInt(reps),
        recordDate: recordDate.toString(),
      });
      onClose();
    } catch (error) {
      console.error("Failed to update record:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-[#0a0a0a] p-6 shadow-[0_0_64px_0_rgba(255,255,255,0.12)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white font-[family-name:var(--font-tektur)]">
            Edit Record
          </h2>
          <p className="text-xs text-gray-500">Update your workout record</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              variant="bordered"
              type="number"
              label="Weight (KG)"
              placeholder="0.0"
              value={weightKg}
              onValueChange={setWeightKg}
              step="0.5"
            />
            <Input
              variant="bordered"
              type="number"
              label="Reps"
              placeholder="0"
              value={reps}
              onValueChange={setReps}
            />
          </div>

          <DatePicker
            variant="bordered"
            label="Date"
            value={recordDate}
            onChange={setRecordDate}
            showMonthAndYearPickers
            granularity="day"
            locale="en-GB"
            classNames={{
              base: "cursor-pointer",
              inputWrapper: "cursor-pointer",
              input: "cursor-pointer",
            }}
          />

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
              {isSubmitting ? "Updating..." : "Update Record"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ record, onClose, onConfirm }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsDeleting(true);
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("Failed to delete record:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-[#0a0a0a] p-6 shadow-[0_0_64px_0_rgba(255,255,255,0.12)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white font-[family-name:var(--font-tektur)]">
            Delete Record?
          </h2>
          <p className="text-xs text-gray-500 mt-2">
            Are you sure you want to delete this record? This action cannot be
            undone.
          </p>
        </div>

        <div className="mb-6 p-3 rounded-lg bg-[#0f0f0f]">
          <p className="text-white font-medium font-[family-name:var(--font-tektur)]">
            <span className="text-primary">{record.weight_kg} KG</span> ×{" "}
            {record.reps} Reps
          </p>
          <p className="text-xs text-gray-500">
            {formatDate(record.record_date)}
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="bordered"
            onPress={onClose}
            className="flex-1"
            isDisabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            color="danger"
            onPress={handleConfirm}
            className="flex-1"
            isDisabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ErrorModal({ message, onClose }) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-[#0a0a0a] p-6 shadow-[0_0_64px_0_rgba(255,255,255,0.12)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white font-[family-name:var(--font-tektur)]">
            Error
          </h2>
          <p className="text-xs text-gray-500 mt-2">{message}</p>
        </div>

        <Button color="primary" onPress={onClose} className="w-full">
          OK
        </Button>
      </div>
    </div>
  );
}
