// Application Constants

export const MUSCLE_GROUPS = [
  "chest",
  "back",
  "shoulders",
  "biceps",
  "triceps",
  "forearms",
  "abs",
  "legs",
  "traps",
];

export const EXERCISE_TYPES = [
  "machine",
  "free weight",
  "bodyweight",
  "cable",
  "resistance band",
];

export const DATE_FILTERS = {
  ALL_TIME: "all_time",
  LAST_30_DAYS: "last_30_days",
  LAST_3_MONTHS: "last_3_months",
  LAST_YEAR: "last_year",
};

export const DATE_FILTER_LABELS = {
  [DATE_FILTERS.ALL_TIME]: "All Time",
  [DATE_FILTERS.LAST_30_DAYS]: "Last 30 Days",
  [DATE_FILTERS.LAST_3_MONTHS]: "Last 3 Months",
  [DATE_FILTERS.LAST_YEAR]: "Last Year",
};

export const DATE_FILTER_DAYS = {
  [DATE_FILTERS.ALL_TIME]: null,
  [DATE_FILTERS.LAST_30_DAYS]: 30,
  [DATE_FILTERS.LAST_3_MONTHS]: 90,
  [DATE_FILTERS.LAST_YEAR]: 365,
};
