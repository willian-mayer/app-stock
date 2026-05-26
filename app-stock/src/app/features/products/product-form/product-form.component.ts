import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { Product, Category } from '../../../core/models/models';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
})
export class ProductFormComponent implements OnInit {
  @Input() product: Product | null = null;
  @Input() categories: Category[] = [];
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  form!: FormGroup;
  loading = false;
  error = '';

  constructor(private fb: FormBuilder, private productService: ProductService) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name:        [this.product?.name || '', [Validators.required]],
      sku:         [this.product?.sku  || '', [Validators.required]],
      description: [this.product?.description || ''],
      category:    [this.product?.category?._id || '', [Validators.required]],
      price:       [this.product?.price ?? 0, [Validators.required, Validators.min(0)]],
      stock:       [this.product?.stock ?? 0, [Validators.required, Validators.min(0)]],
      minStock:    [this.product?.minStock ?? 5, [Validators.required, Validators.min(0)]],
      unit:        [this.product?.unit || 'unit'],
    });
  }

  get isEdit(): boolean { return !!this.product; }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';

    const action = this.isEdit
      ? this.productService.updateProduct(this.product!._id, this.form.value)
      : this.productService.createProduct(this.form.value);

    action.subscribe({
      next: () => { this.loading = false; this.saved.emit(); },
      error: (err) => { this.error = err.error?.message || 'An error occurred'; this.loading = false; },
    });
  }
}
