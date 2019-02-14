

function filteringCategoryFunction(transaction, filters = []) {
  if (
    !filters.find(filter => {
      return filter.type === 'category';
    })
  ) {
    return true;
  }
  let res = false;
  filters.forEach(filter => {
    if (
      res === false &&
      filter.type === 'category' &&
      +filter.value === +transaction.category
    ) {
      res = true;
    }
  });
  return res;
}
function filteringDateFunction(transaction, filters = []) {
  if (
    !filters.find(filter => {
      return filter.type === 'date';
    })
  ) {
    return true;
  }
  let res = false;
  filters.forEach(filter => {
    if (
      res === false &&
      filter.type === 'date' &&
      +filter.value.getDate() === +transaction.date.getDate()
    ) {
      res = true;
    }
  });
  return res;
}

export { filteringCategoryFunction, filteringDateFunction };