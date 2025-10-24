import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// 所有路由都需要認證
router.use(authenticateToken);

// 取得使用者的所有地點
router.get('/', async (req, res): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { folderId } = req.query;

    const whereClause: any = { userId };
    if (folderId) {
      whereClause.folderId = parseInt(folderId as string);
    }

    const places = await prisma.place.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        folder: true,
        _count: {
          select: { entries: true }
        }
      }
    });

    res.json({
      message: '取得地點成功',
      data: places
    });
  } catch (error) {
    console.error('取得地點錯誤:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: '取得地點時發生錯誤'
    });
  }
});

// 新增地點
router.post('/', async (req, res): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { name, address, lat, lng, emoji, description, folderId } = req.body;

    if (!name || !lat || !lng) {
      res.status(400).json({
        error: 'Bad Request',
        message: '請提供名稱和經緯度座標'
      });
      return;
    }

    // 如果指定了資料夾，檢查是否存在且屬於該使用者
    if (folderId) {
      const folder = await prisma.folder.findFirst({
        where: {
          id: folderId,
          userId
        }
      });

      if (!folder) {
        res.status(404).json({
          error: 'Not Found',
          message: '資料夾不存在'
        });
        return;
      }
    }

    const place = await prisma.place.create({
      data: {
        name,
        address,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        emoji: emoji || '📍',
        description,
        userId,
        folderId: folderId || null
      },
      include: {
        folder: true,
        _count: {
          select: { entries: true }
        }
      }
    });

    res.status(201).json({
      message: '新增地點成功',
      data: place
    });
  } catch (error) {
    console.error('新增地點錯誤:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: '新增地點時發生錯誤'
    });
  }
});

// 更新地點
router.put('/:id', async (req, res): Promise<void> => {
  try {
    const userId = req.user!.id;
    const placeId = parseInt(req.params.id);
    const { name, address, emoji, description, folderId } = req.body;

    // 檢查地點是否存在且屬於該使用者
    const existingPlace = await prisma.place.findFirst({
      where: {
        id: placeId,
        userId
      }
    });

    if (!existingPlace) {
      res.status(404).json({
        error: 'Not Found',
        message: '地點不存在'
      });
      return;
    }

    // 如果指定了資料夾，檢查是否存在且屬於該使用者
    if (folderId) {
      const folder = await prisma.folder.findFirst({
        where: {
          id: folderId,
          userId
        }
      });

      if (!folder) {
        res.status(404).json({
          error: 'Not Found',
          message: '資料夾不存在'
        });
        return;
      }
    }

    const place = await prisma.place.update({
      where: { id: placeId },
      data: {
        name,
        address,
        emoji,
        description,
        folderId: folderId || null
      },
      include: {
        folder: true,
        _count: {
          select: { entries: true }
        }
      }
    });

    res.json({
      message: '更新地點成功',
      data: place
    });
  } catch (error) {
    console.error('更新地點錯誤:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: '更新地點時發生錯誤'
    });
  }
});

// 刪除地點
router.delete('/:id', async (req, res): Promise<void> => {
  try {
    const userId = req.user!.id;
    const placeId = parseInt(req.params.id);

    // 檢查地點是否存在且屬於該使用者
    const existingPlace = await prisma.place.findFirst({
      where: {
        id: placeId,
        userId
      }
    });

    if (!existingPlace) {
      res.status(404).json({
        error: 'Not Found',
        message: '地點不存在'
      });
      return;
    }

    await prisma.place.delete({
      where: { id: placeId }
    });

    res.json({
      message: '刪除地點成功'
    });
  } catch (error) {
    console.error('刪除地點錯誤:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: '刪除地點時發生錯誤'
    });
  }
});

export default router;