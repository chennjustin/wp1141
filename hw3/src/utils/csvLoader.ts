import Papa from 'papaparse'

/**
 * 通用 CSV 載入函數
 * @param path - CSV 檔案路徑（相對於 public 目錄）
 * @returns Promise 包含解析後的資料陣列
 */
export async function loadCSV<T>(path: string): Promise<T[]> {
  try {
    const response = await fetch(path)
    if (!response.ok) {
      throw new Error(`Failed to fetch ${path}: ${response.statusText}`)
    }
    
    const csvText = await response.text()
    
    return new Promise((resolve, reject) => {
      Papa.parse<T>(csvText, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
        transform: (value) => value.trim(),
        complete: (results) => {
          // 過濾掉空白物件
          const filteredData = results.data.filter((row) => {
            if (!row || typeof row !== 'object') return false
            return Object.values(row as Record<string, unknown>).some((val) => val !== '')
          })
          resolve(filteredData)
        },
        error: (error: Error) => {
          reject(error)
        },
      })
    })
  } catch (error) {
    console.error(`Error loading CSV from ${path}:`, error)
    throw error
  }
}

