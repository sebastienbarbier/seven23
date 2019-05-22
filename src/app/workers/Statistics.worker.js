import {
  STATISTICS_DASHBOARD,
  STATISTICS_VIEWER,
  STATISTICS_PER_DATE,
  STATISTICS_PER_CATEGORY,
} from '../constants';

onmessage = function(event) {
  // Action object is the on generated in action object
  var action = event.data;

  var { transactions, goals, begin, end, category } = action;
  var list = [];

  // Because of redux persist we need to save date as string.
  // This convert strings to date object.
  transactions.forEach((transaction) => {
    transaction.date = new Date(transaction.date);
  });

  switch (action.type) {
  case STATISTICS_DASHBOARD: {
    list = transactions;
    postMessage({
      type: action.type,
      transactions: list,
      currentYear: generateCurrentYear(transactions),
      trend7: generateTrends(transactions, 7),
      trend30: generateTrends(transactions, 30),
      stats: generateStatistics(list),
    });
    break;
  }
  case STATISTICS_VIEWER: {
    list = transactions.filter((transaction) => transaction.date >= begin && transaction.date <= end);
    postMessage({
      type: action.type,
      transactions: list,
      currentYear: generateCurrentYear(transactions),
      stats: generateStatistics(list),
    });
    break;
  }
  case STATISTICS_PER_DATE: {
    list = transactions.filter((transaction) => transaction.date >= begin && transaction.date <= end);
    postMessage({
      type: action.type,
      transactions: list,
      stats: generateStatistics(list),
    });
    break;
  }
  case STATISTICS_PER_CATEGORY: {
    list = transactions.filter((transaction) => transaction.category === category);
    postMessage({
      type: action.type,
      transactions: list,
      stats: generateStatistics(list),
    });
    break;
  }
  default:
    return;
  }
};

function generateCurrentYear(transactions) {
  var year = new Date().getFullYear();
  var month = new Date().getMonth();

  var list = transactions.filter((transaction) => transaction.date.getFullYear() === year);
  var result = generateStatistics(list);

  var list2 = transactions.filter((transaction) => transaction.date.getFullYear() === year &&
                                                   transaction.date.getMonth() === month);
  result.currentMonth = generateStatistics(list2);
  return result;
}

function generateTrends(transactions, numberOfDayToAnalyse = 30) {

  let categories = {};
  var now = new Date();
  var date1 = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())) - (1000*60*60*24*(numberOfDayToAnalyse+1));
  var date2 = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())) - (1000*60*60*24);

  var list = transactions.filter((transaction) => transaction.date >= date1 && transaction.date <= date2);
  list.forEach((transaction) => {
    if (transaction.amount < 0) {
      if (!transaction.category) {
        transaction.category = 0;
      }
      if (!categories[+transaction.category]) {
        categories[+transaction.category] = {
          earliest: 0,
          oldiest: 0,
        };
      }
      categories[+transaction.category].earliest = categories[+transaction.category].earliest + transaction.amount;
    }
  });

  // Oldest range

  var date3 = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())) - (1000*60*60*24*(numberOfDayToAnalyse * 2 + 2));
  var date4 = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())) - (1000*60*60*24*(numberOfDayToAnalyse + 2));

  var list2 = transactions.filter((transaction) => transaction.date >= date3 && transaction.date <= date4);
  list2.forEach((transaction) => {
    if (transaction.amount < 0) {
      if (!transaction.category) {
        transaction.category = 0;
      }
      if (!categories[+transaction.category]) {
        categories[+transaction.category] = {
          earliest: 0,
          oldiest: 0,
        };
      }
      categories[+transaction.category].oldiest =
        categories[+transaction.category].oldiest + transaction.amount;
    }
  });

  let trend = [];
  let diff = 0;
  let sumEarlier = 0;
  let sumOldiest = 0;
  Object.keys(categories).forEach(key => {
    trend.push({
      id: key,
      diff: categories[key].oldiest - categories[key].earliest,
      earliest: categories[key].earliest,
      oldiest: categories[key].oldiest,
    });
    diff = diff + (categories[key].oldiest - categories[key].earliest);
    sumEarlier += categories[key].earliest;
    sumOldiest += categories[key].oldiest;
  });
  trend = trend.sort((a, b) => {
    return a.diff < b.diff ? 1 : -1;
  });

  return {
    diff,
    firstRange: {
      dateBegin: date1,
      dateEnd: date2,
      sum: sumEarlier
    },
    secondRange: {
      dateBegin: date3,
      dateEnd: date4,
      sum: sumOldiest
    },
    trend
  };
}

function generateStatistics(transactions) {
  let expenses = 0,
    incomes = 0,
    categories = {},
    dates = {};

  transactions.forEach((transaction) => {
    // Calculate categories
    if (transaction.category && !categories[transaction.category]) {
      categories[transaction.category] = {
        expenses: 0,
        incomes: 0,
        counter: 0,
      };
    }

    // Calculate per dates
    if (!dates[transaction.date.getFullYear()]) {
      dates[transaction.date.getFullYear()] = {
        expenses: 0,
        incomes: 0,
        counter: 0,
        months: {},
      };
    }
    if (
      !dates[transaction.date.getFullYear()].months[
        transaction.date.getMonth()
      ]
    ) {
      dates[transaction.date.getFullYear()].months[
        transaction.date.getMonth()
      ] = {
        expenses: 0,
        incomes: 0,
        counter: 0,
        days: {},
      };
    }
    if (
      !dates[transaction.date.getFullYear()].months[
        transaction.date.getMonth()
      ].days[transaction.date.getDate()]
    ) {
      dates[transaction.date.getFullYear()].months[
        transaction.date.getMonth()
      ].days[transaction.date.getDate()] = {
        expenses: 0,
        incomes: 0,
        counter: 0
      };
    }

    const year_stats = dates[transaction.date.getFullYear()];
    year_stats.counter += 1;
    if (transaction.amount >= 0) {
      incomes += transaction.amount;
      year_stats.incomes += transaction.amount;
      year_stats.months[
        transaction.date.getMonth()
      ].incomes +=
        transaction.amount;
      year_stats.months[
        transaction.date.getMonth()
      ].counter += 1;
      year_stats.months[
        transaction.date.getMonth()
      ].days[transaction.date.getDate()].incomes +=
        transaction.amount;
      year_stats.months[
        transaction.date.getMonth()
      ].days[transaction.date.getDate()].counter += 1;
      if (transaction.category) {
        categories[transaction.category].incomes += transaction.amount;
      }
    } else {
      expenses += transaction.amount;
      year_stats.expenses += transaction.amount;
      year_stats.months[
        transaction.date.getMonth()
      ].expenses +=
        transaction.amount;
      year_stats.months[
        transaction.date.getMonth()
      ].counter += 1;
      year_stats.months[
        transaction.date.getMonth()
      ].days[transaction.date.getDate()].expenses +=
        transaction.amount;
      year_stats.months[
        transaction.date.getMonth()
      ].days[transaction.date.getDate()].counter += 1;
      if (transaction.category) {
        categories[transaction.category].expenses += transaction.amount;
      }
    }
  });

  return {
    incomes: incomes,
    expenses: expenses,
    perDates: dates,
    perCategories: categories,
  };
}