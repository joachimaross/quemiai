# Monitoring Guide

## Health Endpoints

### /health/live
- This endpoint should always return a status code of 200.

### /health/ready
- This endpoint should check the health of external dependencies such as DB and Redis.
- It should return a status code of 503 if any dependencies are unhealthy.