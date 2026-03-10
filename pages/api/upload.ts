import type { NextApiRequest, NextApiResponse } from 'next'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const config = {
  api: { bodyParser: { sizeLimit: '500mb' } },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  try {
    const { videoBase64, title, caption, hashtags, platforms } = req.body
    if (!videoBase64) {
      res.status(400).json({ error: '動画ファイルが必要です' })
      return
    }
    const uploadResult = await cloudinary.uploader.upload(videoBase64, {
      resource_type: 'video',
      folder: 'videosync2026',
      public_id: `video_${Date.now()}`,
    })
    const videoUrl = uploadResult.secure_url
    const results: Record<string, string> = {}
    if (platforms?.includes('instagram')) {
      try {
        const igUserId = process.env.INSTAGRAM_USER_ID
        const igToken = process.env.INSTAGRAM_ACCESS_TOKEN
        const igCaption = `${caption || ''}\n${hashtags || ''}`
        const containerRes = await fetch(
          `https://graph.facebook.com/v18.0/${igUserId}/media`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              media_type: 'REELS',
              video_url: videoUrl,
              caption: igCaption,
              access_token: igToken,
            }),
          }
        )
        const containerData = await containerRes.json()
        if (containerData.id) {
          await new Promise(resolve => setTimeout(resolve, 10000))
          const publishRes = await fetch(
            `https://graph.facebook.com/v18.0/${igUserId}/media_publish`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                creation_id: containerData.id,
                access_token: igToken,
              }),
            }
          )
          const publishData = await publishRes.json()
          results.instagram = publishData.id ? '✅ Instagram: 投稿成功！' : `❌ Instagram: ${JSON.stringify(publishData)}`
        } else {
          results.instagram = `❌ Instagram: ${JSON.stringify(containerData)}`
        }
      } catch (e) {
        results.instagram = `❌ Instagram エラー: ${e}`
      }
    }
    if (platforms?.includes('youtube')) {
      results.youtube = '⚠️ YouTube: OAuth認証が必要です'
    }
    if (platforms?.includes('tiktok')) {
      results.tiktok = '⚠️ TikTok: OAuth認証が必要です'
    }
    res.status(200).json({ success: true, videoUrl, results })
  } catch (error) {
    res.status(500).json({ error: `投稿エラー: ${error}` })
  }
}
