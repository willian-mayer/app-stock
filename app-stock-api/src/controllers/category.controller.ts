import { Request, Response } from 'express';
import Category from '../models/Category';
import Product from '../models/Product';

export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (error: unknown) {
    if ((error as { code?: number }).code === 11000) {
      res.status(409).json({ message: 'Category already exists' });
      return;
    }
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const productsInCategory = await Product.countDocuments({ category: req.params.id });
    if (productsInCategory > 0) {
      res.status(400).json({ message: 'Cannot delete category with existing products' });
      return;
    }
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
