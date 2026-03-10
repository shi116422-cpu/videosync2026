import type { NextApiRequest, NextApiResponse } from 'next'

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  try {
    const { videoUrl, title, caption, hashtags, platforms } = req.body
    if (!videoUrl) {
      res.status(400).json({ error: '動画URLが必要です' })
      return
    }

    const results: Record<string, string> = {}

    if (platforms?.includes('instagram')) {
      try {
        const igUserId = process.env.INSTAGRAM_USER_ID
        const igToken = process.env.INSTAGRAM_ACCESS_TOKEN
        const igCaption = `${caption || ''}\n${hashtags || ''}`.trim()

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
          await new Promise(resolve => setTimeout(resolve, 30000))
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
          results.instagram = publishData.id
            ? '✅ Instagram: 投稿成功！'
            : `❌ Instagram: ${JSON.stringify(publishData)}`
        } else {
          results.instagram = `❌ Instagram: ${JSON.stringify(containerData)}`
        }
      } catch (e) {
        results.instagram = `❌ Instagram エラー: ${e}`
      }
    }

    if (platforms?.includes('youtube')) {
      results.youtube = '⚠️ YouTube: OAuth認証が必要です（フェーズ2で実装）'
    }
    if (platforms?.includes('tiktok')) {
      results.tiktok = '⚠️ TikTok: OAuth認証が必要です（フェーズ2で実装）'
    }

    res.status(200).json({ success: true, videoUrl, results })
  } catch (error) {
    res.status(500).json({ error: `投稿エラー: ${error}` })
  }
}
