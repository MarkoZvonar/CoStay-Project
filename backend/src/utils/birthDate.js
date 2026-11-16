// Datum YYYY-MM-DD provjeravamo u UTC-u, jednako kao u izvornom kodu.
// Vraća "invalid", "underage" ili "adult".
export function birthDateStatus(birthday, today = new Date()) {
  if (typeof birthday !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(birthday)) {
    return "invalid";
  }

  const date = new Date(`${birthday}T00:00:00Z`);
  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== birthday ||
    birthday > today.toISOString().slice(0, 10)
  ) {
    return "invalid";
  }

  let age = today.getUTCFullYear() - date.getUTCFullYear();
  const monthDiff = today.getUTCMonth() - date.getUTCMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getUTCDate() < date.getUTCDate())
  ) {
    age--;
  }

  return age >= 18 ? "adult" : "underage";
}
