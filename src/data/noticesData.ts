import { createClient } from '@/utils/supabase/client'

export interface NoticeItem {
  id: number
  category: string
  title: string
  content: string
  date: string
  views?: number
}

// 샘플 글 모두 삭제 (빈 배열로 시작)
export const initialNotices: NoticeItem[] = []

const STORAGE_KEY = 'mookk_board_notices_v2'

export function getLocalNotices(): NoticeItem[] {
  if (typeof window === 'undefined') return initialNotices
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      return JSON.parse(data)
    }
    // 데이터가 없으면 빈 배열 저장 및 반환
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialNotices))
    return initialNotices
  } catch (e) {
    console.error('Failed to parse notices from localStorage:', e)
    return initialNotices
  }
}

export function saveLocalNotice(notice: Omit<NoticeItem, 'id' | 'date'>): NoticeItem {
  const currentNotices = getLocalNotices()
  const maxId = currentNotices.reduce((max, item) => (item.id > max ? item.id : max), 0)
  const newId = maxId + 1
  
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  const formattedDate = `${year}.${month}.${day}`

  const newNotice: NoticeItem = {
    id: newId,
    category: notice.category,
    title: notice.title,
    content: notice.content,
    date: formattedDate,
    views: 0
  }

  const updatedNotices = [newNotice, ...currentNotices]
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotices))
  }
  return newNotice
}

export function updateLocalNotice(id: number | string, updatedData: Partial<Omit<NoticeItem, 'id' | 'date'>>): NoticeItem | null {
  const currentNotices = getLocalNotices()
  const targetId = Number(id)
  const index = currentNotices.findIndex(item => item.id === targetId)
  
  if (index === -1) return null

  const updatedNotice: NoticeItem = {
    ...currentNotices[index],
    ...updatedData
  }

  currentNotices[index] = updatedNotice
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentNotices))
  }
  return updatedNotice
}

export function deleteLocalNotice(id: number | string): boolean {
  const currentNotices = getLocalNotices()
  const targetId = Number(id)
  const filtered = currentNotices.filter(item => item.id !== targetId)
  
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  }
  return true
}

export function getNoticeById(id: string | number): NoticeItem | null {
  const currentNotices = getLocalNotices()
  const targetId = Number(id)
  return currentNotices.find(item => item.id === targetId) || null
}

/**
 * 관리자 권한 비동기 체크 함수
 */
export async function checkAdminStatus(): Promise<boolean> {
  if (typeof window === 'undefined') return false
  
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      // 1. Supabase User 테이블에서 role이 'admin'인지 체크
      const { data: profile } = await supabase
        .from('User')
        .select('role')
        .eq('id', user.id)
        .single()
      
      if (profile && profile.role === 'admin') {
        return true
      }
      
      // 관리자 이메일 형식 체크 (예: admin@, master@)
      if (user.email && (user.email.startsWith('admin') || user.email.includes('admin@mookk'))) {
        return true
      }
    }
  } catch (err) {
    console.error('Admin status check error:', err)
  }

  // 2. URL 쿼리 파라미터 또는 로컬 스토리지에 관리자 인증 토큰/플래그가 있는 경우
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('admin') === 'true') {
      localStorage.setItem('mookk_is_admin', 'true')
      return true
    }
    if (urlParams.get('admin') === 'false') {
      localStorage.removeItem('mookk_is_admin')
      return false
    }
  }

  const adminFlag = localStorage.getItem('mookk_is_admin')
  return adminFlag === 'true'
}
