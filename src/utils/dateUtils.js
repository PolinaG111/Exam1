function parseRuDate(value) {
  if (!value || typeof value !== "string") {
    return null;
  }

  const match = value.trim().match(/^(\d{2})\.(\d{2})\.(\d{4})$/);

  if (!match) {
    return null;
  }

  const [, day, month, year] = match;
  const isoDate = `${year}-${month}-${day}`;
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day)
  ) {
    return null;
  }

  return isoDate;
}

function formatRuDate(value) {
  if (!value || typeof value !== "string") {
    return "";
  }

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return value;
  }

  return `${match[3]}.${match[2]}.${match[1]}`;
}

function formatDateForInput(value) {
  return formatRuDate(value);
}

module.exports = {
  formatDateForInput,
  formatRuDate,
  parseRuDate,
};
