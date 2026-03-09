import { useState } from 'react'

export default function Home() {
  const [title, setTitle] = useState('')
  const [caption, setCaption] = useState('')
  const [hashtags, setHashtags] = useState('')
  const [platforms, setPlatforms] = useState({youtube: true, tiktok: true, instagram: true})
  const [status, setStatus] = useState<{[key: string]: string}>({})
  const [uploading, setUploading] = useState(false)
  const [videoFile, setVideoFile] = useState<File | null>(null)

  const handleSubmit = async () => {
    if (!videoFile) return alert('動画を選択してください')
    if (!title) return alert('タイトルを入力してください')
    setUploading(true)
    setStatus({youtube: '投稿中...', tiktok: '投稿中...', instagram: '投稿中...'})
    const formData = new FormData()
    formData.append('video', videoFile)
    formData.append('title', title)
    formData.append('caption', caption)
    formData.append('hashtags', hashtags)
    formData.append('platforms', JSON.stringify(platforms))
    try {
      const res = await fetch('/api/upload', {method: 'POST', body: formData})
      const data = await res.json()
      setStatus(data.results || {})
    } catch (e) {
      setStatus({error: 'エラーが発生しました'})
    }
    setUploading(false)
  }

  return (
    <div style={{background:'#0f0f0f',minHeight:'100vh',color:'white',fontFamily:'sans-serif',padding:'20px'}}>
      <h1 style={{textAlign:'center',background:'linear-gradient(135deg,#667eea,#764ba2)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',fontSize:'2em'}}>
        🎬 VideoSync2026
      </h1>
      <div style={{maxWidth:'600px',margin:'0 auto'}}>
        <div style={{background:'#1a1a1a',borderRadius:'16px',padding:'20px',marginBottom:'20px'}}>
          <h2>📤 動画をアップロード</h2>
          <input type="file" accept="video/*" onChange={e=>setVideoFile(e.target.files?.[0]||null)}
            style={{width:'100%',padding:'10px',background:'#2a2a2a',color:'white',border:'2px dashed #667eea',borderRadius:'8px',marginBottom:'10px'}}/>
          {videoFile && <p style={{color:'#667eea'}}>✅ {videoFile.name}</p>}
          <input placeholder="タイトル" value={title} onChange={e=>setTitle(e.target.value)}
            style={{width:'100%',padding:'10px',background:'#2a2a2a',color:'white',border:'1px solid #444',borderRadius:'8px',marginBottom:'10px',boxSizing:'border-box'}}/>
          <textarea placeholder="説明文・キャプション" value={caption} onChange={e=>setCaption(e.target.value)}
            style={{width:'100%',padding:'10px',background:'#2a2a2a',color:'white',border:'1px solid #444',borderRadius:'8px',marginBottom:'10px',boxSizing:'border-box',height:'80px'}}/>
          <input placeholder="#ハッシュタグ" value={hashtags} onChange={e=>setHashtags(e.target.value)}
            style={{width:'100%',padding:'10px',background:'#2a2a2a',color:'white',border:'1px solid #444',borderRadius:'8px',marginBottom:'20px',boxSizing:'border-box'}}/>
          <div style={{display:'flex',gap:'10px',marginBottom:'20px',flexWrap:'wrap'}}>
            {[['youtube','#FF0000','🔴 YouTube'],['tiktok','#00f2ea','⚫ TikTok'],['instagram','#833ab4','📷 Instagram']].map(([k,c,l])=>(
              <label key={k} style={{display:'flex',alignItems:'center',gap:'5px',cursor:'pointer',padding:'8px 12px',background: platforms[k as keyof typeof platforms] ? c+'33' : '#2a2a2a',border:`1px solid ${c}`,borderRadius:'8px'}}>
                <input type="checkbox" checked={platforms[k as keyof typeof platforms]} onChange={e=>setPlatforms({...platforms,[k]:e.target.checked})} style={{accentColor:c}}/>
                <span>{l}</span>
              </label>
            ))}
          </div>
          <button onClick={handleSubmit} disabled={uploading}
            style={{width:'100%',padding:'15px',background:'linear-gradient(135deg,#667eea,#764ba2)',color:'white',border:'none',borderRadius:'8px',fontSize:'1.1em',cursor:'pointer'}}>
            {uploading ? '⏳ 投稿中...' : '🚀 同時投稿する'}
          </button>
        </div>
        {Object.keys(status).length > 0 && (
          <div style={{background:'#1a1a1a',borderRadius:'16px',padding:'20px'}}>
            <h2>📊 投稿結果</h2>
            {Object.entries(status).map(([k,v])=>(
              <div key={k} style={{padding:'10px',background:'#2a2a2a',borderRadius:'8px',marginBottom:'8px'}}>
                <strong>{k}:</strong> {String(v)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
