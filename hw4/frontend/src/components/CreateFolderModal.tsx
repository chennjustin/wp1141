import React, { useState } from 'react';

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (folderData: { name: string; icon: string; color: string }) => void;
}

const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  isOpen,
  onClose,
  onCreate
}) => {
  const [formData, setFormData] = useState({
    name: '',
    icon: '📁',
    color: '#7C8B9F'
  });

  const iconOptions = [
    '📁', '🗂️', '📂', '📋', '📝', '📄', '📃', '📑', '📊', '📈',
    '🎯', '⭐', '💎', '🔖', '🏷️', '🎨', '🎭', '🎪', '🎨', '🎯'
  ];

  const colorOptions = [
    { name: '石藍', value: '#7C8B9F' },
    { name: '墨綠', value: '#8B9B8F' },
    { name: '溫暖灰', value: '#9CA3AF' },
    { name: '霧灰', value: '#E8E6E3' },
    { name: '奶白', value: '#F8F6F3' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onCreate(formData);
      setFormData({ name: '', icon: '📁', color: '#7C8B9F' });
      onClose();
    }
  };

  const handleClose = () => {
    setFormData({ name: '', icon: '📁', color: '#7C8B9F' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 背景遮罩 */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={handleClose}
      />
      
      {/* Modal 內容 */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 bg-white/95 backdrop-blur-sm rounded-2xl shadow-float border border-mist/30 z-50 animate-scale-in">
        <div className="p-6">
          {/* 標題 */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-stone">新增資料夾</h3>
            <button
              onClick={handleClose}
              className="text-warm-gray hover:text-stone transition-colors p-1"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 資料夾名稱 */}
            <div>
              <label className="block text-sm font-medium text-stone mb-2">
                資料夾名稱 *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="輸入資料夾名稱..."
                className="w-full px-3 py-2 border border-mist/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-blue/20 focus:border-slate-blue/30 text-sm"
                required
              />
            </div>

            {/* 圖示選擇 */}
            <div>
              <label className="block text-sm font-medium text-stone mb-2">
                選擇圖示
              </label>
              <div className="grid grid-cols-5 gap-2">
                {iconOptions.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon })}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all duration-200 ${
                      formData.icon === icon
                        ? 'bg-slate-blue/20 scale-110'
                        : 'bg-mist/30 hover:bg-mist/50'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* 顏色選擇 */}
            <div>
              <label className="block text-sm font-medium text-stone mb-2">
                選擇顏色
              </label>
              <div className="flex space-x-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: color.value })}
                    className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                      formData.color === color.value
                        ? 'border-slate-blue scale-110'
                        : 'border-mist/50 hover:border-slate-blue/50'
                    }`}
                    style={{ backgroundColor: color.value }}
                  />
                ))}
              </div>
            </div>

            {/* 操作按鈕 */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2.5 bg-mist/30 text-stone rounded-full hover:bg-mist/50 transition-all duration-200 text-sm font-medium"
              >
                取消
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 bg-slate-blue/10 text-slate-blue rounded-full hover:bg-slate-blue/20 transition-all duration-200 text-sm font-medium"
              >
                ➕ 創建資料夾
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateFolderModal;
