import { Request, Response } from 'express';
import Product from '../models/Product';
import Category from '../models/Category';

export const getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [
      totalProducts,
      totalCategories,
      lowStockProducts,
      outOfStockProducts,
      stockByCategory,
      recentProducts,
    ] = await Promise.all([
      Product.countDocuments({ isActive: true }),
      Category.countDocuments(),
      Product.countDocuments({
        isActive: true,
        $expr: { $lte: ['$stock', '$minStock'] },
      }),
      Product.countDocuments({ isActive: true, stock: 0 }),
      Product.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: '$category',
            totalStock: { $sum: '$stock' },
            totalProducts: { $count: {} },
            totalValue: { $sum: { $multiply: ['$stock', '$price'] } },
          },
        },
        {
          $lookup: {
            from: 'categories',
            localField: '_id',
            foreignField: '_id',
            as: 'category',
          },
        },
        { $unwind: '$category' },
        {
          $project: {
            categoryName: '$category.name',
            categoryColor: '$category.color',
            totalStock: 1,
            totalProducts: 1,
            totalValue: 1,
          },
        },
        { $sort: { totalValue: -1 } },
      ]),
      Product.find({ isActive: true })
        .populate('category', 'name color')
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    const totalInventoryValue = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: { $multiply: ['$stock', '$price'] } } } },
    ]);

    res.json({
      summary: {
        totalProducts,
        totalCategories,
        lowStockProducts,
        outOfStockProducts,
        totalInventoryValue: totalInventoryValue[0]?.total || 0,
      },
      stockByCategory,
      recentProducts,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getLowStockAlerts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const alerts = await Product.find({
      isActive: true,
      $expr: { $lte: ['$stock', '$minStock'] },
    })
      .populate('category', 'name color')
      .sort({ stock: 1 });

    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
