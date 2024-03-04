import {
  STATISTICS_DASHBOARD,
  STATISTICS_NOMADLIST,
  STATISTICS_PER_CATEGORY,
  STATISTICS_PER_DATE,
  STATISTICS_SEARCH,
  STATISTICS_VIEWER,
} from "../constants";

import { fuzzyFilter } from "../components/search/utils";
import { stringToDate } from "../utils/date";

onmessage = function (event) {
  // Action object is the on generated in action object
  var action = event.data;
  const { uuid } = action;

  var { transactions, nomadlist, begin, end, category, categoriesToExclude } =
    action;
  var list = [];

  if (!transactions) {
    transactions = [];
  }

  // Because of redux persist we need to save date as string.
  // This convert strings to date object.
  transactions.forEach((transaction) => {
    transaction.date = stringToDate(transaction.date);
  });

  switch (action.type) {
    case STATISTICS_DASHBOARD: {
      list = transactions;
      const stats = generateStatistics(list, action);
      postMessage({
        uuid,
        type: action.type,
        transactions: list,
        currentYear: generateCurrentYear(transactions, action),
        trend7: generateTrends(transactions, 7),
        trend30: generateTrends(transactions, 30),
        stats: stats,
        graph: generateGraph(stats),
        pendings: list.filter((t) => t.isPending),
      });
      break;
    }
    case STATISTICS_VIEWER: {
      list = transactions.filter(
        (transaction) => transaction.date >= begin && transaction.date <= end
      );
      postMessage({
        uuid,
        type: action.type,
        transactions: list,
        currentYear: generateCurrentYear(transactions, action),
        stats: generateStatistics(list, action),
        pendings: list.filter((t) => t.isPending),
      });
      break;
    }
    case STATISTICS_PER_DATE: {
      list = transactions.filter(
        (transaction) => transaction.date >= begin && transaction.date <= end
      );

      postMessage({
        uuid,
        type: action.type,
        transactions: list,
        stats: generateStatistics(list, action),
        pendings: list.filter((t) => t.isPending),
      });
      break;
    }
    case STATISTICS_PER_CATEGORY: {
      list = transactions.filter((transaction) => {
        if (category == "null" && transaction.category == null) {
          return true;
        }
        return transaction.category === category;
      });

      const stats = generateStatistics(list, action);
      postMessage({
        uuid,
        type: action.type,
        transactions: list,
        graph: generateGraph(stats),
        stats: generateStatistics(list, action),
        pendings: list.filter((t) => t.isPending),
      });
      break;
    }
    case STATISTICS_SEARCH: {
      list = transactions.filter((transaction) =>
        fuzzyFilter(action.text || "", transaction.name)
      );
      postMessage({
        uuid,
        type: action.type,
        transactions: list,
        stats: generateStatistics(list, action),
      });
      break;
    }
    case STATISTICS_NOMADLIST: {
      list = transactions
        .filter(
          (transaction) =>
            categoriesToExclude.indexOf(transaction.category) == -1
        )
        .filter((transaction) => !transaction.isPending);
      const result = generateNomadlistOverview(nomadlist, list);
      postMessage({
        uuid,
        type: action.type,
        cities: result.cities,
        countries: result.countries,
      });
      break;
    }
    default:
      return;
  }
};

function generateCurrentYear(transactions, action) {
  var year = new Date().getFullYear();
  var month = new Date().getMonth();

  var list = transactions.filter(
    (transaction) => transaction.date.getFullYear() === year
  );
  var result = generateStatistics(list, action);

  var list2 = transactions.filter(
    (transaction) =>
      transaction.date.getFullYear() === year &&
      transaction.date.getMonth() === month
  );
  result.currentMonth = generateStatistics(list2, action);
  return result;
}

function generateTrends(transactions, numberOfDayToAnalyse = 30) {
  let categories = {};
  var now = new Date();
  var date1 =
    new Date(now.getFullYear(), now.getMonth(), now.getDate()) -
    1000 * 60 * 60 * 24 * (numberOfDayToAnalyse + 1);
  var date2 =
    new Date(now.getFullYear(), now.getMonth(), now.getDate()) -
    1000 * 60 * 60 * 24;

  var list = transactions.filter(
    (transaction) =>
      transaction.date >= date1 &&
      transaction.date <= date2 &&
      !transaction.isPending
  );
  list.forEach((transaction) => {
    if (transaction.amount < 0) {
      if (!transaction.category) {
        transaction.category = 0;
      }
      if (!categories[transaction.category]) {
        categories[transaction.category] = {
          earliest: 0,
          oldiest: 0,
        };
      }
      categories[transaction.category].earliest =
        categories[transaction.category].earliest + transaction.amount;
    }
  });

  // Oldest range

  var date3 =
    new Date(now.getFullYear(), now.getMonth(), now.getDate()) -
    1000 * 60 * 60 * 24 * (numberOfDayToAnalyse * 2 + 2);
  var date4 =
    new Date(now.getFullYear(), now.getMonth(), now.getDate()) -
    1000 * 60 * 60 * 24 * (numberOfDayToAnalyse + 2);

  var list2 = transactions.filter(
    (transaction) =>
      transaction.date >= date3 &&
      transaction.date <= date4 &&
      !transaction.isPending
  );
  list2.forEach((transaction) => {
    if (transaction.amount < 0) {
      if (!transaction.category) {
        transaction.category = 0;
      }
      if (!categories[transaction.category]) {
        categories[transaction.category] = {
          earliest: 0,
          oldiest: 0,
        };
      }
      categories[transaction.category].oldiest =
        categories[transaction.category].oldiest + transaction.amount;
    }
  });

  let trend = [];
  let diff = 0;
  let sumEarlier = 0;
  let sumOldiest = 0;
  Object.keys(categories).forEach((key) => {
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
      sum: sumEarlier,
    },
    secondRange: {
      dateBegin: date3,
      dateEnd: date4,
      sum: sumOldiest,
    },
    trend,
  };
}

