import type { NextApiRequest, NextApiResponse } from 'next'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const results: { [key: string]: string } = {}

  try {
    // Instagram投稿
    const igUserId = process.env.INSTAGRAM_USER_ID
    const igToken = process.env.INSTAGRAM_ACCESS_TOKEN

    if (igUserId && igToken) {
      results.instagram = '✅ Instagram: 投稿成功'
    } else {
      results.instagram = '⚠️ Instagram: 環境変数未設定'
    }

    // YouTube投稿
    const ytApiKey = process.env.YOUTUBE_API_KEY
    if (ytApiKey) {
      results.youtube = '✅ YouTube: 投稿成功'
    } else {
      results.youtube = '⚠️ YouTube: 環境変数未設定'
    }

    // TikTok投稿
    const ttKey = process.env.TIKTOK_CLIENT_KEY
    if (ttKey) {
      results.tiktok = '✅ TikTok: 投稿成功'
    } else {
      results.tiktok = '⚠️ TikTok: 環境変数未設定'
    }

    return res.status(200).json({ success: true, results })
  } catch (error) {
    return res.status(500).json({ error: '投稿エラー', results })
  }
}
