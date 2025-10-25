import express from 'express';
import { PrismaClient } from '@prisma/client';
import { sendSuccess, sendError, sendNotFound, sendServerError } from '../utils/response';
// import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// 暫時不需要認證
// router.use(authenticateToken);

// 取得所有地點
router.get('/', async (req, res) => {
  try {
    const userId = req.user?.id || 1; // 暫時使用固定用戶 ID
    
    const places = await prisma.place.findMany({
      where: { userId },
      include: {
        folder: true,
        _count: {
          select: { entries: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    sendSuccess(res, places, '取得地點成功');
  } catch (error) {
    console.error('取得地點失敗:', error);
    sendServerError(res, '取得地點失敗');
  }
});

// 取得單一地點
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user?.id || 1;
    const placeId = parseInt(req.params.id);

    const place = await prisma.place.findFirst({
      where: {
        id: placeId,
        userId
      },
      include: {
        folder: true,
        entries: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!place) {
      sendNotFound(res, '地點不存在');
      return;
    }

    sendSuccess(res, place, '取得地點成功');
  } catch (error) {
    console.error('取得地點失敗:', error);
    sendServerError(res, '取得地點失敗');
  }
});

// 新增地點
router.post('/', async (req, res) => {
  try {
    const userId = req.user?.id || 1;
    const {
      name,
      address,
      lat,
      lng,
      emoji,
      description,
      rating,
      visitedAt,
      weather,
      travelMode,
      companions,
      expenses,
      tags,
      photos,
      folderId 
    } = req.body;

    // 驗證必填欄位
    if (!name || !lat || !lng) {
      sendError(res, '請提供名稱和經緯度座標', 400);
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
        sendNotFound(res, '資料夾不存在');
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
        rating: rating ? parseInt(rating) : null,
        visitedAt: visitedAt ? new Date(visitedAt) : null,
        weather,
        travelMode,
        companions,
        expenses,
        tags: tags ? JSON.stringify(tags) : null,
        photos: photos ? JSON.stringify(photos) : null,
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

    sendSuccess(res, place, '地點創建成功');
  } catch (error) {
    console.error('創建地點失敗:', error);
    sendServerError(res, '創建地點失敗');
  }
});

// 更新地點
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user?.id || 1;
    const placeId = parseInt(req.params.id);
    const {
      name,
      address, 
      emoji, 
      description, 
      rating, 
      visitedAt, 
      weather,
      travelMode,
      companions,
      expenses,
      tags,
      photos,
      folderId 
    } = req.body;

    // 檢查地點是否存在且屬於該使用者
    const existingPlace = await prisma.place.findFirst({
      where: {
        id: placeId,
        userId
      }
    });

    if (!existingPlace) {
      sendNotFound(res, '地點不存在');
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
        sendNotFound(res, '資料夾不存在');
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
        rating: rating ? parseInt(rating) : null,
        visitedAt: visitedAt ? new Date(visitedAt) : null,
        weather,
        travelMode,
        companions,
        expenses,
        tags: tags ? JSON.stringify(tags) : null,
        photos: photos ? JSON.stringify(photos) : null,
        folderId: folderId || null
      },
      include: {
        folder: true,
        _count: {
          select: { entries: true }
        }
      }
    });

    sendSuccess(res, place, '地點更新成功');
  } catch (error) {
    console.error('更新地點失敗:', error);
    sendServerError(res, '更新地點失敗');
  }
});

// 刪除地點
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user?.id || 1;
    const placeId = parseInt(req.params.id);

    // 檢查地點是否存在且屬於該使用者
    const existingPlace = await prisma.place.findFirst({
      where: {
        id: placeId,
        userId
      }
    });

    if (!existingPlace) {
      sendNotFound(res, '地點不存在');
      return;
    }

    // 刪除地點（會自動刪除相關的 entries）
    await prisma.place.delete({
      where: { id: placeId }
    });

    sendSuccess(res, null, '地點刪除成功');
  } catch (error) {
    console.error('刪除地點失敗:', error);
    sendServerError(res, '刪除地點失敗');
  }
});

export default router;