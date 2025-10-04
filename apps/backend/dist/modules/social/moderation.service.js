"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ModerationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModerationService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let ModerationService = ModerationService_1 = class ModerationService {
    constructor() {
        this.prisma = new client_1.PrismaClient();
        this.logger = new common_1.Logger(ModerationService_1.name);
    }
    async createReport(reporterId, reportedId, entityType, entityId, reason, description) {
        const report = await this.prisma.report.create({
            data: {
                reporterId,
                reportedId,
                entityType,
                entityId,
                reason,
                description,
                status: 'pending',
            },
            include: {
                reporter: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
                reported: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
        });
        this.logger.log(`Report created: ${report.id} for ${entityType}:${entityId}`);
        return report;
    }
    async getReports(status, entityType, limit = 100) {
        const reports = await this.prisma.report.findMany({
            where: {
                ...(status && { status }),
                ...(entityType && { entityType }),
            },
            include: {
                reporter: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
                reported: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
        return reports;
    }
    async getReport(reportId) {
        const report = await this.prisma.report.findUnique({
            where: { id: reportId },
            include: {
                reporter: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
                reported: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
        });
        if (!report) {
            throw new common_1.NotFoundException('Report not found');
        }
        return report;
    }
    async updateReportStatus(reportId, status, reviewerId, resolution) {
        const report = await this.prisma.report.update({
            where: { id: reportId },
            data: {
                status,
                reviewedBy: reviewerId,
                reviewedAt: new Date(),
                resolution: resolution ? JSON.stringify(resolution) : null,
            },
            include: {
                reporter: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
                reported: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
        });
        this.logger.log(`Report ${reportId} updated to status: ${status}`);
        return report;
    }
    async getEntityReports(entityType, entityId) {
        const reports = await this.prisma.report.findMany({
            where: {
                entityType,
                entityId,
            },
            include: {
                reporter: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
                reported: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return reports;
    }
    async getUserReports(userId) {
        const reports = await this.prisma.report.findMany({
            where: { reporterId: userId },
            include: {
                reported: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return reports;
    }
    async getReportsAgainstUser(userId) {
        const reports = await this.prisma.report.findMany({
            where: { reportedId: userId },
            include: {
                reporter: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return reports;
    }
    async getModerationStats() {
        const [totalReports, pendingReports, reviewingReports, resolvedReports, dismissedReports] = await Promise.all([
            this.prisma.report.count(),
            this.prisma.report.count({ where: { status: 'pending' } }),
            this.prisma.report.count({ where: { status: 'reviewing' } }),
            this.prisma.report.count({ where: { status: 'resolved' } }),
            this.prisma.report.count({ where: { status: 'dismissed' } }),
        ]);
        const reportsByType = await this.prisma.report.groupBy({
            by: ['entityType'],
            _count: true,
        });
        const reportsByReason = await this.prisma.report.groupBy({
            by: ['reason'],
            _count: true,
        });
        return {
            total: totalReports,
            byStatus: {
                pending: pendingReports,
                reviewing: reviewingReports,
                resolved: resolvedReports,
                dismissed: dismissedReports,
            },
            byType: reportsByType.reduce((acc, item) => {
                acc[item.entityType] = item._count;
                return acc;
            }, {}),
            byReason: reportsByReason.reduce((acc, item) => {
                acc[item.reason] = item._count;
                return acc;
            }, {}),
        };
    }
};
exports.ModerationService = ModerationService;
exports.ModerationService = ModerationService = ModerationService_1 = __decorate([
    (0, common_1.Injectable)()
], ModerationService);
//# sourceMappingURL=moderation.service.js.map