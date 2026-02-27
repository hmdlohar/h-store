import { Typography, Tooltip } from "@mui/material";

function formatDistanceToNow(date) {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now - then) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears > 1 ? "s" : ""} ago`;
}

export default function DateDisplay({ date, showDate = "ago", variant = "body2", ...props }) {
  if (!date) return "-";

  const dateObj = new Date(date);
  const dateString = dateObj.toLocaleString();
  const agoString = formatDistanceToNow(dateObj);

  const displayText = showDate === "ago" ? agoString : dateString;
  const tooltipText = showDate === "ago" ? dateString : agoString;

  return (
    <Tooltip title={tooltipText} arrow>
      <Typography variant={variant} {...props}>
        {displayText}
      </Typography>
    </Tooltip>
  );
}
