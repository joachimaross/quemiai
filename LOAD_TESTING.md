# Load Testing Guide

This guide provides comprehensive information on load testing the Quemiai platform using k6.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Test Scenarios](#test-scenarios)
- [Running Tests](#running-tests)
- [Interpreting Results](#interpreting-results)
- [Performance Baselines](#performance-baselines)
- [CI/CD Integration](#cicd-integration)
- [Best Practices](#best-practices)

## Overview

Load testing helps ensure the application can handle expected traffic volumes and identifies performance bottlenecks. We use [k6](https://k6.io/) for load testing due to its:

- JavaScript-based test scripts
- Built-in metrics and assertions
- Easy CI/CD integration
- Detailed result analysis

## Prerequisites

### Install k6

**macOS:**
```bash
brew install k6
```

**Linux (Debian/Ubuntu):**
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

**Windows (using Chocolatey):**
```bash
choco install k6
```

**Docker:**
```bash
docker pull grafana/k6:latest
```

### Start the Application

Before running load tests, ensure the application is running:

```bash
npm run build
npm run start:prod
```

Or using Docker:

```bash
docker-compose up -d
```

## Test Scenarios

### 1. API Endpoints Test (`api-endpoints.js`)

**Purpose:** Test individual API endpoints under load to identify performance characteristics.

**What it tests:**
- Health check endpoints (`/health`, `/health/ready`, `/health/live`)
- Main application endpoint (`/`)
- Metrics endpoint (`/metrics`)

**Load profile:**
- Ramp up: 30s to 10 users
- Steady: 1m at 10 users
- Ramp up: 30s to 50 users
- Steady: 2m at 50 users
- Ramp down: 30s to 0 users

**Thresholds:**
- P95 latency < 200ms
- P99 latency < 500ms
- Error rate < 1%

**Run:**
```bash
npm run load:test
```

Or with custom base URL:
```bash
BASE_URL=https://api.example.com k6 run tests/load/api-endpoints.js
```

### 2. WebSocket Test (`websocket.js`)

**Purpose:** Test WebSocket connection handling and message processing under load.

**What it tests:**
- WebSocket connection establishment
- Message sending and receiving
- Connection stability over time

**Load profile:**
- Ramp up: 30s to 10 concurrent connections
- Steady: 1m at 10 connections
- Ramp up: 30s to 25 connections
- Steady: 1m at 25 connections
- Ramp down: 30s to 0 connections

**Thresholds:**
- Connection success rate > 95%
- Error rate < 5%

**Run:**
```bash
npm run load:test:websocket
```

Or with custom WebSocket URL:
```bash
WS_URL=ws://api.example.com k6 run tests/load/websocket.js
```

### 3. Mixed Workload Test (`mixed-workload.js`)

**Purpose:** Simulate realistic production traffic with mixed endpoints and varying load patterns.

**What it tests:**
- Multiple endpoints with weighted distribution
- Background load + periodic traffic spikes
- Realistic user behavior (think time)

**Load profile:**
- Background: 5 constant users for 5 minutes
- Spike: 0 → 50 users over 30s, maintain 1m, ramp down 30s
- Spike starts at 1-minute mark

**Endpoint weights:**
- `/health`: 30%
- `/health/ready`: 10%
- `/health/live`: 10%
- `/`: 25%
- `/metrics`: 5%
- `/getHello`: 20%

**Thresholds:**
- P95 latency < 300ms
- P99 latency < 1000ms
- Error rate < 1%

**Run:**
```bash
npm run load:test:mixed
```

### Running All Tests

To run all load tests sequentially:
```bash
npm run load:test:all
```

## Running Tests

### Basic Usage

```bash
# Run with default settings
k6 run tests/load/api-endpoints.js

# Run with custom virtual users and duration
k6 run --vus 50 --duration 2m tests/load/api-endpoints.js

# Run with environment variables
BASE_URL=https://staging.example.com k6 run tests/load/api-endpoints.js

# Output results to file
k6 run --out json=results.json tests/load/api-endpoints.js
```

### Using Docker

```bash
docker run --rm -i grafana/k6:latest run - <tests/load/api-endpoints.js
```

### Advanced Options

```bash
# Run with custom stages
k6 run --stage 1m:10 --stage 2m:50 --stage 1m:0 tests/load/api-endpoints.js

# Run with custom thresholds
k6 run --threshold http_req_duration=p(95)<200 tests/load/api-endpoints.js

# Run with HTTP archive (HAR) input
k6 run --http-debug full tests/load/api-endpoints.js
```

## Interpreting Results

### Key Metrics

k6 provides several important metrics:

#### HTTP Metrics

- **http_req_duration**: Time for request/response cycle
  - `avg`: Average request duration
  - `p(95)`: 95th percentile (95% of requests faster than this)
  - `p(99)`: 99th percentile
  - `max`: Maximum request duration

- **http_req_failed**: Percentage of failed requests
  - Should be < 1% for healthy system

- **http_reqs**: Total number of HTTP requests
  - Rate shows requests per second

#### Virtual User Metrics

- **vus**: Current number of active virtual users
- **vus_max**: Maximum virtual users during test

#### Other Metrics

- **data_received**: Total data received from server
- **data_sent**: Total data sent to server
- **iterations**: Number of script iterations completed

### Sample Output

```
     ✓ health check status is 200
     ✓ health check has status field

     checks.........................: 100.00% ✓ 1200      ✗ 0
     data_received..................: 384 kB  6.4 kB/s
     data_sent......................: 120 kB  2.0 kB/s
     http_req_blocked...............: avg=1.2ms    min=500µs   med=1ms     max=5ms     p(90)=2ms     p(95)=2.5ms
     http_req_connecting............: avg=800µs    min=300µs   med=700µs   max=3ms     p(90)=1.2ms   p(95)=1.5ms
   ✓ http_req_duration..............: avg=45ms     min=20ms    med=40ms    max=150ms   p(90)=75ms    p(95)=95ms
       { expected_response:true }...: avg=45ms     min=20ms    med=40ms    max=150ms   p(90)=75ms    p(95)=95ms
   ✓ http_req_failed................: 0.00%   ✓ 0         ✗ 600
     http_req_receiving.............: avg=100µs    min=50µs    med=90µs    max=500µs   p(90)=150µs   p(95)=200µs
     http_req_sending...............: avg=50µs     min=20µs    med=45µs    max=200µs   p(90)=80µs    p(95)=100µs
     http_req_tls_handshaking.......: avg=0s       min=0s      med=0s      max=0s      p(90)=0s      p(95)=0s
     http_req_waiting...............: avg=44.8ms   min=19.8ms  med=39.8ms  max=149.5ms p(90)=74.8ms  p(95)=94.8ms
     http_reqs......................: 600     10/s
     iteration_duration.............: avg=6s       min=5.5s    med=6s      max=7s      p(90)=6.5s    p(95)=6.8s
     iterations.....................: 100     1.67/s
     vus............................: 10      min=10      max=50
     vus_max........................: 50      min=50      max=50
```

### Understanding Pass/Fail

- ✓ (green checkmark): Threshold passed
- ✗ (red X): Threshold failed

### Result Files

Test results are saved to `tests/load/results/`:
- `*-summary.json`: Condensed test results
- `*-full.json`: Complete test data

## Performance Baselines

### Target Metrics

Based on industry standards for APIs:

| Metric | Target | Acceptable | Poor |
|--------|--------|------------|------|
| P95 Latency | < 100ms | < 200ms | > 500ms |
| P99 Latency | < 200ms | < 500ms | > 1000ms |
| Error Rate | < 0.1% | < 1% | > 5% |
| Throughput | > 100 RPS | > 50 RPS | < 20 RPS |

### Endpoint-Specific Baselines

Different endpoints have different performance characteristics:

**Health Checks:**
- P95 < 50ms
- P99 < 100ms
- Error rate < 0.01%

**API Endpoints:**
- P95 < 200ms
- P99 < 500ms
- Error rate < 1%

**WebSocket:**
- Connection time < 100ms
- Message latency < 50ms
- Connection success rate > 99%

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/load-test.yml`:

```yaml
name: Load Testing

on:
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 2 * * *' # Run daily at 2 AM

jobs:
  load-test:
    runs-on: ubuntu-latest
    
    services:
      app:
        image: quemiai:latest
        ports:
          - 4000:4000
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Install k6
        run: |
          sudo gpg -k
          sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
          echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
          sudo apt-get update
          sudo apt-get install k6
      
      - name: Run load tests
        run: |
          k6 run tests/load/api-endpoints.js
          k6 run tests/load/mixed-workload.js
      
      - name: Upload results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: load-test-results
          path: tests/load/results/
      
      - name: Comment PR with results
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const results = JSON.parse(fs.readFileSync('tests/load/results/mixed-workload-summary.json', 'utf8'));
            
            const comment = `## Load Test Results
            
            - **Duration:** ${results.duration_seconds}s
            - **Total Requests:** ${results.total_requests}
            - **Error Rate:** ${(results.error_rate * 100).toFixed(2)}%
            - **P95 Latency:** ${results.http_req_duration_p95.toFixed(2)}ms
            - **P99 Latency:** ${results.http_req_duration_p99.toFixed(2)}ms
            `;
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });
```

### Performance Regression Detection

Store baseline results and compare:

```javascript
// In your test script
export function handleSummary(data) {
  const currentResults = {
    p95: data.metrics.http_req_duration.values['p(95)'],
    p99: data.metrics.http_req_duration.values['p(99)'],
    errorRate: data.metrics.http_req_failed.values.rate,
  };
  
  // Load baseline from file
  const baseline = JSON.parse(fs.readFileSync('baseline.json'));
  
  // Compare and fail if regression detected
  if (currentResults.p95 > baseline.p95 * 1.2) {
    throw new Error('P95 latency regression detected');
  }
  
  return {
    'stdout': JSON.stringify(currentResults, null, 2),
  };
}
```

## Best Practices

### 1. Test Environment

- **Use dedicated test environment**: Don't test on production
- **Match production resources**: Use similar CPU, memory, network
- **Isolate tests**: Avoid interference from other processes
- **Clean state**: Reset database/cache between tests

### 2. Test Design

- **Gradual ramp-up**: Don't start at peak load immediately
- **Think time**: Include realistic delays between requests
- **Realistic scenarios**: Mix endpoints like real users
- **Test edge cases**: Include error scenarios, timeouts

### 3. Monitoring During Tests

Monitor these during load tests:
- CPU usage
- Memory usage
- Database connections
- Redis connections
- Network I/O
- Disk I/O

### 4. Analyzing Results

- **Look at percentiles, not averages**: P95/P99 show user experience
- **Check error logs**: Understand what's failing
- **Identify bottlenecks**: CPU? Database? External API?
- **Compare trends**: Are results consistent?

### 5. Load Test Stages

Follow this progression:

1. **Smoke test**: 1-2 users, verify functionality
2. **Load test**: Expected average load
3. **Stress test**: Peak load
4. **Spike test**: Sudden traffic increase
5. **Soak test**: Extended duration (hours)
6. **Breakpoint test**: Find maximum capacity

### 6. Common Pitfalls

- **Testing from same machine**: Can saturate client resources
- **Not warming up**: First requests always slower
- **Ignoring network latency**: Use realistic network conditions
- **Not checking logs**: Performance issues may not show in metrics
- **Testing only happy path**: Include error cases

## Troubleshooting

### High Error Rates

1. Check application logs for errors
2. Verify connection limits (database, Redis)
3. Check rate limiting configuration
4. Ensure sufficient resources (CPU, memory)

### Poor Performance

1. Enable application profiling
2. Check database query performance
3. Review cache hit rates
4. Check external API latency
5. Analyze event loop lag

### Inconsistent Results

1. Ensure clean test environment
2. Check for background processes
3. Run multiple test iterations
4. Use longer test duration
5. Control network conditions

## Additional Resources

- [k6 Documentation](https://k6.io/docs/)
- [Performance Testing Guidance](https://k6.io/docs/testing-guides/test-types/)
- [k6 Examples](https://github.com/grafana/k6-learn)

---

**Next Steps:**
1. Establish performance baselines for your application
2. Set up automated load testing in CI/CD
3. Create alerts for performance degradation
4. Document performance requirements per endpoint
5. Schedule regular load testing (weekly/monthly)
