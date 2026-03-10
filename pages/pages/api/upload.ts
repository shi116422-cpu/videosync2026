import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  const results: Record<string, string> = {}
  try {
    results.instagram = process.env.INSTAGRAM_ACCESS_TOKEN ? '✅ Instagram: OK' : '⚠️ 未設定'
    results.youtube = process.env.YOUTUBE_API_KEY ? '✅ YouTube: OK' : '⚠️ 未設定'
    results.tiktok = process.env.TIKTOK_CLIENT_KEY ? '✅ TikTok: OK' : '⚠️ 未設定'
    res.status(200).json({ success: true, results })
  } catch (error) {
    res.status(500).json({ error: '投稿エラー', results })
  }
}
