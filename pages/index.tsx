import { useState } from 'react'

export default function Home() {
  const [title, setTitle] = useState('')
  const [caption, setCaption] = useState('')
  const [hashtags, setHashtags] = useState('')
  const [platforms, setPlatforms] = useState({youtube: true, tiktok: true, instagram: true})
  const [status, setStatus] = useState<{[key: string]: string}>({})
  const [uploading, setUploading] = useState(false)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [progress, setProgress] = useState('')

  const handleSubmit = async () => {
    if (!videoFile) return alert('動画を選択してください')
    if (!title) return alert('タイトルを入力してください')
    setUploading(true)
    setProgress('動画を読み込み中...')
    setStatus({})
    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64 = e.target?.result as string
        setProgress('Cloudinary にアップロード中...')
        const selectedPlatforms = Object.keys(platforms).filter(p => platforms[p as keyof typeof platforms])
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            videoBase64: base64,
            title,
            caption,
            hashtags,
            platforms: selectedPlatforms,
          }),
        })
        const data = await res.json()
        if (data.results) {
          setStatus(data.results)
          setProgress('✅ 完了！')
        } else {
          setStatus({ error: data.error || 'エラーが発生しました' })
          setProgress('')
        }
        setUploading(false)
      }
      reader.readAsDataURL(videoFile)
    } catch (e) {
      setStatus({ error: 'エラーが発生しました' })
      setProgress('')
      setUploading(false)
    }
  }

  const togglePlatform = (p: string) => {
    setPlatforms(prev => ({ ...prev, [p]: !prev[p as keyof typeof prev] }))
  }

  return (
    <div style={{ minHeight: '100vh', background: '#111', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '500px', background: '#1a1a1a', borderRadius: '16px', padding: '32px' }}>
        <h1 style={{ textAlign: 'center', fontSize: '24px', marginBottom: '24px' }}>🎬 VideoSync2026</h1>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: '#aaa' }}>📁 動画をアップロード</label>
          <div style={{ border: '2px dashed #444', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
            <input type="file" accept="video/*" onChange={e => setVideoFile(e.target.files?.[0] || null)} style={{ color: '#fff' }} />
            {videoFile && <p style={{ color: '#4ade80', marginTop: '8px' }}>✅ {videoFile.name}</p>}
          </div>
        </div>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="タイトル" style={{ width: '100%', padding: '12px', marginBottom: '12px', background: '#2a2a2a', border: '1px solid #444', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }} />
        <textarea value={caption} onChange={e => setCaption(e.target.value)} placeholder="説明文・キャプション" rows={3} style={{ width: '100%', padding: '12px', marginBottom: '12px', background: '#2a2a2a', border: '1px solid #444', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }} />
        <input value={hashtags} onChange={e => setHashtags(e.target.value)} placeholder="#ハッシュタグ" style={{ width: '100%', padding: '12px', marginBottom: '16px', background: '#2a2a2a', border: '1px solid #444', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }} />
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {(['youtube', 'tiktok', 'instagram'] as const).map(p => (
            <button key={p} onClick={() => togglePlatform(p)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: platforms[p] ? (p === 'youtube' ? '#dc2626' : p === 'tiktok' ? '#0f9d58' : '#7c3aed') : '#333', color: '#fff', fontWeight: 'bold' }}>
              {p === 'youtube' ? '🔴 YouTube' : p === 'tiktok' ? '🟢 TikTok' : '🟣 Instagram'}
            </button>
          ))}
        </div>
        <button onClick={handleSubmit} disabled={uploading} style={{ width: '100%', padding: '16px', background: uploading ? '#555' : 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '16px', fontWeight: 'bold', cursor: uploading ? 'not-allowed' : 'pointer' }}>
          {uploading ? `⏳ ${progress}` : '🚀 同時投稿する'}
        </button>
        {Object.keys(status).length > 0 && (
          <div style={{ marginTop: '16px', padding: '16px', background: '#2a2a2a', borderRadius: '8px' }}>
            <h3 style={{ marginBottom: '8px' }}>📊 投稿結果</h3>
            {Object.entries(status).map(([k, v]) => (
              <p key={k} style={{ margin: '4px 0', color: v.includes('✅') ? '#4ade80' : v.includes('⚠️') ? '#fbbf24' : '#f87171' }}>{v}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
