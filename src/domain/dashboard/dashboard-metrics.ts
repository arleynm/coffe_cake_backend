// src/domain/dashboard/dashboard-metrics.ts

export type RevenuePoint = {
  label: string;   // ex.: "06h", "01", "Jan"
  value: number;   // valor em dinheiro (R$) ou quantidade
};

export type CategorySlice = {
  name: string;    // ex.: "Cafés", "Salgados"
  value: number;   // quantidade de itens vendidos
};

export type RecentOrder = {
  id: string;
  numero: number;
  mesa: string;
  total: number;   // R$
  status: string;  // PedidoStatus (RECEBIDO, ENTREGUE, etc.)
  createdAt: Date;
};

export type KpiMetrics = {
  revenueToday: number;
  ordersToday: number;
  coffeesSoldToday: number;
  pendingOrders: number;
};

export type DashboardMetrics = {
  kpis: KpiMetrics;
  revenueByHour: RevenuePoint[];       // hoje, 06h–20h
  revenueByDayInMonth: RevenuePoint[]; // dias do mês atual
  revenueByMonthInYear: RevenuePoint[];// meses do ano atual
  categories: CategorySlice[];         // pizza: cafés, salgados, bolos, etc.
  recent: RecentOrder[];               // últimos pedidos
};
