import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// 所有路由都需要認證
router.use(authenticateToken);

// 取得使用者的所有造訪紀錄
router.get('/', async (req, res): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { placeId } = req.query;

    const whereClause: any = { userId };
    if (placeId) {
      whereClause.placeId = parseInt(placeId as string);
    }

    const entries = await prisma.entry.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        place: true
      }
    });

    res.json({
      message: '取得造訪紀錄成功',
      data: entries
    });
  } catch (error) {
    console.error('取得造訪紀錄錯誤:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: '取得造訪紀錄時發生錯誤'
    });
  }
});

// 新增造訪紀錄
router.post('/', async (req, res): Promise<void> => {
  try {
    const userId = req.user!.id;
    const {
      placeId,
      emoji,
      rating,
      note,
      visitedAt,
      weather,
      photoUrl
    } = req.body;

    if (!placeId) {
      res.status(400).json({
        error: 'Bad Request',
        message: '請提供地點 ID'
      });
      return;
    }

    // 檢查地點是否存在且屬於該使用者
    const place = await prisma.place.findFirst({
      where: {
        id: parseInt(placeId),
        userId
      }
    });

    if (!place) {
      res.status(404).json({
        error: 'Not Found',
        message: '地點不存在'
      });
      return;
    }

    // 建立造訪紀錄
    const entry = await prisma.entry.create({
      data: {
        placeId: parseInt(placeId),
        userId,
        emoji: emoji || '⭐',
        rating: rating ? parseInt(rating) : null,
        note,
        visitedAt: visitedAt ? new Date(visitedAt) : null,
        weather,
        photoUrl
      },
      include: {
        place: true
      }
    });

    res.status(201).json({
      message: '新增造訪紀錄成功',
      data: entry
    });
  } catch (error) {
    console.error('新增造訪紀錄錯誤:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: '新增造訪紀錄時發生錯誤'
    });
  }
});

// 更新造訪紀錄
router.put('/:id', async (req, res): Promise<void> => {
  try {
    const userId = req.user!.id;
    const entryId = parseInt(req.params.id);
    const {
      emoji,
      rating,
      note,
      visitedAt,
      weather,
      photoUrl
    } = req.body;

    // 檢查造訪紀錄是否存在且屬於該使用者
    const existingEntry = await prisma.entry.findFirst({
      where: {
        id: entryId,
        userId
      }
    });

    if (!existingEntry) {
      res.status(404).json({
        error: 'Not Found',
        message: '造訪紀錄不存在'
      });
      return;
    }

    // 更新造訪紀錄
    const entry = await prisma.entry.update({
      where: { id: entryId },
      data: {
        emoji,
        rating: rating ? parseInt(rating) : null,
        note,
        visitedAt: visitedAt ? new Date(visitedAt) : null,
        weather,
        photoUrl
      },
      include: {
        place: true
      }
    });

    res.json({
      message: '更新造訪紀錄成功',
      data: entry
    });
  } catch (error) {
    console.error('更新造訪紀錄錯誤:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: '更新造訪紀錄時發生錯誤'
    });
  }
});

// 刪除造訪紀錄
router.delete('/:id', async (req, res): Promise<void> => {
  try {
    const userId = req.user!.id;
    const entryId = parseInt(req.params.id);

    // 檢查造訪紀錄是否存在且屬於該使用者
    const existingEntry = await prisma.entry.findFirst({
      where: {
        id: entryId,
        userId
      }
    });

    if (!existingEntry) {
      res.status(404).json({
        error: 'Not Found',
        message: '造訪紀錄不存在'
      });
      return;
    }

    await prisma.entry.delete({
      where: { id: entryId }
    });

    res.json({
      message: '刪除造訪紀錄成功'
    });
  } catch (error) {
    console.error('刪除造訪紀錄錯誤:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: '刪除造訪紀錄時發生錯誤'
    });
  }
});

export default router;