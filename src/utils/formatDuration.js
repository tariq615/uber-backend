export function formatTime(seconds) {
    if (seconds < 0 || typeof seconds !== "number") {
      throw new Error("Invalid input: Seconds must be a non-negative number");
    }
  
    const days = Math.floor(seconds / (24 * 3600));
    seconds %= 24 * 3600;
  
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
  
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;
  
    if (days > 0) {
      return `${days} day${days > 1 ? "s" : ""}`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""}`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? "s" : ""}`;
    } else {
      return `${seconds} second${seconds > 1 ? "s" : ""}`;
    }
  }