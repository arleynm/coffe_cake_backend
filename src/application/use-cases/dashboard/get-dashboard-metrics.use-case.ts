// src/application/use-cases/dashboard/get-dashboard-metrics.use-case.ts

import { Injectable } from "@nestjs/common";
import { DashboardRepository } from "../../../domain/dashboard/dashboard-repository";
import { DashboardMetrics } from "../../../domain/dashboard/dashboard-metrics";

@Injectable()
export class GetDashboardMetricsUseCase {
  constructor(private readonly dashboardRepo: DashboardRepository) {}

  execute(reference: Date = new Date()): Promise<DashboardMetrics> {
    return this.dashboardRepo.getMetrics(reference);
  }
}
