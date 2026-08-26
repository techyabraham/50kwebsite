import { OFFER_END_DATE } from "../constants";

export const OFFER_END_FORMATTED = OFFER_END_DATE.toLocaleDateString("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export const OFFER_END_SHORT = "September 2nd, 2026";
export const OFFER_END_COPY = "September 2, 2026";

