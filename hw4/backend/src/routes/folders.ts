import express from 'express';
import { PrismaClient } from '@prisma/client';
import { sendSuccess, sendError, sendNotFound, sendServerError } from '../utils/response';
// import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// 暫時不需要認證
// router.use(authenticateToken);

// 取得所有資料夾
router.get('/', async (_req, res) => {
  try {
    const userId = 1; // 暫時使用固定用戶 ID
    
    const folders = await prisma.folder.findMany({
      where: { userId },
      include: {
        parent: true,
        children: {
          include: {
            _count: {
              select: { places: true }
            }
          }
        },
        _count: {
          select: { places: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    sendSuccess(res, folders, '取得資料夾成功');
  } catch (error) {
    console.error('取得資料夾失敗:', error);
    sendServerError(res, '取得資料夾失敗');
  }
});

// 取得單一資料夾
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user?.id || 1;
    const folderId = parseInt(req.params.id);

    const folder = await prisma.folder.findFirst({
      where: {
        id: folderId,
        userId
      },
      include: {
        parent: true,
        children: true,
        places: {
          include: {
            _count: {
              select: { entries: true }
            }
          }
        },
        _count: {
          select: { places: true }
        }
      }
    });

    if (!folder) {
      sendNotFound(res, '資料夾不存在');
      return;
    }

    sendSuccess(res, folder, '取得資料夾成功');
  } catch (error) {
    console.error('取得資料夾失敗:', error);
    sendServerError(res, '取得資料夾失敗');
  }
});

// 新增資料夾
router.post('/', async (req, res) => {
  try {
    let userId = req.user?.id;
    
    // 如果沒有用戶，創建一個默認用戶
    if (!userId) {
      const defaultUser = await prisma.user.upsert({
        where: { email: 'default@example.com' },
        update: {},
        create: {
          username: 'default',
          email: 'default@example.com',
          password: 'default'
        }
      });
      userId = defaultUser.id;
    }
    const { name, description, icon, parentId } = req.body;

    // 驗證必填欄位
    if (!name) {
      sendError(res, '請提供資料夾名稱', 400);
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
        sendNotFound(res, '父資料夾不存在');
        return;
      }
    }

    const folder = await prisma.folder.create({
      data: {
        name,
        description,
        icon: icon || '📁',
        userId,
        parentId: parentId || null
      },
      include: {
        parent: true,
        _count: {
          select: { places: true }
        }
      }
    });

    sendSuccess(res, folder, '資料夾創建成功');
  } catch (error) {
    console.error('創建資料夾失敗:', error);
    sendServerError(res, '創建資料夾失敗');
  }
});

// 更新資料夾
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user?.id || 1;
    const folderId = parseInt(req.params.id);
    const { name, description, icon, parentId } = req.body;

    // 檢查資料夾是否存在且屬於該使用者
    const existingFolder = await prisma.folder.findFirst({
      where: {
        id: folderId,
        userId
      }
    });

    if (!existingFolder) {
      sendNotFound(res, '資料夾不存在');
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
        sendNotFound(res, '父資料夾不存在');
        return;
      }
    }

    const folder = await prisma.folder.update({
      where: { id: folderId },
      data: {
        name,
        description,
        icon,
        parentId: parentId || null
      },
      include: {
        parent: true,
        _count: {
          select: { places: true }
        }
      }
    });

    sendSuccess(res, folder, '資料夾更新成功');
  } catch (error) {
    console.error('更新資料夾失敗:', error);
    sendServerError(res, '更新資料夾失敗');
  }
});

// 刪除資料夾（遞歸刪除）
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user?.id || 1;
    const folderId = parseInt(req.params.id);

    // 檢查資料夾是否存在且屬於該使用者
    const existingFolder = await prisma.folder.findFirst({
      where: {
        id: folderId,
        userId
      }
    });

    if (!existingFolder) {
      sendNotFound(res, '資料夾不存在');
      return;
    }

    // 遞歸刪除資料夾及其內容
    await deleteFolderRecursively(folderId);

    sendSuccess(res, null, '資料夾刪除成功');
  } catch (error) {
    console.error('刪除資料夾失敗:', error);
    sendServerError(res, '刪除資料夾失敗');
  }
});

// 遞歸刪除資料夾的輔助函數
async function deleteFolderRecursively(folderId: number) {
  // 取得所有子資料夾
  const childFolders = await prisma.folder.findMany({
    where: { parentId: folderId }
  });

  // 遞歸刪除所有子資料夾
  for (const childFolder of childFolders) {
    await deleteFolderRecursively(childFolder.id);
  }

  // 刪除資料夾內的所有地點
  await prisma.place.deleteMany({
    where: { folderId }
  });

  // 刪除資料夾本身
  await prisma.folder.delete({
    where: { id: folderId }
  });
}

export default router;