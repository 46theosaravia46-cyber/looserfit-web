import { useState } from 'react'
import * as api from '../../services/api'
import './Admin.css'

export default function AdminNewsletter() {
  const [asunto, setAsunto] = useState('')
  const [contenido, setContenido] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!asunto || !contenido) return setError('Por favor completá todos los campos.')
    
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await api.sendNewsletter(asunto, contenido)
      setSuccess(res.mensaje)
      setAsunto('')
      setContenido('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-newsletter">
      <h2 className="admin-title">Enviar Noticia / Newsletter 📩</h2>
      <p className="admin-subtitle">
        El mensaje se enviará al Gmail de todos los usuarios registrados.
      </p>

      <div className="admin-card">
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="admin-field">
            <label>Asunto del correo</label>
            <input
              type="text"
              value={asunto}
              onChange={e => setAsunto(e.target.value)}
              placeholder="Ej: ¡Nuevo Drop de Invierno disponible!"
              required
            />
          </div>

          <div className="admin-field">
            <label>Contenido / Mensaje</label>
            <textarea
              value={contenido}
              onChange={e => setContenido(e.target.value)}
              placeholder="Escribí acá la noticia..."
              rows="10"
              required
            />
          </div>

          {error && <p className="admin-error">{error}</p>}
          {success && <p className="admin-success">{success}</p>}

          <button 
            type="submit" 
            className="admin-btn admin-btn--primary"
            disabled={loading}
          >
            {loading ? 'Enviando...' : 'Enviar a todos los usuarios'}
          </button>
        </form>
      </div>

    </div>
  )
}
