import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class ModerationService {
  private readonly prisma = new PrismaClient();
  private readonly logger = new Logger(ModerationService.name);

  /**
   * Create a report
   */
  async createReport(
    reporterId: string,
    reportedId: string,
    entityType: string,
    entityId: string,
    reason: string,
    description?: string,
  ) {
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

    this.logger.log(
      `Report created: ${report.id} for ${entityType}:${entityId}`,
    );
    return report;
  }

  /**
   * Get all reports (for moderators)
   */
  async getReports(status?: string, entityType?: string, limit: number = 100) {
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

  /**
   * Get a single report
   */
  async getReport(reportId: string) {
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
      throw new NotFoundException('Report not found');
    }

    return report;
  }

  /**
   * Update report status
   */
  async updateReportStatus(
    reportId: string,
    status: string,
    reviewerId: string,
    resolution?: Record<string, unknown>,
  ) {
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

  /**
   * Get reports for a specific entity
   */
  async getEntityReports(entityType: string, entityId: string) {
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

  /**
   * Get reports filed by a user
   */
  async getUserReports(userId: string) {
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

  /**
   * Get reports against a user
   */
  async getReportsAgainstUser(userId: string) {
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

  /**
   * Get moderation statistics
   */
  async getModerationStats() {
    const [
      totalReports,
      pendingReports,
      reviewingReports,
      resolvedReports,
      dismissedReports,
    ] = await Promise.all([
      this.prisma.report.count(),
      this.prisma.report.count({ where: { status: 'pending' } }),
      this.prisma.report.count({ where: { status: 'reviewing' } }),
      this.prisma.report.count({ where: { status: 'resolved' } }),
      this.prisma.report.count({ where: { status: 'dismissed' } }),
    ]);

    // Get report counts by entity type
    const reportsByType = await this.prisma.report.groupBy({
      by: ['entityType'],
      _count: true,
    });

    // Get report counts by reason
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
      byType: reportsByType.reduce(
        (acc, item) => {
          acc[item.entityType] = item._count;
          return acc;
        },
        {} as Record<string, number>,
      ),
      byReason: reportsByReason.reduce(
        (acc, item) => {
          acc[item.reason] = item._count;
          return acc;
        },
        {} as Record<string, number>,
      ),
    };
  }
}
