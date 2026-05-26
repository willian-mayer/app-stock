import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { Product, Category, Pagination } from '../../../core/models/models';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  pagination: Pagination = { total: 0, page: 1, limit: 10, pages: 0 };
  loading = true;

  // Filters
  search = '';
  selectedCategory = '';
  showLowStock = false;

  // Modal
  showModal = false;
  editingProduct: Product | null = null;
  deleteTarget: Product | null = null;
  showDeleteConfirm = false;

  constructor(private productService: ProductService, private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadProducts();
    this.categoryService.getCategories().subscribe(cats => (this.categories = cats));
  }

  loadProducts(page = 1): void {
    this.loading = true;
    this.productService
      .getProducts({
        search: this.search || undefined,
        category: this.selectedCategory || undefined,
        lowStock: this.showLowStock || undefined,
        page,
        limit: this.pagination.limit,
      })
      .subscribe({
        next: (res) => {
          this.products = res.data;
          this.pagination = res.pagination;
          this.loading = false;
        },
        error: () => (this.loading = false),
      });
  }

  onSearch(): void {
    this.loadProducts(1);
  }

  openCreate(): void {
    this.editingProduct = null;
    this.showModal = true;
  }

  openEdit(product: Product): void {
    this.editingProduct = product;
    this.showModal = true;
  }

  confirmDelete(product: Product): void {
    this.deleteTarget = product;
    this.showDeleteConfirm = true;
  }

  doDelete(): void {
    if (!this.deleteTarget) return;
    this.productService.deleteProduct(this.deleteTarget._id).subscribe(() => {
      this.showDeleteConfirm = false;
      this.deleteTarget = null;
      this.loadProducts(this.pagination.page);
    });
  }

  onSaved(): void {
    this.showModal = false;
    this.loadProducts(this.pagination.page);
  }

  getStockClass(p: Product): string {
    if (p.stock === 0) return 'danger';
    if (p.isLowStock) return 'warning';
    return 'success';
  }

  getPages(): number[] {
    return Array.from({ length: this.pagination.pages }, (_, i) => i + 1);
  }
}
