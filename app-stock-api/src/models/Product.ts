import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  sku: string;
  description?: string;
  category: mongoose.Types.ObjectId;
  price: number;
  stock: number;
  minStock: number;
  unit: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, trim: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    minStock: { type: Number, required: true, min: 0, default: 5 },
    unit: { type: String, default: 'unit', trim: true },
    imageUrl: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Virtual: is low stock?
ProductSchema.virtual('isLowStock').get(function () {
  return this.stock <= this.minStock;
});

ProductSchema.set('toJSON', { virtuals: true });

// Index for search
ProductSchema.index({ name: 'text', sku: 'text', description: 'text' });

export default mongoose.model<IProduct>('Product', ProductSchema);
