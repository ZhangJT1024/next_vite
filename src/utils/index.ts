// 时间格式化工具
export function formatTime(date: Date | string, pattern?: string): string {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  const patterns = {
    yyyyMMddHHmmss: `${year}${month}${day}${hours}${minutes}${seconds}`,
    'yyyy-MM-dd': `${year}-${month}-${day}`,
    'yyyy/MM/dd': `${year}/${month}/${day}`,
    'HH:mm:ss': `${hours}:${minutes}:${seconds}`,
    'HH:mm': `${hours}:${minutes}`,
  }

  return patterns[pattern as keyof typeof patterns] || `${year}-${month}-${day} ${hours}:${minutes}`
}

// 防抖函数
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  return function (this: unknown, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      func.apply(this, args)
    }, wait)
  }
}

// 节流函数
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let lastTime = 0
  return function (this: unknown, ...args: Parameters<T>) {
    const now = Date.now()
    if (now - lastTime >= limit) {
      lastTime = now
      func.apply(this, args)
    }
  }
}

// 深拷贝
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

// 获取查询参数
export function getQueryParams(url?: string): Record<string, unknown> {
  const params = new URLSearchParams(url || window.location.search)
  const result: Record<string, unknown> = {}
  params.forEach((value, key) => {
    result[key] = value
  })
  return result
}

// 本地存储工具
export function local() {
  const get = <T>(key: string, def?: T): T | undefined => {
    try {
      const v = localStorage.getItem(key)
      return v ? JSON.parse(v) : def
    } catch {
      return def
    }
  }

  const set = (key: string, value: unknown) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(error)
    }
  }

  const remove = (key: string) => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(error)
    }
  }

  return { get, set, remove }
}
