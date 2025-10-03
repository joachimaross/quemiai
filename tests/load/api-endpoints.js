import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const apiLatency = new Trend('api_latency');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 10 }, // Ramp up to 10 users
    { duration: '1m', target: 10 },  // Stay at 10 users
    { duration: '30s', target: 50 }, // Ramp up to 50 users
    { duration: '2m', target: 50 },  // Stay at 50 users
    { duration: '30s', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    'http_req_duration': ['p(95)<200', 'p(99)<500'], // 95% of requests should be below 200ms
    'http_req_failed': ['rate<0.01'],                 // Less than 1% of requests should fail
    'errors': ['rate<0.1'],                           // Error rate should be below 10%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000';

export default function () {
  // Test health endpoint
  let healthRes = http.get(`${BASE_URL}/health`);
  check(healthRes, {
    'health check status is 200': (r) => r.status === 200,
    'health check has status field': (r) => JSON.parse(r.body).status === 'ok',
  });
  errorRate.add(healthRes.status !== 200);
  apiLatency.add(healthRes.timings.duration);

  sleep(1);

  // Test ready endpoint
  let readyRes = http.get(`${BASE_URL}/health/ready`);
  check(readyRes, {
    'ready check status is 200 or 503': (r) => r.status === 200 || r.status === 503,
  });
  errorRate.add(readyRes.status >= 500 && readyRes.status !== 503);
  apiLatency.add(readyRes.timings.duration);

  sleep(1);

  // Test live endpoint
  let liveRes = http.get(`${BASE_URL}/health/live`);
  check(liveRes, {
    'live check status is 200': (r) => r.status === 200,
  });
  errorRate.add(liveRes.status !== 200);
  apiLatency.add(liveRes.timings.duration);

  sleep(1);

  // Test main endpoint
  let mainRes = http.get(`${BASE_URL}/`);
  check(mainRes, {
    'main endpoint status is 200': (r) => r.status === 200,
  });
  errorRate.add(mainRes.status !== 200);
  apiLatency.add(mainRes.timings.duration);

  sleep(1);

  // Test metrics endpoint
  let metricsRes = http.get(`${BASE_URL}/metrics`);
  check(metricsRes, {
    'metrics endpoint status is 200': (r) => r.status === 200,
    'metrics endpoint returns prometheus format': (r) => r.body.includes('http_requests_total'),
  });
  errorRate.add(metricsRes.status !== 200);
  apiLatency.add(metricsRes.timings.duration);

  sleep(2);
}

export function handleSummary(data) {
  return {
    'tests/load/results/api-endpoints-summary.json': JSON.stringify(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options = {}) {
  const indent = options.indent || '';
  const enableColors = options.enableColors || false;

  let output = '\n';
  output += `${indent}checks.........................: ${formatPercent(data.metrics.checks.values.passes / data.metrics.checks.values.count)}\n`;
  output += `${indent}data_received..................: ${formatBytes(data.metrics.data_received.values.count)}\n`;
  output += `${indent}data_sent......................: ${formatBytes(data.metrics.data_sent.values.count)}\n`;
  output += `${indent}http_req_blocked...............: avg=${formatDuration(data.metrics.http_req_blocked.values.avg)}\n`;
  output += `${indent}http_req_connecting............: avg=${formatDuration(data.metrics.http_req_connecting.values.avg)}\n`;
  output += `${indent}http_req_duration..............: avg=${formatDuration(data.metrics.http_req_duration.values.avg)} p(95)=${formatDuration(data.metrics.http_req_duration.values['p(95)'])} p(99)=${formatDuration(data.metrics.http_req_duration.values['p(99)'])}\n`;
  output += `${indent}http_req_failed................: ${formatPercent(data.metrics.http_req_failed.values.rate)}\n`;
  output += `${indent}http_reqs......................: ${data.metrics.http_reqs.values.count} (${formatRate(data.metrics.http_reqs.values.rate)})\n`;
  output += `${indent}iterations.....................: ${data.metrics.iterations.values.count}\n`;
  output += `${indent}vus............................: ${data.metrics.vus.values.value} max=${data.metrics.vus_max.values.value}\n`;

  return output;
}

function formatPercent(value) {
  return `${(value * 100).toFixed(2)}%`;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDuration(ms) {
  if (ms < 1) return `${(ms * 1000).toFixed(2)}µs`;
  if (ms < 1000) return `${ms.toFixed(2)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function formatRate(rate) {
  return `${rate.toFixed(2)}/s`;
}
