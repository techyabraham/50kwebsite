import { OFFER_END_DATE } from "../constants";

const getOrdinalSuffix = (day) => {
  if (day > 3 && day < 21) return "th";
  const lastDigit = day % 10;
  if (lastDigit === 1) return "st";
  if (lastDigit === 2) return "nd";
  if (lastDigit === 3) return "rd";
  return "th";
};

export const OFFER_END_FORMATTED = OFFER_END_DATE.toLocaleDateString("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const month = OFFER_END_DATE.toLocaleDateString("en-GB", { month: "long" });
const day = OFFER_END_DATE.getDate();
const year = OFFER_END_DATE.getFullYear();

export const OFFER_END_SHORT = `${month} ${day}${getOrdinalSuffix(day)}, ${year}`;
export const OFFER_END_COPY = `${month} ${day}, ${year}`;
