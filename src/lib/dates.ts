export function formatDate(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(date);
}

export function inputDate(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toISOString().slice(0, 10);
}

type CalendarDate = {
  year: number;
  month: number;
  day: number;
};

function calendarDate(value: Date | string): CalendarDate | null {
  if (typeof value === "string") {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return {
        year: Number(match[1]),
        month: Number(match[2]),
        day: Number(match[3])
      };
    }
  }

  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return null;
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate()
  };
}

function toUtcDate(value: CalendarDate) {
  return new Date(Date.UTC(value.year, value.month - 1, value.day));
}

function addYearsClamped(value: CalendarDate, years: number) {
  const lastDay = new Date(Date.UTC(value.year + years, value.month, 0)).getUTCDate();
  return {
    year: value.year + years,
    month: value.month,
    day: Math.min(value.day, lastDay)
  };
}

function addMonthsClamped(value: CalendarDate, months: number) {
  const monthIndex = value.month - 1 + months;
  const year = value.year + Math.floor(monthIndex / 12);
  const month = ((monthIndex % 12) + 12) % 12 + 1;
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return { year, month, day: Math.min(value.day, lastDay) };
}

export function formatAgeAtDate(birthday: Date | string, target: Date | string) {
  const birth = calendarDate(birthday);
  const end = calendarDate(target);
  if (!birth || !end) return "";

  const birthTime = toUtcDate(birth).getTime();
  const endTime = toUtcDate(end).getTime();
  if (endTime < birthTime) return "";

  let years = end.year - birth.year;
  let cursor = addYearsClamped(birth, years);
  if (toUtcDate(cursor).getTime() > endTime) {
    years -= 1;
    cursor = addYearsClamped(birth, years);
  }

  let months = (end.year - cursor.year) * 12 + end.month - cursor.month;
  let monthCursor = addMonthsClamped(cursor, months);
  if (toUtcDate(monthCursor).getTime() > endTime) {
    months -= 1;
    monthCursor = addMonthsClamped(cursor, months);
  }

  const days = Math.round((endTime - toUtcDate(monthCursor).getTime()) / 86_400_000);
  return `${years}岁${months}个月${days}天`;
}
