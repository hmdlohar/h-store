export const GIFT_SHOP_STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "crm", label: "CRM" },
  { value: "call_attempted", label: "Call Attempted" },
  { value: "interested", label: "Interested" },
  { value: "not_interested", label: "Not Interested" },
  { value: "positive_review", label: "Positive Review" },
  { value: "follow_up", label: "Follow Up" },
  { value: "closed", label: "Closed" },
];

export const GIFT_SHOP_STATUS_LABEL_MAP = GIFT_SHOP_STATUS_OPTIONS.reduce(
  (acc, item) => {
    acc[item.value] = item.label;
    return acc;
  },
  {},
);

export const GIFT_SHOP_SOURCE_OPTIONS = [
  { value: "google-maps", label: "Google Maps" },
  { value: "justdial", label: "Justdial" },
  { value: "manual", label: "Manual" },
  { value: "other", label: "Other" },
];
