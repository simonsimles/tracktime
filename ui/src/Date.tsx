export const getWeekFromDate = function (d: Date) {
  // Use UTC constructors to avoid DST (CEST/CET) hour shifts changing
  // the millisecond difference between dates (which can make a day 23/25h).
  const endDate: Date = new Date(
    Date.UTC(
      d.getFullYear(),
      d.getMonth(),
      d.getDate() + 4 - (d.getDay() || 7),
    ),
  );
  const startDate: number = Date.UTC(endDate.getUTCFullYear(), 0, 1);
  const days = Math.floor((endDate.getTime() - startDate) / DAY_IN_SECONDS) + 1;
  return Math.ceil(days / 7);
};

export const DAY_IN_SECONDS = 24 * 60 * 60 * 1000;

export {};
