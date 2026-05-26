import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardStats, Product } from '../../core/models/models';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  alerts: Product[] = [];
  loading = true;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });

    this.dashboardService.getAlerts().subscribe({
      next: (data) => (this.alerts = data.slice(0, 5)),
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }

  getStockPercent(product: Product): number {
    if (product.minStock === 0) return 100;
    return Math.min(100, Math.round((product.stock / product.minStock) * 100));
  }


  getBarWidth(value: number): number {
    if (!this.stats || this.stats.stockByCategory.length === 0) return 0;
    const max = Math.max(...this.stats.stockByCategory.map(c => c.totalValue));
    if (max === 0) return 0;
    return Math.round((value / max) * 100);
  }
  getStockClass(product: Product): string {
    if (product.stock === 0) return 'danger';
    if (product.stock <= product.minStock) return 'warning';
    return 'success';
  }
}

// Método para calcular ancho de barra en porcentaje relativo al máximo
