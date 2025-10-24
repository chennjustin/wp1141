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

    const places = await prisma.place.findMany({
      where: {
        entries: {
          some: {
            userId
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      include: {
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
    const { name, address, lat, lng } = req.body;

    if (!lat || !lng) {
      res.status(400).json({
        error: 'Bad Request',
        message: '請提供經緯度座標'
      });
      return;
    }

    const place = await prisma.place.create({
      data: {
        name,
        address,
        lat: parseFloat(lat),
        lng: parseFloat(lng)
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
    const placeId = parseInt(req.params.id);
    const { name, address } = req.body;

    // 檢查地點是否存在
    const existingPlace = await prisma.place.findUnique({
      where: { id: placeId }
    });

    if (!existingPlace) {
      res.status(404).json({
        error: 'Not Found',
        message: '地點不存在'
      });
      return;
    }

    const place = await prisma.place.update({
      where: { id: placeId },
      data: { name, address }
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
    const placeId = parseInt(req.params.id);

    // 檢查地點是否存在
    const existingPlace = await prisma.place.findUnique({
      where: { id: placeId }
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