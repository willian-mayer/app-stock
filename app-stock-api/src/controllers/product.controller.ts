import { Request, Response } from 'express';
import Product from '../models/Product';

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, category, lowStock, page = 1, limit = 10 } = req.query;

    const filter: Record<string, unknown> = { isActive: true };

    if (search) {
      filter.$text = { $search: search as string };
    }
    if (category) {
      filter.category = category;
    }
    if (lowStock === 'true') {
      filter.$expr = { $lte: ['$stock', '$minStock'] };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate('category', 'name color')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      data: products,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name color');
    if (!product || !product.isActive) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.create(req.body);
    await product.populate('category', 'name color');
    res.status(201).json(product);
  } catch (error: unknown) {
    if ((error as { code?: number }).code === 11000) {
      res.status(409).json({ message: 'SKU already exists' });
      return;
    }
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('category', 'name color');

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const { quantity, operation } = req.body; // operation: 'add' | 'subtract' | 'set'
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    if (operation === 'add') product.stock += quantity;
    else if (operation === 'subtract') {
      if (product.stock < quantity) {
        res.status(400).json({ message: 'Insufficient stock' });
        return;
      }
      product.stock -= quantity;
    } else {
      product.stock = quantity;
    }

    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