function generateStatistics(transactions = [], action = {}) {
  let expenses = 0,
    incomes = 0,
    categories = {},
    dates = {},
    hasUnknownAmount = false,
    beginDate = null,
    endDate = null;

  transactions.forEach((transaction) => {
    if (transaction.amount == null || transaction.amount == undefined) {
      hasUnknownAmount = true;
    }

    if (!beginDate) {
      beginDate = transaction.date;
      endDate = transaction.date;
    }

    // Calculate categories
    if (transaction.category && !categories[transaction.category]) {
      categories[transaction.category] = {
        expenses: 0,
        incomes: 0,
        counter: 0,
      };
    }
    if (transaction.category == null && !categories["null"]) {
      categories["null"] = {
        expenses: 0,
        incomes: 0,
        counter: 0,
      };
    }

    // Keep track of the date Range
    if (transaction.date < beginDate) {
      beginDate = transaction.date;
    } else if (transaction.date > endDate) {
      endDate = transaction.date;
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
      !dates[transaction.date.getFullYear()].months[transaction.date.getMonth()]
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
      !dates[transaction.date.getFullYear()].months[transaction.date.getMonth()]
        .days[transaction.date.getDate()]
    ) {
      dates[transaction.date.getFullYear()].months[
        transaction.date.getMonth()
      ].days[transaction.date.getDate()] = {
        expenses: 0,
        incomes: 0,
        counter: 0,
      };
    }

    const year_stats = dates[transaction.date.getFullYear()];
    year_stats.counter += 1;
    if (!transaction.isPending) {
      if (transaction.amount >= 0) {
        incomes += transaction.amount;
        year_stats.incomes += transaction.amount;
        year_stats.months[transaction.date.getMonth()].incomes +=
          transaction.amount;
        year_stats.months[transaction.date.getMonth()].counter += 1;
        year_stats.months[transaction.date.getMonth()].days[
          transaction.date.getDate()
        ].incomes += transaction.amount;
        year_stats.months[transaction.date.getMonth()].days[
          transaction.date.getDate()
        ].counter += 1;
        if (transaction.category) {
          categories[transaction.category].incomes += transaction.amount;
        } else {
          categories["null"].incomes += transaction.amount;
        }
      } else {
        expenses += transaction.amount;
        year_stats.expenses += transaction.amount;
        year_stats.months[transaction.date.getMonth()].expenses +=
          transaction.amount;
        year_stats.months[transaction.date.getMonth()].counter += 1;
        year_stats.months[transaction.date.getMonth()].days[
          transaction.date.getDate()
        ].expenses += transaction.amount;
        year_stats.months[transaction.date.getMonth()].days[
          transaction.date.getDate()
        ].counter += 1;
        if (transaction.category) {
          categories[transaction.category].expenses += transaction.amount;
        } else {
          categories["null"].expenses += transaction.amount;
        }
      }
    }
  });

  /* 
    Generate Calendar data. An array for each day.
  */

  let calendar = [];

  if ((action.begin && action.end) || (beginDate && endDate)) {
    let i = action.begin || beginDate;
    let end = action.end || endDate;

    while (i.getTime() <= end.getTime()) {
      const year = i.getUTCFullYear(),
        month = i.getUTCMonth(),
        date = i.getUTCDate();
      if (dates[year]?.months[month]?.days[date]) {
        calendar.push({
          date: new Date(Date.UTC(year, month, date)),
          amount: dates[year].months[month].days[date].expenses,
        });
      } else {
        calendar.push({
          date: new Date(Date.UTC(year, month, date)),
          amount: 0,
        });
      }

      i = new Date(i.getTime() + 60 * 60 * 24 * 1000);
    }
  }

  // Generate perCategoriesArray with relative pourcentage
  const perCategoriesArray = Object.keys(categories)
    .map((id) => {
      const category = categories[id];
      return {
        id: id,
        incomes: category.incomes,
        expenses: category.expenses,
        sum: category.incomes + category.expenses,
      };
    })
    .sort((a, b) => {
      return a.incomes + a.expenses > b.incomes + b.expenses ? 1 : -1;
    });

  if (perCategoriesArray?.length) {
    const minCategory = perCategoriesArray[0].sum;
    const maxCategory = perCategoriesArray[perCategoriesArray.length - 1].sum;

    perCategoriesArray?.forEach((category) => {
      if (category.sum < 0) {
        category.percentage = (category.sum / minCategory) * 100;
        category.percentageTotal = (category.sum / expenses) * 100;
      } else if (category.sum > 0) {
        category.percentage = (category.sum / maxCategory) * 100;
        category.percentageTotal = (category.sum / incomes) * 100;
      } else {
        category.percentage = 0;
        category.percentageTotal = 0;
      }
    });
  }

  return {
    beginDate: beginDate,
    endDate: endDate,
    incomes: incomes,
    expenses: expenses,
    hasUnknownAmount: hasUnknownAmount,
    calendar: calendar,
    perDates: dates,
    perCategories: categories,
    perCategoriesArray: perCategoriesArray,
  };
}

