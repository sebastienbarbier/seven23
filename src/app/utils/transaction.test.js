import {
  filteringCategoryFunction,
  filteringDateFunction,
  filteringPendingsFunction,
  generateRecurrences,
} from "./transaction";

test("filteringCategoryFunction", () => {
  expect(
    filteringCategoryFunction(
      {
        category: 2,
      },
      [{ type: "category", value: 2 }]
    )
  ).toBeTruthy();

  expect(
    filteringCategoryFunction(
      {
        category: 3,
      },
      [{ type: "category", value: 2 }]
    )
  ).toBeFalsy();

  expect(
    filteringCategoryFunction(
      {
        category: 2,
      },
      [{ type: "non category", value: 2 }]
    )
  ).toBeTruthy();
});

test("filteringPendingsFunction", () => {
  expect(
    filteringPendingsFunction(
      {
        isPending: true,
      },
      [{ type: "pendings" }]
    )
  ).toBeTruthy();
  expect(
    filteringPendingsFunction(
      {
        isPending: false,
      },
      [{ type: "pendings" }]
    )
  ).toBeFalsy();
  expect(filteringPendingsFunction({}, [{ type: "pendings" }])).toBeFalsy();
});

test("filteringDateFunction", () => {
  expect(
    filteringDateFunction(
      {
        date: new Date(),
      },
      [{ type: "date", value: new Date() }]
    )
  ).toBeTruthy();

  expect(
    filteringDateFunction(
      {
        date: new Date(),
      },
      [{ type: "date", value: new Date(123) }]
    )
  ).toBeFalsy();

  expect(
    filteringDateFunction(
      {
        date: new Date(),
      },
      []
    )
  ).toBeTruthy();
});

test("generateRecurrences generate day frequency", () => {
  const result = generateRecurrences({
    id: "1",
    date: "2020-03-04",
    originalAmount: 42,
  });

  expect(result.length).toBe(1);
  expect(result.find((r) => r.date instanceof Date)).toBeUndefined();
  expect(result.find((r) => r.date === "2020-03-04")).toBeDefined();
  expect(result.find((r) => r.date === "2020-03-04").counter).toBeUndefined();
  expect(
    result.find((r) => r.date === "2020-03-04").isLastRecurrence
  ).toBeUndefined();
});

test("generateRecurrences generate day frequency", () => {
  const result = generateRecurrences({
    id: "1",
    frequency: "D",
    duration: "3",
    date: "2020-03-04",
    originalAmount: 42,
  });

  expect(result.length).toBe(3);
  expect(result.find((r) => r.date instanceof Date)).toBeUndefined();
  expect(result.find((r) => r.date === "2020-03-04")).toBeDefined();
  expect(result.find((r) => r.date === "2020-03-04").counter).toBe(1);
  expect(result.find((r) => r.date === "2020-03-04").isLastRecurrence).toBe(
    false
  );
  expect(result.find((r) => r.date === "2020-03-05")).toBeDefined();
  expect(result.find((r) => r.date === "2020-03-05").counter).toBe(2);
  expect(result.find((r) => r.date === "2020-03-05").isLastRecurrence).toBe(
    false
  );
  expect(result.find((r) => r.date === "2020-03-06")).toBeDefined();
  expect(result.find((r) => r.date === "2020-03-06").counter).toBe(3);
  expect(result.find((r) => r.date === "2020-03-06").isLastRecurrence).toBe(
    true
  );
});

test("generateRecurrences generate weekly frequency", () => {
  const result = generateRecurrences({
    id: "1",
    frequency: "W",
    duration: "3",
    date: "2020-03-04",
    originalAmount: 42,
  });

  expect(result.length).toBe(3);
  expect(result.find((r) => r.date instanceof Date)).toBeUndefined();
  expect(result.find((r) => r.date === "2020-03-04")).toBeDefined();
  expect(result.find((r) => r.date === "2020-03-04").counter).toBe(1);
  expect(result.find((r) => r.date === "2020-03-04").isLastRecurrence).toBe(
    false
  );
  expect(result.find((r) => r.date === "2020-03-11")).toBeDefined();
  expect(result.find((r) => r.date === "2020-03-11").counter).toBe(2);
  expect(result.find((r) => r.date === "2020-03-11").isLastRecurrence).toBe(
    false
  );
  expect(result.find((r) => r.date === "2020-03-18")).toBeDefined();
  expect(result.find((r) => r.date === "2020-03-18").counter).toBe(3);
  expect(result.find((r) => r.date === "2020-03-18").isLastRecurrence).toBe(
    true
  );
});

test("generateRecurrences generate month frequency", () => {
  const result = generateRecurrences({
    id: "1",
    frequency: "M",
    duration: "3",
    date: "2020-03-04",
    originalAmount: 42,
  });

  expect(result.length).toBe(3);
  expect(result.find((r) => r.date instanceof Date)).toBeUndefined();
  expect(result.find((r) => r.date === "2020-03-04")).toBeDefined();
  expect(result.find((r) => r.date === "2020-03-04").counter).toBe(1);
  expect(result.find((r) => r.date === "2020-03-04").isLastRecurrence).toBe(
    false
  );
  expect(result.find((r) => r.date === "2020-04-04")).toBeDefined();
  expect(result.find((r) => r.date === "2020-04-04").counter).toBe(2);
  expect(result.find((r) => r.date === "2020-04-04").isLastRecurrence).toBe(
    false
  );
  expect(result.find((r) => r.date === "2020-05-04")).toBeDefined();
  expect(result.find((r) => r.date === "2020-05-04").counter).toBe(3);
  expect(result.find((r) => r.date === "2020-05-04").isLastRecurrence).toBe(
    true
  );
});

