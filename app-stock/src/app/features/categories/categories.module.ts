import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CategoriesComponent } from './categories.component';

const routes: Routes = [{ path: '', component: CategoriesComponent }];

@NgModule({
  declarations: [CategoriesComponent],
  imports: [CommonModule, RouterModule.forChild(routes), ReactiveFormsModule, FormsModule],
})
export class CategoriesModule {}