import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';

@Injectable()
export class ProjectionLagIndicator extends HealthIndicator {
  // In a real scenario, this would query EventStore version and ReadModel version
  // and compute the difference. Here we mock it.
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    await Promise.resolve(); // Mock async behavior
    const lag = 0; // Mocked zero lag
    const isHealthy = lag < 50;

    const result = this.getStatus(key, isHealthy, { lag });
    if (isHealthy) {
      return result;
    }
    throw new HealthCheckError('Projection lag too high', result);
  }
}
