export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export class PaginationUtils {
  /**
   * Calculate pagination offset from page and limit
   */
  static getOffset(page: number = 1, limit: number = 10): number {
    return (page - 1) * limit;
  }

  /**
   * Build pagination result with metadata
   */
  static buildPaginationResult<T>(
    data: T[],
    total: number,
    page: number = 1,
    limit: number = 10,
  ): PaginationResult<T> {
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Validate and normalize pagination parameters
   */
  static normalizePaginationParams(page?: number, limit?: number): { page: number; limit: number } {
    const normalizedPage = Math.max(1, page || 1);
    const normalizedLimit = Math.min(100, Math.max(1, limit || 10));

    return {
      page: normalizedPage,
      limit: normalizedLimit,
    };
  }
}
