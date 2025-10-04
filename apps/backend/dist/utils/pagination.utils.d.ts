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
export declare class PaginationUtils {
    static getOffset(page?: number, limit?: number): number;
    static buildPaginationResult<T>(data: T[], total: number, page?: number, limit?: number): PaginationResult<T>;
    static normalizePaginationParams(page?: number, limit?: number): {
        page: number;
        limit: number;
    };
}
