import { buildPaginationMeta, getPagination } from "./pagination";

describe("pagination", () => {
  it("should build pagination values with defaults", () => {
    expect(getPagination()).toEqual({
      page: 1,
      limit: 20,
      skip: 0,
    });
  });

  it("should build pagination values from input", () => {
    expect(getPagination({ page: 3, limit: 10 })).toEqual({
      page: 3,
      limit: 10,
      skip: 20,
    });
  });

  it("should build pagination metadata", () => {
    expect(buildPaginationMeta(2, 10, 35)).toEqual({
      page: 2,
      limit: 10,
      skip: 10,
      total: 35,
      totalPages: 4,
    });
  });
});
