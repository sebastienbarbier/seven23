function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function generateRecurrences(transaction) {
  if (!transaction.frequency || !transaction.duration) {
    return [];
  }
  const result = [];
  for (let i = 1; i < transaction.duration; i++) {
    const date = new Date(transaction.date);
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
        case 3:
        case 5:
        case 8:
        case 10:
          month = day > 30 ? month + 1 : month;
          day = day > 30 ? 0 : day;
          break;
      }
      newDate = new Date(Date.UTC(year, month, day));
    } else if (transaction.frequency === "Y") {
      if (
        date.getMonth() === 1 &&
        date.getDate() === 29 &&
        !isLeapYear(date.getFullYear() + i)
      ) {
        newDate = new Date(
          Date.UTC(date.getFullYear() + i, date.getMonth(), 28)
        );
      } else {
        newDate = new Date(date.setFullYear(date.getFullYear() + i));
      }
    }
    result.push(
      Object.assign({}, transaction, {
        date: newDate,
        isRecurrent: true,
        counter: i + 1,
        isLastRecurrence: i == transaction.duration - 1,
      })
    );
  }
  return result;
}

export { generateRecurrences };
