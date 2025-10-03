import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const apiLatency = new Trend('api_latency');
const requestCounter = new Counter('total_requests');

// Test configuration - simulates realistic mixed traffic
export const options = {
  scenarios: {
    // Light background load
    background_load: {
      executor: 'constant-vus',
      vus: 5,
      duration: '5m',
    },
    // Periodic spike in traffic
    spike_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 0 },   // Wait
        { duration: '30s', target: 50 },  // Spike up
        { duration: '1m', target: 50 },   // Maintain spike
        { duration: '30s', target: 0 },   // Spike down
      ],
      startTime: '1m',
    },
  },
  thresholds: {
    'http_req_duration': ['p(95)<300', 'p(99)<1000'],
    'http_req_failed': ['rate<0.01'],
    'errors': ['rate<0.1'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000';

// Weighted endpoint selection
const endpoints = [
  { path: '/health', weight: 30 },
  { path: '/health/ready', weight: 10 },
  { path: '/health/live', weight: 10 },
  { path: '/', weight: 25 },
  { path: '/metrics', weight: 5 },
  { path: '/getHello', weight: 20 },
];

function selectEndpoint() {
  const totalWeight = endpoints.reduce((sum, e) => sum + e.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const endpoint of endpoints) {
    random -= endpoint.weight;
    if (random <= 0) {
      return endpoint.path;
    }
  }
  
  return endpoints[0].path;
}

export default function () {
  const endpoint = selectEndpoint();
  const url = `${BASE_URL}${endpoint}`;

  requestCounter.add(1);

  const res = http.get(url, {
    headers: {
      'User-Agent': 'k6-load-test',
      'X-Test-Type': 'mixed-workload',
    },
  });

  check(res, {
    'status is 200 or 503': (r) => r.status === 200 || r.status === 503,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  errorRate.add(res.status >= 500 && res.status !== 503);
  apiLatency.add(res.timings.duration);

  // Simulate realistic think time
  sleep(Math.random() * 2 + 1); // 1-3 seconds
}

export function handleSummary(data) {
  const summary = {
    timestamp: new Date().toISOString(),
    test_type: 'mixed-workload',
    duration_seconds: data.state.testRunDurationMs / 1000,
    total_requests: data.metrics.total_requests ? data.metrics.total_requests.values.count : 0,
    error_rate: data.metrics.errors ? data.metrics.errors.values.rate : 0,
    http_req_duration_p95: data.metrics.http_req_duration ? data.metrics.http_req_duration.values['p(95)'] : 0,
    http_req_duration_p99: data.metrics.http_req_duration ? data.metrics.http_req_duration.values['p(99)'] : 0,
    http_req_failed_rate: data.metrics.http_req_failed ? data.metrics.http_req_failed.values.rate : 0,
    checks_passed_rate: data.metrics.checks ? data.metrics.checks.values.passes / data.metrics.checks.values.count : 0,
  };

  console.log('\n=== Load Test Summary ===');
  console.log(`Test Type: ${summary.test_type}`);
  console.log(`Duration: ${summary.duration_seconds}s`);
  console.log(`Total Requests: ${summary.total_requests}`);
  console.log(`Error Rate: ${(summary.error_rate * 100).toFixed(2)}%`);
  console.log(`P95 Latency: ${summary.http_req_duration_p95.toFixed(2)}ms`);
  console.log(`P99 Latency: ${summary.http_req_duration_p99.toFixed(2)}ms`);
  console.log(`Failed Requests: ${(summary.http_req_failed_rate * 100).toFixed(2)}%`);
  console.log(`Checks Passed: ${(summary.checks_passed_rate * 100).toFixed(2)}%`);
  console.log('========================\n');

  return {
    'tests/load/results/mixed-workload-summary.json': JSON.stringify(summary, null, 2),
    'tests/load/results/mixed-workload-full.json': JSON.stringify(data, null, 2),
  };
}
