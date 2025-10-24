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
    const { collectionId } = req.query;

    const whereClause: any = { userId };

    // 如果指定了 collectionId，則篩選該資料夾的紀錄
    if (collectionId) {
      whereClause.collections = {
        some: {
          id: parseInt(collectionId as string)
        }
      };
    }

    const entries = await prisma.entry.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        place: true,
        collections: true
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
      collectionIds,
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

    // 檢查地點是否存在
    const place = await prisma.place.findUnique({
      where: { id: parseInt(placeId) }
    });

    if (!place) {
      res.status(404).json({
        error: 'Not Found',
        message: '地點不存在'
      });
      return;
    }

    // 檢查資料夾是否存在且屬於該使用者
    if (collectionIds && collectionIds.length > 0) {
      const collections = await prisma.collection.findMany({
        where: {
          id: { in: collectionIds.map((id: any) => parseInt(id)) },
          userId
        }
      });

      if (collections.length !== collectionIds.length) {
        res.status(400).json({
          error: 'Bad Request',
          message: '部分資料夾不存在或無權限'
        });
        return;
      }
    }

    // 建立造訪紀錄
    const entryData: any = {
      placeId: parseInt(placeId),
      userId,
      emoji,
      rating: rating ? parseInt(rating) : null,
      note,
      visitedAt: visitedAt ? new Date(visitedAt) : null,
      weather,
      photoUrl
    };

    // 如果有資料夾，則建立關聯
    if (collectionIds && collectionIds.length > 0) {
      entryData.collections = {
        connect: collectionIds.map((id: any) => ({ id: parseInt(id) }))
      };
    }

    const entry = await prisma.entry.create({
      data: entryData,
      include: {
        place: true,
        collections: true
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
      collectionIds,
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

    // 檢查資料夾是否存在且屬於該使用者
    if (collectionIds && collectionIds.length > 0) {
      const collections = await prisma.collection.findMany({
        where: {
          id: { in: collectionIds.map((id: any) => parseInt(id)) },
          userId
        }
      });

      if (collections.length !== collectionIds.length) {
        res.status(400).json({
          error: 'Bad Request',
          message: '部分資料夾不存在或無權限'
        });
        return;
      }
    }

    // 準備更新資料
    const updateData: any = {
      emoji,
      rating: rating ? parseInt(rating) : null,
      note,
      visitedAt: visitedAt ? new Date(visitedAt) : null,
      weather,
      photoUrl
    };

    // 如果有資料夾，則更新關聯
    if (collectionIds && collectionIds.length > 0) {
      updateData.collections = {
        set: collectionIds.map((id: any) => ({ id: parseInt(id) }))
      };
    }

    const entry = await prisma.entry.update({
      where: { id: entryId },
      data: updateData,
      include: {
        place: true,
        collections: true
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