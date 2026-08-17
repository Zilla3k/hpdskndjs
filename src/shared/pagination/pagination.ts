export type PaginationInput = {
  page?: number;
  limit?: number;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  skip: number;
  total: number;
  totalPages: number;
};

export function getPagination(input: PaginationInput = {}) {
  const page = Math.max(1, input.page ?? 1);
  const limit = Math.max(1, input.limit ?? 20);
  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
  };
}

export function buildPaginationMeta(page: number, limit: number, total: number): PaginationMeta {
  return {
    page,
    limit,
    skip: (page - 1) * limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}
