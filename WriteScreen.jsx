import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ChipRow from '../components/ChipRow'
import { PhotoIcon } from '../components/icons'
import { TOPICS } from '../lib/supabaseClient'
import { createPost } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

function autoGrow(el) {
  if (!el) return
  el.style.height = 'auto'
  el.style.height = el.scrollHeight + 'px'
}

export default function WriteScreen() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const showToast = useToast()
  const fileInputRef = useRef(null)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [topic, setTopic] = useState(TOPICS[0])
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState('')

  const publishable = title.trim().length > 0 && body.trim().length > 0 && !publishing

  function resetForm() {
    setTitle('')
    setBody('')
    setTopic(TOPICS[0])
    setImageFile(null)
    setImagePreview(null)
    setError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  function removePhoto() {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function cancel() {
    resetForm()
    navigate('/')
  }

  async function publish() {
    if (!publishable) return
    setPublishing(true)
    setError('')
    try {
      const id = await createPost({
        authorId: user.id,
        topic,
        title: title.trim(),
        body: body.trim(),
        imageFile,
      })
      resetForm()
      showToast('Historia publicada')
      navigate(`/post/${id}`)
    } catch (err) {
      setError(err.message || 'No se pudo publicar. Inténtalo de nuevo.')
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div className="screen" id="write-screen">
      <div className="topbar">
        <button className="topbar-action" type="button" onClick={cancel}>
          Cancelar
        </button>
        <button
          className="publish-btn"
          style={{ margin: 0, padding: '9px 18px' }}
          type="button"
          disabled={!publishable}
          onClick={publish}
        >
          {publishing ? 'Publicando…' : 'Publicar'}
        </button>
      </div>
      <div className="write-form">
        <textarea
          className="title-input"
          placeholder="Título de tu historia"
          rows={2}
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            autoGrow(e.target)
          }}
        />
        <textarea
          className="body-input"
          placeholder="Empieza a escribir..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <div className="photo-picker">
          {imagePreview ? (
            <div className="photo-preview-wrap">
              <img className="photo-preview" src={imagePreview} alt="" />
              <button className="photo-remove" type="button" onClick={removePhoto}>
                ✕
              </button>
            </div>
          ) : (
            <button type="button" className="photo-add-btn" onClick={() => fileInputRef.current?.click()}>
              <PhotoIcon />
              Añadir foto
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFile}
          />
        </div>
        <div className="topic-select-label">Tema</div>
        <ChipRow options={TOPICS} active={topic} onChange={setTopic} style={{ padding: 0 }} />
        {error && <p className="form-error">{error}</p>}
      </div>
    </div>
  )
}
