import { useEffect, useState } from 'react'
import { getHomeContent, updateHeroImages, updateFamilyImages, updateHomeSettings } from '../../services/api'
import './Admin.css'

export default function AdminHome() {
  const [heroItems, setHeroItems] = useState([])
  const [familyItems, setFamilyItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [familyLoading, setFamilyLoading] = useState(false)
  const [settingsLoading, setSettingsLoading] = useState(false)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')
  const [familyMsg, setFamilyMsg] = useState('')
  const [settingsMsg, setSettingsMsg] = useState('')
  const [comingSoonEnabled, setComingSoonEnabled] = useState(false)
  const [comingSoonDurationMinutes, setComingSoonDurationMinutes] = useState('')
  const [comingSoonMessage, setComingSoonMessage] = useState('Web prendida próximamente en:')
  const [comingSoonSubtitle, setComingSoonSubtitle] = useState('')
  const [comingSoonEmailMessage, setComingSoonEmailMessage] = useState('')

  useEffect(() => {
    getHomeContent()
      .then(data => {
        setHeroItems((data.heroImages || []).map((url, i) => ({ id: `existing-h-${i}`, src: url, file: null })))
        const fImgs = (data.familyImages || []).map((item, i) => {
          if (typeof item === 'string') return { id: `existing-f-${i}`, src: item, titulo: '', descripcion: '', file: null }
          return { id: `existing-f-${i}`, src: item.src, titulo: item.titulo || '', descripcion: item.descripcion || '', file: null }
        })
        setFamilyItems(fImgs)

        const comingSoon = data.comingSoon || {}
        setComingSoonEnabled(Boolean(comingSoon.enabled))
        setComingSoonMessage(comingSoon.message || 'Web prendida próximamente en:')
        setComingSoonSubtitle(comingSoon.subtitle || '')
        setComingSoonEmailMessage(comingSoon.emailMessage || '')
        if (comingSoon.launchDate) {
          const remainingMinutes = Math.max(Math.ceil((new Date(comingSoon.launchDate).getTime() - Date.now()) / 60000), 0)
          setComingSoonDurationMinutes(remainingMinutes.toString())
        }
      })
      .catch(() => setError('No se pudo cargar el home actual'))
  }, [])

  const compressImage = (file, maxWidth = 1200, quality = 0.8) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = (maxWidth / width) * height;
            width = maxWidth;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          }, 'image/jpeg', quality);
        };
      };
    });
  };

  const handleHeroFiles = async (e) => {
    const files = Array.from(e.target.files)
    setLoading(true)
    const compressedFiles = await Promise.all(files.map(f => compressImage(f)))
    const newItems = compressedFiles.map((f, i) => ({
      id: `new-h-${Date.now()}-${i}`,
      src: URL.createObjectURL(f),
      file: f
    }))
    setHeroItems(prev => [...prev, ...newItems].slice(0, 3))
    setLoading(false)
  }

  const handleFamilyFiles = async (e) => {
    const files = Array.from(e.target.files)
    setFamilyLoading(true)
    const compressedFiles = await Promise.all(files.map(f => compressImage(f)))
    const newItems = compressedFiles.map((f, i) => ({
      id: `new-f-${Date.now()}-${i}`,
      src: URL.createObjectURL(f),
      titulo: '',
      descripcion: '',
      file: f
    }))
    setFamilyItems(prev => [...prev, ...newItems])
    setFamilyLoading(false)
  }

  const removeHeroItem = (id) => setHeroItems(p => p.filter(x => x.id !== id))
  const removeFamilyItem = (id) => setFamilyItems(p => p.filter(x => x.id !== id))

  const updateFamilyMeta = (id, field, value) => {
    setFamilyItems(p => p.map(x => x.id === id ? { ...x, [field]: value } : x))
  }

  // Simple Native Drag & Drop Logic
  const [draggedItemIndex, setDraggedItemIndex] = useState(null)
  const onDragStart = (index) => setDraggedItemIndex(index)
  // Drag Enter for dynamically swapping order
  const onDragEnterHero = (e, targetIndex) => {
    e.preventDefault()
    if (draggedItemIndex === null || draggedItemIndex === targetIndex) return
    const newItems = [...heroItems]
    const draggedItem = newItems[draggedItemIndex]
    newItems.splice(draggedItemIndex, 1)
    newItems.splice(targetIndex, 0, draggedItem)
    setDraggedItemIndex(targetIndex)
    setHeroItems(newItems)
  }
  const onDragEnterFamily = (e, targetIndex) => {
    e.preventDefault()
    if (draggedItemIndex === null || draggedItemIndex === targetIndex) return
    const newItems = [...familyItems]
    const draggedItem = newItems[draggedItemIndex]
    newItems.splice(draggedItemIndex, 1)
    newItems.splice(targetIndex, 0, draggedItem)
    setDraggedItemIndex(targetIndex)
    setFamilyItems(newItems)
  }
  const onDragEnd = () => setDraggedItemIndex(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setMsg('')
    if (heroItems.length === 0) {
      setError('Debes subir al menos 1 imagen para el Hero.')
      return;
    }
    if (heroItems.length > 3) {
      setError('El Hero admite un máximo de 3 imágenes.')
      return;
    }
    setLoading(true)
    try {
      const formData = new FormData()
      const heroData = []
      let newCount = 0
      heroItems.forEach(item => {
        if (item.file) {
          heroData.push(`NEW_FILE_${newCount}`)
          formData.append('newHeroImages', item.file)
          newCount++
        } else {
          heroData.push(item.src)
        }
      })
      formData.append('heroData', JSON.stringify(heroData))
      const data = await updateHeroImages(formData)
      setHeroItems((data.home.heroImages || []).map((url, i) => ({ id: `existing-h-${i}`, src: url, file: null })))
      setMsg('Hero actualizado correctamente')
    } catch (err) {
      console.error('Error saving hero:', err)
      setError(err.message || 'No se pudo actualizar el hero')
    } finally {
      setLoading(false)
    }
  }

  const handleFamilySubmit = async (e) => {
    e.preventDefault()
    setError(''); setFamilyMsg('')
    if (familyItems.length === 0) {
      setError('Debes tener al menos 1 imagen en Looserfit Family.')
      return;
    }
    setFamilyLoading(true)
    try {
      const formData = new FormData()
      const familyData = []
      let newCount = 0
      familyItems.forEach(item => {
        if (item.file) {
          familyData.push({ src: `NEW_FILE_${newCount}`, titulo: item.titulo, descripcion: item.descripcion })
          formData.append('newFamilyImages', item.file)
          newCount++
        } else {
          familyData.push({ src: item.src, titulo: item.titulo, descripcion: item.descripcion })
        }
      })
      formData.append('familyData', JSON.stringify(familyData))
      const data = await updateFamilyImages(formData)
      
      const fImgs = (data.home.familyImages || []).map((item, i) => {
        if (typeof item === 'string') return { id: `existing-f-${i}`, src: item, titulo: '', descripcion: '', file: null }
        return { id: `existing-f-${i}`, src: item.src, titulo: item.titulo || '', descripcion: item.descripcion || '', file: null }
      })
      setFamilyItems(fImgs)
      setFamilyMsg('Family actualizado correctamente')
    } catch (err) {
      console.error('Error saving family:', err)
      setError(err.message || 'No se pudo actualizar o agregar imagenes family')
    } finally {
      setFamilyLoading(false)
    }
  }

  const handleSettingsSubmit = async (e) => {
    e.preventDefault()
    setError(''); setSettingsMsg('')
    if (comingSoonEnabled && (!comingSoonDurationMinutes || Number(comingSoonDurationMinutes) <= 0)) {
      setError('Debes ingresar la duración del temporizador en minutos')
      return;
    }
    setSettingsLoading(true)
    try {
      const payload = {
        comingSoon: {
          enabled: comingSoonEnabled,
          durationMinutes: comingSoonEnabled ? Number(comingSoonDurationMinutes) : null,
          message: comingSoonMessage,
          subtitle: comingSoonSubtitle,
          emailMessage: comingSoonEmailMessage
        }
      }
      const data = await updateHomeSettings(payload)
      const comingSoon = data.home.comingSoon || {}
      setComingSoonEnabled(Boolean(comingSoon.enabled))
      setComingSoonMessage(comingSoon.message || 'Web prendida próximamente en:')
      setComingSoonSubtitle(comingSoon.subtitle || '')
      setComingSoonEmailMessage(comingSoon.emailMessage || '')
      if (comingSoon.launchDate) {
        const remainingMinutes = Math.max(Math.ceil((new Date(comingSoon.launchDate).getTime() - Date.now()) / 60000), 0)
        setComingSoonDurationMinutes(remainingMinutes.toString())
      } else {
        setComingSoonDurationMinutes('')
      }
      setSettingsMsg('Configuración de lanzamiento guardada')
    } catch (err) {
      setError(err.message || 'No se pudo guardar la configuración de lanzamiento')
    } finally {
      setSettingsLoading(false)
    }
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">Contenido Home</h2>
          <p className="admin-page-sub">Seleccioná y editá las imágenes visibles en el home.</p>
        </div>
      </div>

      <form className="admin-form" onSubmit={handleSettingsSubmit} style={{ marginBottom: '2rem' }}>
        <div className="admin-card">
          <h3 className="admin-card__title">Modo lanzamiento / Coming soon</h3>
          <p className="admin-page-sub" style={{ marginBottom: '1rem', color: 'var(--gray-3)' }}>
            Activa esto para pausar la tienda pública durante el tiempo que configures con el temporizador.
          </p>

          <label className="admin-field" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <input
              type="checkbox"
              checked={comingSoonEnabled}
              onChange={(e) => setComingSoonEnabled(e.target.checked)}
            />
            <span>Activar página de lanzamiento</span>
          </label>

          <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
            <label className="admin-field">
              <span>Duración del temporizador (minutos)</span>
              <input
                type="number"
                min="1"
                value={comingSoonDurationMinutes}
                onChange={(e) => setComingSoonDurationMinutes(e.target.value)}
                className="admin-input"
                disabled={!comingSoonEnabled}
                placeholder="Ej: 120"
              />
            </label>

            <label className="admin-field">
              <span>Texto público</span>
              <input
                type="text"
                value={comingSoonMessage}
                onChange={(e) => setComingSoonMessage(e.target.value)}
                className="admin-input"
                disabled={!comingSoonEnabled}
              />
            </label>

            <label className="admin-field">
              <span>Subtítulo público</span>
              <input
                type="text"
                value={comingSoonSubtitle}
                onChange={(e) => setComingSoonSubtitle(e.target.value)}
                className="admin-input"
                disabled={!comingSoonEnabled}
              />
            </label>

            <label className="admin-field">
              <span>Mensaje de email automático</span>
              <textarea
                value={comingSoonEmailMessage}
                onChange={(e) => setComingSoonEmailMessage(e.target.value)}
                className="admin-input"
                disabled={!comingSoonEnabled}
                placeholder="Ej: La tienda ya está disponible. Entrá para ver los nuevos productos."
                rows="4"
                style={{ resize: 'vertical' }}
              />
            </label>
          </div>

          <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--gray-3)' }}>
            Mientras esté activado, los visitantes no podrán usar la web pública.
          </p>
        </div>

        {error && <p className="admin-form__error">{error}</p>}
        {settingsMsg && <p className="admin-form__exito">{settingsMsg}</p>}

        <div className="admin-form__actions">
          <button type="submit" className="admin-btn-primary" disabled={settingsLoading}>
            {settingsLoading ? 'Guardando...' : 'Guardar modo lanzamiento'}
          </button>
        </div>
      </form>

      {/* ── Hero Principal ── */}
      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="admin-card">
          <h3 className="admin-card__title">Hero principal</h3>
          <p className="admin-page-sub" style={{marginBottom: '1.2rem', color: 'var(--gray-3)'}}>
            Arrastrá las fotos para cambiar de lado (Izquierda, Centro, Derecha). Las nuevas fotos aparecerán temporalmente aquí antes de guardar.
          </p>

          <div style={{display:'flex', gap:'1rem', overflowX:'auto', marginBottom:'1.5rem', minHeight: '160px'}}>
            {heroItems.map((item, i) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => onDragStart(i)}
                onDragEnter={(e) => onDragEnterHero(e, i)}
                onDragEnd={onDragEnd}
                onDragOver={e => e.preventDefault()}
                style={{
                  width: '120px', flexShrink: 0, position: 'relative', border: '1px solid var(--gray-4)',
                  cursor: 'grab', background: '#f5f5f5', borderRadius: '8px', overflow: 'hidden'
                }}
              >
                <img src={item.src} style={{width:'100%', aspectRatio:'3/4', objectFit:'cover', pointerEvents:'none'}} alt={`Hero ${i}`} />
                <button type="button" onClick={() => removeHeroItem(item.id)} style={{position:'absolute', top:4, right:4, background:'#c0392b', color:'white', border:'none', borderRadius:'50%', width:'24px', height:'24px', cursor:'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>✕</button>
                <div style={{position:'absolute', bottom:0, width:'100%', background:'rgba(0,0,0,0.6)', color:'white', textAlign:'center', fontSize:'0.7rem', padding:'4px 0'}}>
                  {i === 0 ? '⇦ Izquierda' : i === 1 ? 'Centro' : 'Derecha ⇨'}
                </div>
              </div>
            ))}
            {heroItems.length === 0 && (
              <p style={{color: 'var(--gray-3)', fontStyle: 'italic', padding: '2rem'}}>No hay imágenes en el hero.</p>
            )}
          </div>

          <label className="img-upload">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleHeroFiles}
              style={{ display: 'none' }}
              disabled={heroItems.length >= 3}
            />
            <div className="img-upload__inner">
              <span style={heroItems.length >= 3 ? {color: 'var(--gray-3)'} : {}}>+ Agregar imagenes (máximo 3)</span>
            </div>
          </label>
        </div>

        {error && <p className="admin-form__error">{error}</p>}
        {msg   && <p className="admin-form__exito">{msg}</p>}

        <div className="admin-form__actions">
          <button type="submit" className="admin-btn-primary" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar hero'}
          </button>
        </div>
      </form>

      {/* ── Looserfit Family ── */}
      <form className="admin-form" onSubmit={handleFamilySubmit} style={{ marginTop: '3rem' }}>
        <div className="admin-card">
          <h3 className="admin-card__title">Looserfit Family (carousel)</h3>
          <p className="admin-page-sub" style={{ marginBottom: '1.2rem' }}>
            Agregá el nombre del producto, el IG y arrastrá ☰ para ordenarlos cronológicamente en el carrusel.
          </p>

          <div style={{display:'flex', flexDirection:'column', gap:'0.75rem', marginBottom:'1.5rem'}}>
            {familyItems.map((item, i) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => onDragStart(i)}
                onDragEnter={(e) => onDragEnterFamily(e, i)}
                onDragEnd={onDragEnd}
                onDragOver={e => e.preventDefault()}
                style={{
                  display: 'flex', gap: '1rem', alignItems: 'center', background: '#fdfdfc',
                  border: '1px solid var(--gray-4)', padding: '0.75rem', borderRadius: '8px',
                  cursor: 'grab'
                }}
              >
                <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'var(--gray-3)', width: '2rem'}}>
                  <span style={{fontSize:'1.2rem', lineHeight: '1'}}>☰</span>
                  <span style={{fontSize:'0.55rem', userSelect: 'none'}}>mover</span>
                </div>
                <img src={item.src} style={{width:'60px', height:'60px', objectFit:'cover', borderRadius:'4px', pointerEvents:'none'}} alt={`Family ${i}`}/>
                <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                  <input type="text" placeholder="Título (ej: Cárdigan oversize)" value={item.titulo} onChange={e => updateFamilyMeta(item.id, 'titulo', e.target.value)} style={{padding:'0.5rem', border:'1px solid var(--gray-4)', borderRadius:'4px', outline: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.85rem'}} />
                  <input type="text" placeholder="Descripción (ej: @usuario)" value={item.descripcion} onChange={e => updateFamilyMeta(item.id, 'descripcion', e.target.value)} style={{padding:'0.5rem', border:'1px solid var(--gray-4)', borderRadius:'4px', outline: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.85rem'}} />
                </div>
                <button type="button" onClick={() => removeFamilyItem(item.id)} style={{background:'#c0392b', color:'white', border:'none', padding:'0.6rem 0.8rem', borderRadius:'4px', cursor:'pointer', fontSize: '0.8rem', alignSelf: 'stretch', display: 'flex', alignItems: 'center'}}>Eliminar</button>
              </div>
            ))}
            {familyItems.length === 0 && (
              <p style={{color: 'var(--gray-3)', fontStyle: 'italic', padding: '2rem'}}>No hay imágenes en la familia. Puedes agregar nuevas.</p>
            )}
          </div>

          <label className="img-upload">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFamilyFiles}
              style={{ display: 'none' }}
            />
            <div className="img-upload__inner">
              <span>+ Agregar fotos para Looserfit Family</span>
            </div>
          </label>
        </div>
        
        {familyMsg && <p className="admin-form__exito">{familyMsg}</p>}
        
        <div className="admin-form__actions">
          <button type="submit" className="admin-btn-primary" disabled={familyLoading}>
            {familyLoading ? 'Guardando...' : 'Guardar fotos Family'}
          </button>
        </div>
      </form>
    </div>
  )
}
