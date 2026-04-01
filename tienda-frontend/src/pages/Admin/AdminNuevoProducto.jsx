import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BASE_URL, getAuthHeaders, getCategories } from '../../services/api'
import './Admin.css'

const INITIAL_CATEGORIAS = ['Outerwear / Abrigos','Tops / Remeras','Bottoms / Pantalones','Footwear / Calzado','Accessories / Accesorios']
const INITIAL_TIPOS = ['baggy','oversize','slim','regular','chaqueta','no aplica']
const INITIAL_TALLES = ['S', 'M', 'L', 'XL', 'XXL']

export default function AdminNuevoProducto() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const esEdicion = Boolean(id)

  const [form, setForm] = useState({
    nombre:      '',
    descripcion: '',
    precio:      '',
    precioOferta:'',
    categoria:   '',
    tipo:        'regular',
    publicado:   false,
    esNuevoDrop: false,
    stock:       0,
    talles:      [],
    guiaTalles:  '',
  })

  // Listas personalizables
  const [customCategorias, setCustomCategorias] = useState(() => JSON.parse(localStorage.getItem('lf_categorias')) || INITIAL_CATEGORIAS)
  const [tiposMap, setTiposMap] = useState(() => {
    const map = JSON.parse(localStorage.getItem('lf_tipos_map')) || {};
    if (Object.keys(map).length === 0) {
      const def = JSON.parse(localStorage.getItem('lf_tipos')) || INITIAL_TIPOS;
      INITIAL_CATEGORIAS.forEach(c => map[c] = def);
    }
    return map;
  })
  const [tallesMap, setTallesMap] = useState(() => {
    const map = JSON.parse(localStorage.getItem('lf_talles_map')) || {};
    if (Object.keys(map).length === 0) {
      const def = JSON.parse(localStorage.getItem('lf_talles')) || INITIAL_TALLES;
      INITIAL_CATEGORIAS.forEach(c => map[c] = def);
    }
    return map;
  })
  
  const [realCategories, setRealCategories] = useState([])
  const [nuevaCat, setNuevaCat] = useState('')
  const [nuevoTipo, setNuevoTipo] = useState('')
  const [nuevoTalle, setNuevoTalle] = useState('')

  // Cargar categorías reales del backend
  useEffect(() => {
    getCategories()
      .then(data => {
        setRealCategories(data)
        if (!esEdicion && data.length > 0 && !form.categoria) {
          setForm(p => ({ ...p, categoria: data[0]._id }))
        }
      })
      .catch(err => console.error('Error al cargar categorías:', err))
  }, [esEdicion, form.categoria])

  const currentTipos = tiposMap[form.categoria] || []
  const currentTalles = tallesMap[form.categoria] || []

  useEffect(() => {
    if (!form.categoria && customCategorias.length > 0) {
      setForm(p => ({ ...p, categoria: customCategorias[0] }))
    }
  }, [customCategorias, form.categoria])
  const [imagenes,    setImagenes]    = useState([])   // archivos nuevos
  const [previews,    setPreviews]    = useState([])   // URLs preview
  const [imgExistentes, setImgExistentes] = useState([]) // URLs ya en DB
  const [guiaTallesImg, setGuiaTallesImg] = useState(null) // Nuevo archivo guía
  const [guiaTallesPreview, setGuiaTallesPreview] = useState('') // Preview guía
  const [loading,     setLoading]     = useState(false)
  const [loadingData, setLoadingData] = useState(esEdicion)
  const [error,       setError]       = useState('')
  const [exito,       setExito]       = useState(false)

  // Si es edición, cargar datos existentes
  useEffect(() => {
    if (!esEdicion) return
    fetch(`${BASE_URL}/products/${id}`)
      .then(r => r.json())
      .then(data => {
        setForm({
          nombre:      data.nombre      || '',
          descripcion: data.descripcion || '',
          precio:      data.precio      || '',
          precioOferta:data.precioOferta|| '',
          categoria:   data.categoria   || customCategorias[0],
          tipo:        data.tipo        || 'regular',
          publicado:   data.publicado   || false,
          esNuevoDrop: data.esNuevoDrop || false,
          stock:       data.stock       || 0,
          talles:      data.talles      || [],
          guiaTalles:  data.guiaTalles  || '',
        })
        setImgExistentes(data.imagenes || [])
        setLoadingData(false)
      })
      .catch(() => setLoadingData(false))
  }, [esEdicion, id])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => {
      const next = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }
      // Si cambia categoría, ver si el tipo actual es válido en la nueva
      if (name === 'categoria') {
        const availableTipos = tiposMap[value] || []
        if (!availableTipos.includes(next.tipo)) {
          next.tipo = availableTipos[0] || ''
        }
      }
      return next
    })
  }

  const handleTalle = (t) => {
    setForm(prev => ({
      ...prev,
      talles: prev.talles.includes(t)
        ? prev.talles.filter(x => x !== t)
        : [...prev.talles, t]
    }))
  }

  const handleAddCustom = (setter, key, value, setVal) => {
    if(!value.trim()) return
    setter(prev => {
      const next = prev.includes(value) ? prev : [...prev, value]
      localStorage.setItem(key, JSON.stringify(next))
      return next
    })
    setVal('')
  }

  const handleRemoveCustom = (setter, key, value) => {
    const ok = window.confirm(`¿Seguro que querés borrar "${value}" de las opciones?`)
    if(!ok) return
    setter(prev => {
      const next = prev.filter(v => v !== value)
      localStorage.setItem(key, JSON.stringify(next))
      return next
    })
  }

  const handleAddMapItem = (setter, key, category, value, setVal) => {
    if(!value.trim() || !category) return
    setter(prev => {
      const list = prev[category] || []
      const nextList = list.includes(value) ? list : [...list, value]
      const nextMap = { ...prev, [category]: nextList }
      localStorage.setItem(key, JSON.stringify(nextMap))
      return nextMap
    })
    setVal('')
  }
  const handleRemoveMapItem = (setter, key, category, value) => {
    const ok = window.confirm(`¿Seguro que querés borrar "${value}" de "${category}"?`)
    if(!ok) return
    setter(prev => {
      const list = prev[category] || []
      const nextMap = { ...prev, [category]: list.filter(v => v !== value) }
      localStorage.setItem(key, JSON.stringify(nextMap))
      return nextMap
    })
  }

  const compressImage = (file, maxWidth = 1000, quality = 0.7) => {
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

          // Redimensionar si es más ancho que maxWidth
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

  const handleImagenes = async (e) => {
    const files = Array.from(e.target.files)
    setLoading(true) // Show loading during compression
    const compressedFiles = await Promise.all(files.map(f => compressImage(f)))
    setImagenes(prev => [...prev, ...compressedFiles])
    const urls = compressedFiles.map(f => URL.createObjectURL(f))
    setPreviews(prev => [...prev, ...urls])
    setLoading(false)
  }

  const handleGuiaTallesImg = async (e) => {
    const file = e.target.files[0]
    if (file) {
      setLoading(true)
      const compressed = await compressImage(file)
      setGuiaTallesImg(compressed)
      setGuiaTallesPreview(URL.createObjectURL(compressed))
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // --- DIAGNÓSTICO DE ÚLTIMA INSTANCIA ---
      if (esEdicion) {
        const confirmed = window.confirm(`MODO v1.0.7 - DIAGNÓSTICO:\n\n- Vamos a MANTENER (fotos viejas): ${imgExistentes.length}\n- Vamos a SUMAR (fotos nuevas): ${imagenes.length}\n\n¿Es correcto? Si dice 0 anteriores y hay fotos en pantalla, ¡CANCELÁ!`)
        if (!confirmed) {
          setLoading(false)
          return
        }
      }

      const data = new FormData()

      // --- PRIORIDAD MÁXIMA: Mandamos las viejas PRIMERO para que el servidor no las pierda ---
      if (esEdicion) {
        imgExistentes.forEach(url => data.append('galeriaPersistente', url))
      }

      Object.entries(form).forEach(([k, v]) => {
        if (Array.isArray(v)) {
          v.forEach(item => data.append(k, item))
        } else {
          data.append(k, v)
        }
      })
      imagenes.forEach(img => data.append('imagenes', img))
      
      if (guiaTallesImg) {
        data.append('guiaTallesImg', guiaTallesImg)
      }

      const url    = esEdicion
        ? `${BASE_URL}/products/${id}`
        : `${BASE_URL}/products/create`
      const method = esEdicion ? 'PUT' : 'POST'

      const res = await fetch(url, { 
        method, 
        headers: { ...getAuthHeaders() },
        body: data 
      })

      const resData = await res.json()
      if (!res.ok) {
        throw new Error(resData.mensaje || resData.error || 'Error al guardar producto')
      }
      alert(`${resData.mensaje}\n\nDatos recibidos por el servidor: ${resData.bodyKeys?.join(', ')}`)
      setExito(true)
      setTimeout(() => navigate('/admin/productos'), 1500)
    } catch (err) {
      console.error('Error saving product:', err)
      setError(err.message === 'Failed to fetch' 
        ? 'No se pudo conectar con el servidor. Revisá tu conexión a internet.' 
        : err.message)
      setLoading(false)
    }
  }

  if (loadingData) return (
    <div className="admin-loading">Cargando producto...</div>
  )

  return (
    <div className="admin-nuevo">
      <div className="admin-page-header">
        <div>
          <button
            className="admin-back-btn"
            onClick={() => navigate('/admin/productos')}
          >
            ← Volver
          </button>
          <h2 className="admin-page-title">
            {esEdicion ? 'Editar Producto' : 'Agregar Nuevo Producto'}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="admin-form">

        {/* ── Detalles principales ── */}
        <div className="admin-card">
          <h3 className="admin-card__title">Detalles principales</h3>
          <div className="admin-form-row">
            <div className="admin-field">
              <label>Nombre del Producto</label>
              <input
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Ej: Vintage Carhartt Jacket"
                required
              />
            </div>
            <div className="admin-field">
              <label>Precio ($)</label>
              <input
                name="precio"
                type="number"
                value={form.precio}
                onChange={handleChange}
                placeholder="Ej: 15000"
                required
              />
            </div>
            <div className="admin-field">
              <label>Precio de Oferta ($)</label>
              <input
                name="precioOferta"
                type="number"
                value={form.precioOferta}
                onChange={handleChange}
                placeholder="Opcional. Ej: 12000"
              />
            </div>
          </div>

          <div className="admin-form-row" style={{marginTop: '1rem'}}>
            <div className="admin-field">
              <label>Categoría</label>
              <div style={{display:'flex', gap:'0.5rem', marginBottom:'0.5rem'}}>
                <select name="categoria" value={form.categoria} onChange={handleChange} style={{flex:1}}>
                  {realCategories.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                  {/* Fallback por si hay categorías viejas en texto */}
                  {form.categoria && !realCategories.find(c => c._id === form.categoria) && (
                    <option value={form.categoria}>{form.categoria} (Antigua)</option>
                  )}
                </select>
                <button type="button" className="admin-btn-secondary" style={{padding:'0 0.8rem'}} onClick={() => handleRemoveCustom(setCustomCategorias, 'lf_categorias', form.categoria)}>🗑</button>
              </div>
              <div style={{display:'flex', gap:'0.5rem'}}>
                <input value={nuevaCat} onChange={e=>setNuevaCat(e.target.value)} placeholder="Nueva categoría" style={{flex:1}} />
                <button type="button" className="admin-btn-secondary" style={{padding:'0 0.8rem'}} onClick={() => {
                  handleAddCustom(setCustomCategorias, 'lf_categorias', nuevaCat, setNuevaCat)
                  if(nuevaCat) setForm(p => ({...p, categoria: nuevaCat}))
                }}>+</button>
              </div>
            </div>
          </div>
          <div className="admin-field" style={{marginTop: '1rem'}}>
            <label>Descripción</label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              placeholder="Describí el producto, materiales, medidas..."
            />
          </div>

          <div className="admin-field" style={{marginTop: '1rem'}}>
            <label>Guía de Talles (Texto o Imagen)</label>
            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              <textarea
                name="guiaTalles"
                value={form.guiaTalles?.startsWith('http') ? '' : form.guiaTalles}
                onChange={handleChange}
                placeholder="Escribí las medidas aquí..."
                rows="3"
                disabled={Boolean(guiaTallesImg || (esEdicion && form.guiaTalles?.startsWith('http') && !guiaTallesImg))}
              />
              
              <div className="guia-img-upload">
                {/* Preview de la guía actual (si es imagen) */}
                {(guiaTallesPreview || (form.guiaTalles?.startsWith('http'))) && (
                  <div className="img-preview" style={{width: '200px', marginBottom: '0.5rem'}}>
                    <img src={guiaTallesPreview || form.guiaTalles} alt="Guía de talles" />
                    <button 
                      type="button" 
                      className="img-preview__remove" 
                      onClick={() => {
                        setGuiaTallesImg(null)
                        setGuiaTallesPreview('')
                        if(form.guiaTalles?.startsWith('http')) setForm(p => ({...p, guiaTalles: ''}))
                      }}
                    >✕</button>
                  </div>
                )}
                
                <label className="admin-btn-secondary" style={{display: 'inline-block', cursor: 'pointer', padding: '0.5rem 1rem'}}>
                  <input type="file" accept="image/*" onChange={handleGuiaTallesImg} style={{display: 'none'}} />
                  {form.guiaTalles?.startsWith('http') || guiaTallesImg ? 'Cambiar Imagen de Guía' : 'Subir Imagen de Guía'}
                </label>
              </div>
            </div>
          </div>

          <div className="admin-form-row" style={{marginTop: '1rem'}}>
            <div className="admin-field">
              <label>Stock</label>
              <input
                name="stock"
                type="number"
                value={form.stock}
                onChange={handleChange}
                min="0"
              />
            </div>
            <div className="admin-field">
              <label>Tipo</label>
              <div style={{display:'flex', gap:'0.5rem', marginBottom:'0.5rem'}}>
                <select name="tipo" value={form.tipo} onChange={handleChange} style={{flex:1}}>
                  {currentTipos.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <button type="button" className="admin-btn-secondary" style={{padding:'0 0.8rem'}} onClick={() => handleRemoveMapItem(setTiposMap, 'lf_tipos_map', form.categoria, form.tipo)}>🗑</button>
              </div>
              <div style={{display:'flex', gap:'0.5rem'}}>
                <input value={nuevoTipo} onChange={e=>setNuevoTipo(e.target.value)} placeholder="Nuevo tipo" style={{flex:1}} />
                <button type="button" className="admin-btn-secondary" style={{padding:'0 0.8rem'}} onClick={() => {
                  handleAddMapItem(setTiposMap, 'lf_tipos_map', form.categoria, nuevoTipo, setNuevoTipo)
                  if(nuevoTipo) setForm(p => ({...p, tipo: nuevoTipo}))
                }}>+</button>
              </div>
            </div>
          </div>
          <div className="admin-checkboxes">
            <label className="admin-checkbox">
              <input
                type="checkbox"
                name="publicado"
                checked={form.publicado}
                onChange={handleChange}
              />
              <span style={{whiteSpace: 'nowrap'}}>Publicado (visible en la tienda)</span>
            </label>
            <label className="admin-checkbox">
              <input
                type="checkbox"
                name="esNuevoDrop"
                checked={form.esNuevoDrop}
                onChange={handleChange}
              />
              <span style={{whiteSpace: 'nowrap'}}>Marcar como Nuevo Drop</span>
            </label>
          </div>
        </div>

        {/* ── Talles ── */}
        <div className="admin-card">
          <h3 className="admin-card__title">Talles disponibles ({form.categoria})</h3>
          <div className="talles-selector" style={{marginBottom: '1rem'}}>
            {currentTalles.map(t => (
              <div key={t} style={{display:'inline-flex', flexDirection:'column', gap:'0.2rem'}}>
                <button
                  type="button"
                  className={`talle-chip ${form.talles.includes(t) ? 'talle-chip--active' : ''}`}
                  onClick={() => handleTalle(t)}
                >
                  {t}
                </button>
                <span 
                  style={{fontSize:'0.6rem', color:'#c0392b', cursor:'pointer', textAlign:'center'}}
                  onClick={() => handleRemoveMapItem(setTallesMap, 'lf_talles_map', form.categoria, t)}
                  title="Eliminar talle de la lista"
                >x</span>
              </div>
            ))}
          </div>
          <div style={{display:'flex', gap:'0.5rem', maxWidth: '250px'}}>
            <input value={nuevoTalle} onChange={e=>setNuevoTalle(e.target.value)} placeholder="Nuevo talle" />
            <button type="button" className="admin-btn-secondary" onClick={() => handleAddMapItem(setTallesMap, 'lf_talles_map', form.categoria, nuevoTalle.toUpperCase(), setNuevoTalle)}>+ Añadir</button>
          </div>
        </div>

        {/* ── Imágenes ── */}
        <div className="admin-card">
          <h3 className="admin-card__title">Imágenes del Producto</h3>

          {/* Imágenes ya existentes (modo edición) */}
          {imgExistentes.length > 0 && (
            <div className="img-grid" style={{marginBottom: '1rem'}}>
              {imgExistentes.map((url, i) => (
                <div key={i} className="img-preview img-preview--existente">
                  <img src={url} alt={`Imagen ${i+1}`} />
                  <span className="img-preview__tag">Guardada</span>
                  <button 
                    type="button" 
                    className="img-preview__remove" 
                    onClick={() => setImgExistentes(prev => prev.filter(x => x !== url))}
                    title="Eliminar de la galería"
                  >✕</button>
                </div>
              ))}
            </div>
          )}

          {/* Previews de nuevas imágenes */}
          {previews.length > 0 && (
            <div className="img-grid" style={{marginBottom: '1rem'}}>
              {previews.map((url, i) => (
                <div key={i} className="img-preview">
                  <img src={url} alt={`Preview ${i+1}`} />
                </div>
              ))}
            </div>
          )}

          {/* Upload */}
          <label className="img-upload">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImagenes}
              style={{display: 'none'}}
            />
            <div className="img-upload__inner">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <span>Subir imágenes</span>
              <small>JPG, PNG, WEBP</small>
            </div>
          </label>
        </div>

        {/* ── Acciones ── */}
        {error  && <p className="admin-form__error">{error}</p>}
        {exito  && <p className="admin-form__exito">✓ Producto guardado. Redirigiendo...</p>}

        <div className="admin-form__actions">
          <button
            type="button"
            className="admin-btn-secondary"
            onClick={() => navigate('/admin/productos')}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="admin-btn-primary"
            style={{ background: '#7b1fa2' }}
            disabled={loading}
          >
            {loading ? 'Subiendo fotos (no cierres)...' : (esEdicion ? 'Guardar Cambios' : 'Guardar Producto')}
          </button>
        </div>

      </form>
    </div>
  )
}