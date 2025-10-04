import { Injectable, OnModuleInit } from '@nestjs/common';
import { Counter, Histogram, Gauge, register, collectDefaultMetrics } from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
  // HTTP metrics
  public readonly httpRequestTotal: Counter;
  public readonly httpRequestDuration: Histogram;
  public readonly httpRequestsInProgress: Gauge;

  // Database metrics
  public readonly databaseQueryDuration: Histogram;
  public readonly databaseConnectionsActive: Gauge;

  // WebSocket metrics
  public readonly websocketConnections: Gauge;
  public readonly websocketMessages: Counter;

  // Business metrics
  public readonly activeUsers: Gauge;
  public readonly apiErrors: Counter;

  constructor() {
    // Collect default metrics (CPU, memory, etc.)
    collectDefaultMetrics({
      prefix: 'quemiai_',
      gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
    });

    // HTTP request counter
    this.httpRequestTotal = new Counter({
      name: 'quemiai_http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
    });

    // HTTP request duration histogram
    this.httpRequestDuration = new Histogram({
      name: 'quemiai_http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5],
    });

    // HTTP requests in progress
    this.httpRequestsInProgress = new Gauge({
      name: 'quemiai_http_requests_in_progress',
      help: 'Number of HTTP requests currently being processed',
      labelNames: ['method', 'route'],
    });

    // Database query duration
    this.databaseQueryDuration = new Histogram({
      name: 'quemiai_database_query_duration_seconds',
      help: 'Duration of database queries in seconds',
      labelNames: ['operation', 'table'],
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2],
    });

    // Database connections
    this.databaseConnectionsActive = new Gauge({
      name: 'quemiai_database_connections_active',
      help: 'Number of active database connections',
    });

    // WebSocket connections
    this.websocketConnections = new Gauge({
      name: 'quemiai_websocket_connections',
      help: 'Number of active WebSocket connections',
    });

    // WebSocket messages
    this.websocketMessages = new Counter({
      name: 'quemiai_websocket_messages_total',
      help: 'Total number of WebSocket messages',
      labelNames: ['type', 'direction'],
    });

    // Active users
    this.activeUsers = new Gauge({
      name: 'quemiai_active_users',
      help: 'Number of currently active users',
    });

    // API errors
    this.apiErrors = new Counter({
      name: 'quemiai_api_errors_total',
      help: 'Total number of API errors',
      labelNames: ['type', 'endpoint'],
    });
  }

  onModuleInit() {
    // Initialize default values
    this.httpRequestsInProgress.set(0);
    this.websocketConnections.set(0);
    this.activeUsers.set(0);
  }

  /**
   * Get metrics in Prometheus format
   */
  async getMetrics(): Promise<string> {
    return register.metrics();
  }

  /**
   * Get content type for metrics endpoint
   */
  getContentType(): string {
    return register.contentType;
  }

  /**
   * Record HTTP request
   */
  recordHttpRequest(method: string, route: string, statusCode: number, duration: number) {
    this.httpRequestTotal.labels(method, route, statusCode.toString()).inc();
    this.httpRequestDuration.labels(method, route, statusCode.toString()).observe(duration);
  }

  /**
   * Record database query
   */
  recordDatabaseQuery(operation: string, table: string, duration: number) {
    this.databaseQueryDuration.labels(operation, table).observe(duration);
  }

  /**
   * Track HTTP request in progress
   */
  trackHttpRequestStart(method: string, route: string) {
    this.httpRequestsInProgress.labels(method, route).inc();
  }

  trackHttpRequestEnd(method: string, route: string) {
    this.httpRequestsInProgress.labels(method, route).dec();
  }

  /**
   * Track WebSocket connections
   */
  trackWebSocketConnection(connected: boolean) {
    if (connected) {
      this.websocketConnections.inc();
    } else {
      this.websocketConnections.dec();
    }
  }

  /**
   * Record WebSocket message
   */
  recordWebSocketMessage(type: string, direction: 'in' | 'out') {
    this.websocketMessages.labels(type, direction).inc();
  }

  /**
   * Update active users count
   */
  updateActiveUsers(count: number) {
    this.activeUsers.set(count);
  }

  /**
   * Record API error
   */
  recordApiError(type: string, endpoint: string) {
    this.apiErrors.labels(type, endpoint).inc();
  }
}
