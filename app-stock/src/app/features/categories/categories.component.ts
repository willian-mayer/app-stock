import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryService } from '../../core/services/category.service';
import { Category } from '../../core/models/models';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  loading = true;
  showModal = false;
  editingCategory: Category | null = null;
  deleteTarget: Category | null = null;
  showDeleteConfirm = false;
  error = '';
  saving = false;

  form!: FormGroup;

  colorPresets = [
    '#6366f1', '#22c55e', '#f59e0b', '#ef4444',
    '#3b82f6', '#ec4899', '#14b8a6', '#f97316',
    '#8b5cf6', '#06b6d4',
  ];

  constructor(private categoryService: CategoryService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.categoryService.getCategories().subscribe({
      next: (cats) => { this.categories = cats; this.loading = false; },
      error: () => (this.loading = false),
    });
  }

  openCreate(): void {
    this.editingCategory = null;
    this.form = this.fb.group({
      name:        ['', Validators.required],
      description: [''],
      color:       ['#6366f1'],
    });
    this.showModal = true;
  }

  openEdit(cat: Category): void {
    this.editingCategory = cat;
    this.form = this.fb.group({
      name:        [cat.name, Validators.required],
      description: [cat.description || ''],
      color:       [cat.color],
    });
    this.showModal = true;
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.saving = true;
    this.error = '';

    const action = this.editingCategory
      ? this.categoryService.updateCategory(this.editingCategory._id, this.form.value)
      : this.categoryService.createCategory(this.form.value);

    action.subscribe({
      next: () => { this.showModal = false; this.saving = false; this.loadCategories(); },
      error: (err) => { this.error = err.error?.message || 'Error saving'; this.saving = false; },
    });
  }

  confirmDelete(cat: Category): void {
    this.deleteTarget = cat;
    this.showDeleteConfirm = true;
  }

  doDelete(): void {
    if (!this.deleteTarget) return;
    this.categoryService.deleteCategory(this.deleteTarget._id).subscribe({
      next: () => { this.showDeleteConfirm = false; this.deleteTarget = null; this.loadCategories(); },
      error: (err) => { alert(err.error?.message || 'Cannot delete'); this.showDeleteConfirm = false; },
    });
  }
}
