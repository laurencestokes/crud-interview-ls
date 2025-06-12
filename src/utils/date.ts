import { format, parseISO, isValid } from 'date-fns';

export const formatDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) {
      return dateString;
    }
    return format(date, 'dd/MM/yyyy');
  } catch {
    return dateString;
  }
};
