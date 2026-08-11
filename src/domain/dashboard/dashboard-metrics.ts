export type RevenuePoint = {
  label: string; 
  value: number;   
};

export type CategorySlice = {
  name: string;  
  value: number; 
};

export type RecentOrder = {
  id: string;
  numero: number;
  mesa: string;
  total: number;   
  status: string;  
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
  revenueByHour: RevenuePoint[];     
  revenueByDayInMonth: RevenuePoint[]; 
  revenueByMonthInYear: RevenuePoint[];
  categories: CategorySlice[];         
  recent: RecentOrder[];              
};
