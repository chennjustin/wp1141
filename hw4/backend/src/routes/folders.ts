import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// 所有路由都需要認證
router.use(authenticateToken);

// 取得使用者的所有資料夾（樹狀結構）
router.get('/', async (req, res): Promise<void> => {
  try {
    const userId = req.user!.id;

    const folders = await prisma.folder.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      include: {
        children: {
          orderBy: { createdAt: 'asc' }
        },
        _count: {
          select: { places: true }
        }
      }
    });

    // 建立樹狀結構
    const buildTree = (folders: any[], parentId: number | null = null): any[] => {
      return folders
        .filter((folder: any) => folder.parentId === parentId)
        .map((folder: any) => ({
          ...folder,
          children: buildTree(folders, folder.id)
        }));
    };

    const tree = buildTree(folders);

    res.json({
      message: '取得資料夾成功',
      data: tree
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
    const { name, description, color, icon, parentId } = req.body;

    if (!name) {
      res.status(400).json({
        error: 'Bad Request',
        message: '請提供資料夾名稱'
      });
      return;
    }

    // 如果指定了父資料夾，檢查是否存在且屬於該使用者
    if (parentId) {
      const parentFolder = await prisma.folder.findFirst({
        where: {
          id: parentId,
          userId
        }
      });

      if (!parentFolder) {
        res.status(404).json({
          error: 'Not Found',
          message: '父資料夾不存在'
        });
        return;
      }
    }

    const folder = await prisma.folder.create({
      data: {
        name,
        description,
        color: color || '#3B82F6',
        icon: icon || '📁',
        userId,
        parentId: parentId || null
      },
      include: {
        parent: true,
        children: true,
        _count: {
          select: { places: true }
        }
      }
    });

    res.status(201).json({
      message: '新增資料夾成功',
      data: folder
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
    const folderId = parseInt(req.params.id);
    const { name, description, color, icon, parentId } = req.body;

    if (!name) {
      res.status(400).json({
        error: 'Bad Request',
        message: '請提供資料夾名稱'
      });
      return;
    }

    // 檢查資料夾是否存在且屬於該使用者
    const existingFolder = await prisma.folder.findFirst({
      where: {
        id: folderId,
        userId
      }
    });

    if (!existingFolder) {
      res.status(404).json({
        error: 'Not Found',
        message: '資料夾不存在'
      });
      return;
    }

    // 如果指定了新的父資料夾，檢查是否存在且不會造成循環引用
    if (parentId && parentId !== existingFolder.parentId) {
      const parentFolder = await prisma.folder.findFirst({
        where: {
          id: parentId,
          userId
        }
      });

      if (!parentFolder) {
        res.status(404).json({
          error: 'Not Found',
          message: '父資料夾不存在'
        });
        return;
      }

      // 檢查是否會造成循環引用
      if (parentId === folderId) {
        res.status(400).json({
          error: 'Bad Request',
          message: '不能將資料夾設為自己的子資料夾'
        });
        return;
      }
    }

    const folder = await prisma.folder.update({
      where: { id: folderId },
      data: {
        name,
        description,
        color,
        icon,
        parentId: parentId || null
      },
      include: {
        parent: true,
        children: true,
        _count: {
          select: { places: true }
        }
      }
    });

    res.json({
      message: '更新資料夾成功',
      data: folder
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
    const folderId = parseInt(req.params.id);

    // 檢查資料夾是否存在且屬於該使用者
    const existingFolder = await prisma.folder.findFirst({
      where: {
        id: folderId,
        userId
      },
      include: {
        children: true,
        places: true
      }
    });

    if (!existingFolder) {
      res.status(404).json({
        error: 'Not Found',
        message: '資料夾不存在'
      });
      return;
    }

    // 檢查是否有子資料夾
    if (existingFolder.children.length > 0) {
      res.status(400).json({
        error: 'Bad Request',
        message: '無法刪除包含子資料夾的資料夾'
      });
      return;
    }

    // 檢查是否有地點
    if (existingFolder.places.length > 0) {
      res.status(400).json({
        error: 'Bad Request',
        message: '無法刪除包含地點的資料夾'
      });
      return;
    }

    await prisma.folder.delete({
      where: { id: folderId }
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
