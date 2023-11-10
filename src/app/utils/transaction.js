import { isLeapYear, dateToString, stringToDate, regex } from "./date";

// Filter per category
function filteringCategoryFunction(transaction, filters = []) {
  if (
    !filters.find((filter) => {
      return filter.type === "category";
    })
  ) {
    return true;
  }
  let res = false;
  filters.forEach((filter) => {
    if (
      res === false &&
      filter.type === "category"
    ) {
      if (filter.value == transaction.category) {
        res = true;
      }
      // If filter value is null (hardcoded), it is keeping transactions with no category
      if (filter.value == 'null' && transaction.category == null) {
        res = true;
      }
    }
  });
  return res;
}

function filteringDateFunction(transaction, filters = []) {
  if (
    !filters.find((filter) => {
      return filter.type === "date";
    })
  ) {
    return true;
  }
  let res = false;
  filters.forEach((filter) => {
    if (
      res === false &&
      filter.type === "date" &&
      filter.value.getFullYear() == transaction.date.getFullYear() &&
      filter.value.getMonth() == transaction.date.getMonth() &&
      filter.value.getDate() == transaction.date.getDate()
    ) {
      res = true;
    }
  });
  return res;
}

/**
 *  Take a transaction as param, return an array of transaction including the original transaction.
 *  All date are as string.
 *  Valid frequency values are Y|M|W|D.
 *  Will also handle adjusments values if provided
 */
function generateRecurrences(transaction) {
  if (!(transaction.date instanceof String) && !regex.test(transaction.date)) {
    throw new Error(`Transaction date is not a valid string format`);
  }
  if (!transaction.frequency || !transaction.duration) {
    return [transaction];
  }
  const result = [];
  for (let i = 0; i < transaction.duration; i++) {
    if (transaction.adjustments && transaction.adjustments[i]) {
      result.push(
        Object.assign({}, transaction, {
          date: dateToString(transaction.adjustments[i].date),
          local_amount: transaction.adjustments[i].local_amount,
          originalAmount: transaction.adjustments[i].local_amount,
          originalPending: transaction.isPending,
          beforeAdjustmentDate: transaction.date,
          beforeAdjustmentAmount: transaction.originalAmount,
          isRecurrent: i == 0 ? false : true,
          isPending: transaction.adjustments[i].isPending,
          counter: i + 1,
          isLastRecurrence: i == transaction.duration - 1,
        })
      );
    } else {
      const date = stringToDate(transaction.date);
      let newDate = transaction.date;
      if (transaction.frequency === "D") {
        newDate = new Date(date.setDate(date.getDate() + i));
      } else if (transaction.frequency === "W") {
        newDate = new Date(date.setDate(date.getDate() + 7 * i));
      } else if (transaction.frequency === "M") {
        const year = date.getFullYear() + parseInt((date.getMonth() + i) / 12);
        let month = (date.getMonth() + i) % 12;
        let day = date.getDate();
        switch (month) {
          case 1:
            month = day > 28 ? month + 1 : month;
            day = day > 28 ? 0 : day;
            break;
          case 0:
          case 3:
          case 5:
          case 8:
          case 10:
            month = day > 30 ? month + 1 : month;
            day = day > 30 ? 0 : day;
            break;
        }
        newDate = new Date(year, month, day);
      } else if (transaction.frequency === "Y") {
        if (
          date.getMonth() === 1 &&
          date.getDate() === 29 &&
          !isLeapYear(date.getFullYear() + i)
        ) {
          newDate = new Date(date.getFullYear() + i, date.getMonth(), 28);
        } else {
          newDate = new Date(date.setFullYear(date.getFullYear() + i));
        }
      } else {
        throw new Error(
          `Frequency '${transaction.frequency}' is not a valid value (Y|M|W|D)`
        );
      }
      result.push(
        Object.assign({}, transaction, {
          date: dateToString(newDate),
          isRecurrent: i == 0 ? false : true,
          isPending: transaction.isPending,
          beforeAdjustmentDate: transaction.date,
          beforeAdjustmentAmount: transaction.originalAmount,
          counter: i + 1,
          isLastRecurrence: i == transaction.duration - 1,
        })
      );
    }
  }
  return result;
}

export { filteringCategoryFunction, filteringDateFunction, generateRecurrences };