import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// 所有路由都需要認證
router.use(authenticateToken);

// 取得使用者的所有資料夾
router.get('/', async (req, res): Promise<void> => {
  try {
    const userId = req.user!.id;

    const collections = await prisma.collection.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { entries: true }
        }
      }
    });

    res.json({
      message: '取得資料夾成功',
      data: collections
    });
  } catch (error) {
    console.error('取得資料夾錯誤:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: '取得資料夾時發生錯誤'
    });
  }
});

// 新增資料夾
router.post('/', async (req, res): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { name, color } = req.body;

    if (!name) {
      res.status(400).json({
        error: 'Bad Request',
        message: '請提供資料夾名稱'
      });
      return;
    }

    const collection = await prisma.collection.create({
      data: {
        name,
        color,
        userId
      }
    });

    res.status(201).json({
      message: '新增資料夾成功',
      data: collection
    });
  } catch (error) {
    console.error('新增資料夾錯誤:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: '新增資料夾時發生錯誤'
    });
  }
});

// 更新資料夾
router.put('/:id', async (req, res): Promise<void> => {
  try {
    const userId = req.user!.id;
    const collectionId = parseInt(req.params.id);
    const { name, color } = req.body;

    if (!name) {
      res.status(400).json({
        error: 'Bad Request',
        message: '請提供資料夾名稱'
      });
      return;
    }

    // 檢查資料夾是否存在且屬於該使用者
    const existingCollection = await prisma.collection.findFirst({
      where: {
        id: collectionId,
        userId
      }
    });

    if (!existingCollection) {
      res.status(404).json({
        error: 'Not Found',
        message: '資料夾不存在'
      });
      return;
    }

    const collection = await prisma.collection.update({
      where: { id: collectionId },
      data: { name, color }
    });

    res.json({
      message: '更新資料夾成功',
      data: collection
    });
  } catch (error) {
    console.error('更新資料夾錯誤:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: '更新資料夾時發生錯誤'
    });
  }
});

// 刪除資料夾
router.delete('/:id', async (req, res): Promise<void> => {
  try {
    const userId = req.user!.id;
    const collectionId = parseInt(req.params.id);

    // 檢查資料夾是否存在且屬於該使用者
    const existingCollection = await prisma.collection.findFirst({
      where: {
        id: collectionId,
        userId
      }
    });

    if (!existingCollection) {
      res.status(404).json({
        error: 'Not Found',
        message: '資料夾不存在'
      });
      return;
    }

    await prisma.collection.delete({
      where: { id: collectionId }
    });

    res.json({
      message: '刪除資料夾成功'
    });
  } catch (error) {
    console.error('刪除資料夾錯誤:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: '刪除資料夾時發生錯誤'
    });
  }
});

export default router;