import {
  STATISTICS_DASHBOARD,
  STATISTICS_VIEWER,
  STATISTICS_PER_DATE,
  STATISTICS_PER_CATEGORY,
  STATISTICS_SEARCH,
  STATISTICS_NOMADLIST
} from "../constants";

import { fuzzyFilter } from "../components/search/utils";

onmessage = function(event) {
  // Action object is the on generated in action object
  var action = event.data;
  const { uuid } = action;

  var {
    transactions,
    nomadlist,
    begin,
    end,
    category,
    categoriesToExclude
  } = action;
  var list = [];

  // Because of redux persist we need to save date as string.
  // This convert strings to date object.
  transactions.forEach(transaction => {
    transaction.date = new Date(transaction.date);
  });

  switch (action.type) {
    case STATISTICS_DASHBOARD: {
      list = transactions;
      const stats = generateStatistics(list);
      postMessage({
        uuid,
        type: action.type,
        transactions: list,
        currentYear: generateCurrentYear(transactions),
        trend7: generateTrends(transactions, 7),
        trend30: generateTrends(transactions, 30),
        stats: stats,
        graph: generateGraph(stats)
      });
      break;
    }
    case STATISTICS_VIEWER: {
      list = transactions.filter(
        transaction => transaction.date >= begin && transaction.date <= end
      );
      postMessage({
        uuid,
        type: action.type,
        transactions: list,
        currentYear: generateCurrentYear(transactions),
        stats: generateStatistics(list)
      });
      break;
    }
    case STATISTICS_PER_DATE: {
      list = transactions.filter(
        transaction => transaction.date >= begin && transaction.date <= end
      );

      postMessage({
        uuid,
        type: action.type,
        transactions: list,
        stats: generateStatistics(list)
      });
      break;
    }
    case STATISTICS_PER_CATEGORY: {
      list = transactions.filter(
        transaction => transaction.category === category
      );
      postMessage({
        uuid,
        type: action.type,
        transactions: list,
        stats: generateStatistics(list)
      });
      break;
    }
    case STATISTICS_SEARCH: {
      list = transactions.filter(transaction =>
        fuzzyFilter(action.text || "", transaction.name)
      );
      postMessage({
        uuid,
        type: action.type,
        transactions: list,
        stats: generateStatistics(list)
      });
      break;
    }
    case STATISTICS_NOMADLIST: {
      list = transactions.filter(
        transaction => categoriesToExclude.indexOf(transaction.category) == -1
      );
      const result = generateNomadlistOverview(nomadlist, list);
      postMessage({
        uuid,
        type: action.type,
        cities: result.cities,
        countries: result.countries
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

  var list = transactions.filter(
    transaction => transaction.date.getFullYear() === year
  );
  var result = generateStatistics(list);

  var list2 = transactions.filter(
    transaction =>
      transaction.date.getFullYear() === year &&
      transaction.date.getMonth() === month
  );
  result.currentMonth = generateStatistics(list2);
  return result;
}

function generateTrends(transactions, numberOfDayToAnalyse = 30) {
  let categories = {};
  var now = new Date();
  var date1 =
    new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())) -
    1000 * 60 * 60 * 24 * (numberOfDayToAnalyse + 1);
  var date2 =
    new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())) -
    1000 * 60 * 60 * 24;

  var list = transactions.filter(
    transaction => transaction.date >= date1 && transaction.date <= date2
  );
  list.forEach(transaction => {
    if (transaction.amount < 0) {
      if (!transaction.category) {
        transaction.category = 0;
      }
      if (!categories[transaction.category]) {
        categories[transaction.category] = {
          earliest: 0,
          oldiest: 0
        };
      }
      categories[transaction.category].earliest =
        categories[transaction.category].earliest + transaction.amount;
    }
  });

  // Oldest range

  var date3 =
    new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())) -
    1000 * 60 * 60 * 24 * (numberOfDayToAnalyse * 2 + 2);
  var date4 =
    new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())) -
    1000 * 60 * 60 * 24 * (numberOfDayToAnalyse + 2);

  var list2 = transactions.filter(
    transaction => transaction.date >= date3 && transaction.date <= date4
  );
  list2.forEach(transaction => {
    if (transaction.amount < 0) {
      if (!transaction.category) {
        transaction.category = 0;
      }
      if (!categories[transaction.category]) {
        categories[transaction.category] = {
          earliest: 0,
          oldiest: 0
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
  Object.keys(categories).forEach(key => {
    trend.push({
      id: key,
      diff: categories[key].oldiest - categories[key].earliest,
      earliest: categories[key].earliest,
      oldiest: categories[key].oldiest
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

  transactions.forEach(transaction => {
    // Calculate categories
    if (transaction.category && !categories[transaction.category]) {
      categories[transaction.category] = {
        expenses: 0,
        incomes: 0,
        counter: 0
      };
    }

    // Calculate per dates
    if (!dates[transaction.date.getFullYear()]) {
      dates[transaction.date.getFullYear()] = {
        expenses: 0,
        incomes: 0,
        counter: 0,
        months: {}
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
        days: {}
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
        counter: 0
      };
    }

    const year_stats = dates[transaction.date.getFullYear()];
    year_stats.counter += 1;
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
      }
    }
  });

  return {
    incomes: incomes,
    expenses: expenses,
    perDates: dates,
    perCategories: categories,
    perCategoriesArray: Object.keys(categories)
      .map(id => {
        return {
          id: id,
          incomes: categories[id].incomes,
          expenses: categories[id].expenses
        };
      })
      .sort((a, b) => {
        return a.expenses > b.expenses ? 1 : -1;
      })
  };
}

function generateGraph(stats) {
  // Generate Graph data
  let lineExpenses = {
    // color: theme.palette.numbers.red,
    values: []
  };

  let lineIncomes = {
    // color: theme.palette.numbers.blue,
    values: []
  };

  Object.keys(stats.perDates).forEach(year => {
    // For each month of year
    Object.keys(stats.perDates[year].months).forEach(month => {
      if (stats.perDates[year].months[month]) {
        lineExpenses.values.push({
          date: new Date(year, month),
          value: +stats.perDates[year].months[month].expenses * -1
        });
        lineIncomes.values.push({
          date: new Date(year, month),
          value: stats.perDates[year].months[month].incomes
        });
      } else {
        lineExpenses.values.push({
          date: new Date(year, month),
          value: 0
        });
        lineIncomes.values.push({
          date: new Date(year, month),
          value: 0
        });
      }
    });
  });

  return [lineExpenses, lineIncomes];
}

function generateNomadlistOverview(nomadlist, transactions) {
  const result = {
    cities: {},
    countries: {}
  };
  const now = new Date();
  nomadlist.data.trips.forEach(trip => {
    const begin = new Date(trip.date_start);
    const end = new Date(trip.date_end);

    if (end <= now) {
      trip.transactions = transactions.filter(
        transaction => transaction.date >= begin && transaction.date <= end
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
            trips: []
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
            trips: []
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

  Object.values(result.cities).forEach(city => {
    city.averageStay = city.averageStay / city.trips.length;
    city.averageExpenses = city.averageExpenses / city.trips.length;
    city.averagePerDay = city.averagePerDay / city.trips.length;
    city.averagePerMonth = city.averagePerMonth / city.trips.length;
  });

  Object.values(result.countries).forEach(country => {
    country.averageStay = country.averageStay / country.trips.length;
    country.averageExpenses = country.averageExpenses / country.trips.length;
    country.averagePerDay = country.averagePerDay / country.trips.length;
    country.averagePerMonth = country.averagePerMonth / country.trips.length;
  });

  return {
    cities: Object.values(result.cities),
    countries: Object.values(result.countries)
  };
}
