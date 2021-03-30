import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";

TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo();

export const formatDate = (date: Date | number, style?: string) => {
  return timeAgo.format(date, style);
};