"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginationUtils = void 0;
class PaginationUtils {
    static getOffset(page = 1, limit = 10) {
        return (page - 1) * limit;
    }
    static buildPaginationResult(data, total, page = 1, limit = 10) {
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
    static normalizePaginationParams(page, limit) {
        const normalizedPage = Math.max(1, page || 1);
        const normalizedLimit = Math.min(100, Math.max(1, limit || 10));
        return {
            page: normalizedPage,
            limit: normalizedLimit,
        };
    }
}
exports.PaginationUtils = PaginationUtils;
//# sourceMappingURL=pagination.utils.js.map