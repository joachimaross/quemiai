export declare class ModerationService {
    private readonly prisma;
    private readonly logger;
    createReport(reporterId: string, reportedId: string, entityType: string, entityId: string, reason: string, description?: string): Promise<any>;
    getReports(status?: string, entityType?: string, limit?: number): Promise<any>;
    getReport(reportId: string): Promise<any>;
    updateReportStatus(reportId: string, status: string, reviewerId: string, resolution?: Record<string, unknown>): Promise<any>;
    getEntityReports(entityType: string, entityId: string): Promise<any>;
    getUserReports(userId: string): Promise<any>;
    getReportsAgainstUser(userId: string): Promise<any>;
    getModerationStats(): Promise<{
        total: any;
        byStatus: {
            pending: any;
            reviewing: any;
            resolved: any;
            dismissed: any;
        };
        byType: any;
        byReason: any;
    }>;
}