test("generateRecurrences generate yearly frequency", () => {
  const result = generateRecurrences({
    id: "1",
    frequency: "Y",
    duration: "3",
    date: "2020-03-04",
    originalAmount: 42,
  });

  expect(result.length).toBe(3);
  expect(result.find((r) => r.date instanceof Date)).toBeUndefined();
  expect(result.find((r) => r.date === "2020-03-04")).toBeDefined();
  expect(result.find((r) => r.date === "2020-03-04").counter).toBe(1);
  expect(result.find((r) => r.date === "2020-03-04").isLastRecurrence).toBe(
    false
  );
  expect(result.find((r) => r.date === "2021-03-04")).toBeDefined();
  expect(result.find((r) => r.date === "2021-03-04").counter).toBe(2);
  expect(result.find((r) => r.date === "2021-03-04").isLastRecurrence).toBe(
    false
  );
  expect(result.find((r) => r.date === "2022-03-04")).toBeDefined();
  expect(result.find((r) => r.date === "2022-03-04").counter).toBe(3);
  expect(result.find((r) => r.date === "2022-03-04").isLastRecurrence).toBe(
    true
  );
});

test("generateRecurrences throw error if frequency value is incorrect", () => {
  const transaction = {
    id: "1",
    duration: "3",
    date: "2020-03-04",
    originalAmount: 42,
  };

  expect(() => {
    generateRecurrences({
      ...transaction,
      frequency: "F",
    });
  }).toThrow(`Frequency 'F' is not a valid value (Y|M|W|D)`);

  expect(() => {
    generateRecurrences({
      ...transaction,
      frequency: "d",
    });
  }).toThrow(`Frequency 'd' is not a valid value (Y|M|W|D)`);
});

test("generateRecurrences throw error if date is instanceof Date", () => {
  const transaction = {
    id: "1",
    duration: "3",
    originalAmount: 42,
    frequency: "D",
  };

  expect(() => {
    generateRecurrences({
      ...transaction,
      date: new Date(),
    });
  }).toThrow(`Transaction date is not a valid string format`);

  expect(() => {
    generateRecurrences({
      ...transaction,
      date: "abcdef",
    });
  }).toThrow(`Transaction date is not a valid string format`);
});

test("GenerateRecurrences apply adjustement to transaction", () => {
  const result = generateRecurrences({
    id: "1",
    frequency: "Y",
    duration: "3",
    date: "2020-03-04",
    originalAmount: 42,
    adjustments: {
      0: {
        date: "2020-03-08",
        local_amount: 10,
      },
      1: {
        date: "2021-03-05",
        local_amount: 10,
      },
    },
  });

  expect(result.length).toBe(3);
  expect(result.find((r) => r.date instanceof Date)).toBeUndefined();
  expect(result.find((r) => r.date === "2020-03-08")).toBeDefined();
  expect(result.find((r) => r.date === "2020-03-08").counter).toBe(1);
  expect(result.find((r) => r.date === "2020-03-08").local_amount).toBe(10);
  expect(result.find((r) => r.date === "2020-03-08").originalAmount).toBe(10);
  expect(
    result.find((r) => r.date === "2020-03-08").beforeAdjustmentAmount
  ).toBe(42);
  expect(result.find((r) => r.date === "2020-03-08").isLastRecurrence).toBe(
    false
  );
  expect(result.find((r) => r.date === "2021-03-05")).toBeDefined();
  expect(result.find((r) => r.date === "2021-03-05").counter).toBe(2);
  expect(result.find((r) => r.date === "2021-03-05").isLastRecurrence).toBe(
    false
  );
  expect(result.find((r) => r.date === "2022-03-04")).toBeDefined();
  expect(result.find((r) => r.date === "2022-03-04").counter).toBe(3);
  expect(result.find((r) => r.date === "2022-03-04").isLastRecurrence).toBe(
    true
  );
});

test("Test february 28th monthly recurrence", () => {
  const result = generateRecurrences({
    id: "1",
    frequency: "M",
    duration: "4",
    date: "2020-01-31",
    originalAmount: 42,
  });

  expect(result.length).toBe(4);
  expect(result.find((r) => r.date instanceof Date)).toBeUndefined();
  expect(result.find((r) => r.date === "2020-01-31")).toBeDefined();
  expect(result.find((r) => r.date === "2020-02-29")).toBeDefined();
  expect(result.find((r) => r.date === "2020-03-31")).toBeDefined();
  expect(result.find((r) => r.date === "2020-04-30")).toBeDefined();
});

test("Test february 28th on yearly recurrence", () => {
  const result = generateRecurrences({
    id: "1",
    frequency: "Y",
    duration: "5",
    date: "2020-02-29",
    originalAmount: 42,
  });

  expect(result.length).toBe(5);
  expect(result.find((r) => r.date instanceof Date)).toBeUndefined();
  expect(result.find((r) => r.date === "2020-02-29")).toBeDefined();
  expect(result.find((r) => r.date === "2021-02-28")).toBeDefined();
  expect(result.find((r) => r.date === "2022-02-28")).toBeDefined();
  expect(result.find((r) => r.date === "2023-02-28")).toBeDefined();
  expect(result.find((r) => r.date === "2024-02-29")).toBeDefined();
});
