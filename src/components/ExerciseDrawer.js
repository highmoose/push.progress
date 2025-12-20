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

  // Add record form
  const [weightKg, setWeightKg] = useState("");
  const [reps, setReps] = useState("");
  const [recordDate, setRecordDate] = useState(today("UTC"));
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    if (!weightKg || !reps) return;

    try {
      setIsSubmitting(true);
      await createRecord({
        userId: user.id,
        exerciseId: exercise.id,
        weightKg: parseFloat(weightKg),
        reps: parseInt(reps),
        recordDate: recordDate.toString(),
      });

      setWeightKg("");
      setReps("");
      setRecordDate(today("UTC"));
      loadRecords();
      onUpdate();
    } catch (error) {
      console.error("Failed to add record:", error);
      alert("Failed to add record");
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
      alert("Failed to delete record");
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
      alert("Failed to update record");
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
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="h-1 w-12 rounded-full bg-gray-700" />
        </div>

        {/* Header */}
        <div className="px-4">
          <h2 className="text-lg font-semibold text-white font-[family-name:var(--font-tektur)]">
            {exercise.title}
          </h2>
          <p className="text-xs text-gray-500 capitalize">
            {exercise.muscle_group} • {exercise.type}
          </p>
        </div>

        {/* Date Filter - Only show on chart view */}
        {activeTab === "chart" && (
          <div className="flex justify-center px-4 pb-2 mt-3">
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
            <div className="rounded-lg bg-[#0f0f0f] min-h-[330px] ">
              {loading ? (
                <div className="flex h-64 items-center justify-center">
                  <p className="text-sm text-gray-500">Loading chart...</p>
                </div>
              ) : records.length === 0 ? (
                <div className="flex h-[330px] items-center justify-center">
                  <p className="text-sm text-gray-500">
                    No data yet. Add your first record below!
                  </p>
                </div>
              ) : (
                <LineChart
                  data={records}
                  otherData={showOtherUser ? otherUserRecords : null}
                  userName={user.username}
                  otherUserName={user.username === "Adam" ? "Cory" : "Adam"}
                />
              )}
            </div>
          </div>
        )}

        {/* List View */}
        {activeTab === "list" && (
          <div className="px-4 pb-6">
            <div className=" max-h-[364px] overflow-y-auto">
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-gray-500">Loading records...</p>
                </div>
              ) : records.length === 0 ? (
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
                isRequired
                className="col-span-2"
              />
              <Input
                variant="bordered"
                type="number"
                label="Reps"
                placeholder="0"
                value={reps}
                onValueChange={setReps}
                isRequired
                className="col-span-1"
              />

              <DatePicker
                variant="bordered"
                label="Date"
                value={recordDate}
                onChange={setRecordDate}
                isRequired
                className="col-span-2"
                showMonthAndYearPickers
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
              <i className="bx bx-plus text-xl"></i>

              {isSubmitting ? "Adding..." : "Add Record"}
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
            <p className="text-white font-medium tracking-wide font-[family-name:var(--font-tektur)]">
              <span className="text-primary">{record.weight_kg} KG</span> ×{" "}
              {record.reps} Reps
            </p>
            <p className="text-xs text-gray-500">
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
          <h2 className="text-xl font-semibold text-white font-[family-name:var(--font-tektur)]">
            Edit Record
          </h2>
          <p className="text-sm text-gray-500">Update your workout record</p>
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
              isRequired
            />
            <Input
              variant="bordered"
              type="number"
              label="Reps"
              placeholder="0"
              value={reps}
              onValueChange={setReps}
              isRequired
            />
          </div>

          <DatePicker
            variant="bordered"
            label="Date"
            value={recordDate}
            onChange={setRecordDate}
            isRequired
            showMonthAndYearPickers
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
          <h2 className="text-xl font-semibold text-white font-[family-name:var(--font-tektur)]">
            Delete Record?
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            Are you sure you want to delete this record? This action cannot be
            undone.
          </p>
        </div>

        <div className="mb-6 p-3 rounded-lg bg-[#0f0f0f] border border-[#2a2a2a]">
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