function generateGraph(stats) {
  // Generate Graph data
  let lineExpenses = {
    // color: theme.palette.numbers.red,
    label: "Expenses",
    values: [],
  };

  let lineIncomes = {
    // color: theme.palette.numbers.blue,
    label: "Incomes",
    values: [],
  };

  Object.keys(stats.perDates).forEach((year) => {
    // For each month of year
    Object.keys(stats.perDates[year].months).forEach((month) => {
      if (stats.perDates[year].months[month]) {
        lineExpenses.values.push({
          date: new Date(year, month),
          value: +stats.perDates[year].months[month].expenses * -1,
        });
        lineIncomes.values.push({
          date: new Date(year, month),
          value: stats.perDates[year].months[month].incomes,
        });
      } else {
        lineExpenses.values.push({
          date: new Date(year, month),
          value: 0,
        });
        lineIncomes.values.push({
          date: new Date(year, month),
          value: 0,
        });
      }
    });
  });

  return [lineExpenses, lineIncomes];
}

function generateNomadlistOverview(nomadlist, transactions) {
  const result = {
    cities: {},
    countries: {},
  };
  const now = new Date();
  nomadlist.data.trips.forEach((trip) => {
    const begin = stringToDate(trip.date_start);
    const end = stringToDate(trip.date_end);

    if (end <= now) {
      trip.transactions = transactions.filter(
        (transaction) => transaction.date >= begin && transaction.date <= end
      );

      if (trip.transactions.length) {
        const key = `${trip.place}-${trip.country_code}`;
        if (!result.cities[key]) {
          result.cities[key] = {
            country: trip.country,
            country_code: trip.country_code,
            country_slug: trip.country_slug,
            place: trip.place,
            place_slug: trip.place_slug,
            averageStay: 0,
            averageExpenses: 0,
            averagePerDay: 0,
            averagePerMonth: 0,
            stay: 0,
            transactions_length: 0,
            trips: [],
          };
        }
        if (!result.countries[trip.country_code]) {
          result.countries[trip.country_code] = {
            country: trip.country,
            country_code: trip.country_code,
            country_slug: trip.country_slug,
            averageStay: 0,
            averageExpenses: 0,
            averagePerDay: 0,
            averagePerMonth: 0,
            stay: 0,
            transactions_length: 0,
            trips: [],
          };
        }
        trip.stats = generateStatistics(trip.transactions);
        trip.stay = Math.ceil(Math.abs(begin - end) / (1000 * 60 * 60 * 24));
        if (trip.stay == 0) {
          trip.stay = 1;
        }
        trip.perDay = trip.stats.expenses / trip.stay;
        trip.perMonth = (trip.stats.expenses * 365.25) / trip.stay / 12;
        result.cities[key].stay += trip.stay;
        result.cities[key].transactions_length += trip.transactions.length;
        result.cities[key].trips.push(trip);
        result.cities[key].averageStay += trip.stay;
        result.cities[key].averageExpenses += trip.stats.expenses;
        result.cities[key].averagePerDay += trip.perDay;
        result.cities[key].averagePerMonth += trip.perMonth;

        result.countries[trip.country_code].stay += trip.stay;
        result.countries[trip.country_code].transactions_length +=
          trip.transactions.length;
        result.countries[trip.country_code].trips.push(trip);
        result.countries[trip.country_code].averageStay += trip.stay;
        result.countries[trip.country_code].averageExpenses +=
          trip.stats.expenses;
        result.countries[trip.country_code].averagePerDay += trip.perDay;
        result.countries[trip.country_code].averagePerMonth += trip.perMonth;
      }
    }
  });

  Object.values(result.cities).forEach((city) => {
    city.averageStay = city.averageStay / city.trips.length;
    city.averageExpenses = city.averageExpenses / city.trips.length;
    city.averagePerDay = city.averagePerDay / city.trips.length;
    city.averagePerMonth = city.averagePerMonth / city.trips.length;
  });

  Object.values(result.countries).forEach((country) => {
    country.averageStay = country.averageStay / country.trips.length;
    country.averageExpenses = country.averageExpenses / country.trips.length;
    country.averagePerDay = country.averagePerDay / country.trips.length;
    country.averagePerMonth = country.averagePerMonth / country.trips.length;
  });

  return {
    cities: Object.values(result.cities),
    countries: Object.values(result.countries),
  };
}
