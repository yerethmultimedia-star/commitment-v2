import { RecurrenceType } from '@commitment/domain';

export class NextOccurrenceCalculator {
  public static calculate(
    patternStr: string,
    currentDateStr: string | undefined,
  ): Date | null {
    const pattern = patternStr as RecurrenceType;
    if (!currentDateStr || pattern === RecurrenceType.None) {
      return null;
    }

    const currentDate = new Date(currentDateStr);
    if (isNaN(currentDate.getTime())) {
      return null;
    }

    const nextDate = new Date(currentDate);

    switch (pattern) {
      case RecurrenceType.Daily:
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case RecurrenceType.Weekly:
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case RecurrenceType.Monthly:
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      default:
        return null;
    }

    return nextDate;
  }
}
