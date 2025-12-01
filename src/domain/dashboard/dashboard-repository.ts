// src/domain/dashboard/dashboard-repository.ts

import { DashboardMetrics } from "./dashboard-metrics";

export abstract class DashboardRepository {
  abstract getMetrics(reference: Date): Promise<DashboardMetrics>;
}
