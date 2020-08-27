import { filteringCategoryFunction, generateRecurrences } from "./transaction";

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
