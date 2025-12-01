// src/infra/repos/prisma-dashboard.repository.ts

import { Injectable } from "@nestjs/common";
import { PrismaService } from '../../db/prisma.service';
import {
  DashboardRepository,
} from "../../../domain/dashboard/dashboard-repository";
import {
  DashboardMetrics,
  RevenuePoint,
  CategorySlice,
  RecentOrder,
} from "../../../domain/dashboard/dashboard-metrics";

@Injectable()
export class PrismaDashboardRepository implements DashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getMetrics(reference: Date): Promise<DashboardMetrics> {
    const ref = new Date(reference);

    const startOfDay = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate(), 0, 0, 0);
    const startOfMonth = new Date(ref.getFullYear(), ref.getMonth(), 1, 0, 0, 0);
    const startOfYear = new Date(ref.getFullYear(), 0, 1, 0, 0, 0);

    // Pega todos os pedidos do ano atual (exceto CANCELADO)
    const pedidosYear = await this.prisma.pedido.findMany({
      where: {
        createdAt: { gte: startOfYear },
        status: { not: "CANCELADO" },
      },
      include: {
        itens: {
          include: {
            produto: {
              include: { categoria: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Filtros derivados
    const pedidosToday = pedidosYear.filter((p) =>
      isSameDay(p.createdAt, startOfDay),
    );

    const pedidosMonth = pedidosYear.filter((p) =>
      isSameMonth(p.createdAt, startOfMonth),
    );

    // ---------- KPIs ----------
    const revenueToday = sum(pedidosToday.map((p) => p.total));
    const ordersToday = pedidosToday.length;

    // "Pendentes" = RECEBIDO + PREPARO + PRONTO (ajusta se quiser outra regra)
    const pendingOrders = pedidosToday.filter((p) =>
      ["RECEBIDO", "PREPARO", "PRONTO"].includes(p.status),
    ).length;

    // cafés vendidos hoje (conta quantidade onde categoria = "Cafés")
    let coffeesSoldToday = 0;
    for (const pedido of pedidosToday) {
      for (const item of pedido.itens) {
        const catName = item.produto?.categoria?.nome ?? "";
        if (normalize(catName) === "cafes") {
          coffeesSoldToday += item.quantidade;
        }
      }
    }

    const kpis = {
      revenueToday: Number(revenueToday),
      ordersToday,
      coffeesSoldToday,
      pendingOrders,
    };

    // ---------- Receita por hora (06h–20h, hoje) ----------
    const revenueByHour: RevenuePoint[] = [];
    const bucketsHour: Record<number, number> = {};

    for (let h = 6; h <= 20; h++) {
      bucketsHour[h] = 0;
    }

    for (const pedido of pedidosToday) {
      const hour = pedido.createdAt.getHours();
      if (hour >= 6 && hour <= 20) {
        bucketsHour[hour] = (bucketsHour[hour] ?? 0) + Number(pedido.total);
      }
    }

    for (let h = 6; h <= 20; h++) {
      revenueByHour.push({
        label: `${h.toString().padStart(2, "0")}h`,
        value: bucketsHour[h] ?? 0,
      });
    }

    // ---------- Receita por dia do mês ----------
    const daysInMonth = new Date(ref.getFullYear(), ref.getMonth() + 1, 0).getDate();
    const bucketsDay: Record<number, number> = {};

    for (let d = 1; d <= daysInMonth; d++) {
      bucketsDay[d] = 0;
    }

    for (const pedido of pedidosMonth) {
      const day = pedido.createdAt.getDate();
      bucketsDay[day] = (bucketsDay[day] ?? 0) + Number(pedido.total);
    }

    const revenueByDayInMonth: RevenuePoint[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      revenueByDayInMonth.push({
        label: d.toString().padStart(2, "0"),
        value: bucketsDay[d] ?? 0,
      });
    }

    // ---------- Receita por mês do ano ----------
    const bucketsMonth: Record<number, number> = {};
    for (let m = 0; m < 12; m++) {
      bucketsMonth[m] = 0;
    }

    for (const pedido of pedidosYear) {
      const m = pedido.createdAt.getMonth();
      bucketsMonth[m] = (bucketsMonth[m] ?? 0) + Number(pedido.total);
    }

    const monthLabels = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
    const revenueByMonthInYear: RevenuePoint[] = monthLabels.map((label, idx) => ({
      label,
      value: bucketsMonth[idx] ?? 0,
    }));

    // ---------- Pizza por categoria (usando pedidos do mês) ----------
    const categoryBuckets: Record<string, number> = {};

    for (const pedido of pedidosMonth) {
      for (const item of pedido.itens) {
        const catName = item.produto?.categoria?.nome ?? "Outros";
        const key = catName;
        categoryBuckets[key] = (categoryBuckets[key] ?? 0) + item.quantidade;
      }
    }

    const categories: CategorySlice[] = Object.entries(categoryBuckets)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // ---------- Pedidos recentes ----------
    const recent: RecentOrder[] = pedidosYear.slice(0, 5).map((p) => ({
      id: p.id,
      numero: p.numero,
      mesa: p.mesa,
      total: Number(p.total),
      status: p.status,
      createdAt: p.createdAt,
    }));

    return {
      kpis,
      revenueByHour,
      revenueByDayInMonth,
      revenueByMonthInYear,
      categories,
      recent,
    };
  }
}

/** Helpers **/

function sum(values: any[]): number {
  return values.reduce((acc, v) => acc + Number(v ?? 0), 0);
}

function isSameDay(a: Date, startOfDay: Date): boolean {
  return (
    a.getFullYear() === startOfDay.getFullYear() &&
    a.getMonth() === startOfDay.getMonth() &&
    a.getDate() === startOfDay.getDate()
  );
}

function isSameMonth(a: Date, startOfMonth: Date): boolean {
  return (
    a.getFullYear() === startOfMonth.getFullYear() &&
    a.getMonth() === startOfMonth.getMonth()
  );
}

function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "");
}
