// src/infra/http/dashboard.controller.ts

import { Controller, Get } from "@nestjs/common";
import { GetDashboardMetricsUseCase } from "../../../application/use-cases/dashboard/get-dashboard-metrics.use-case";

@Controller("dashboard")
export class DashboardController {
  constructor(
    private readonly getDashboardMetrics: GetDashboardMetricsUseCase,
  ) {}

  @Get("metrics")
  async metrics() {
    const metrics = await this.getDashboardMetrics.execute(new Date());

    // Aqui já retornamos num formato bem próximo do front
    return {
      kpis: metrics.kpis,
      revenueByHour: metrics.revenueByHour,
      revenueByDayInMonth: metrics.revenueByDayInMonth,
      revenueByMonthInYear: metrics.revenueByMonthInYear,
      categories: metrics.categories,
      recent: metrics.recent.map((p) => ({
        id: p.id,
        numero: p.numero,
        cliente: `Mesa ${p.mesa}`,
        total: p.total,
        status: mapStatusToLabel(p.status), // "Pago", "Pendente", "Cancelado"
        hora: formatHour(p.createdAt),
      })),
    };
  }
}

// mapeia PedidoStatus do banco para labels usados no front
function mapStatusToLabel(status: string): "Pago" | "Pendente" | "Cancelado" {
  if (status === "CANCELADO") return "Cancelado";
  if (status === "ENTREGUE") return "Pago";
  // RECEBIDO, PREPARO, PRONTO => Pendente
  return "Pendente";
}

function formatHour(d: Date): string {
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}
