export const getSmartTimeLabel = (endDate) => {
  const now = new Date();
  const diffMs = endDate - now;

  if (diffMs <= 0) return "Offer Closed";

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays > 2) return `${diffDays} Day${diffDays !== 1 ? "s" : ""} Left`;
  if (diffHours >= 1) return `${diffHours} Hour${diffHours !== 1 ? "s" : ""} Left`;
  if (diffMinutes >= 1) return `${diffMinutes} Minute${diffMinutes !== 1 ? "s" : ""} Left`;
  return `${diffSeconds} Second${diffSeconds !== 1 ? "s" : ""} Left`;
};

