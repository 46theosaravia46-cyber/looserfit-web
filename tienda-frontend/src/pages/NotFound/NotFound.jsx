import { Link } from 'react-router-dom'
import './NotFound.css'

export default function NotFound() {
  return (
    <div className="notfound-page">
      <div className="container">
        <div className="notfound-card">
          <h1>404</h1>
          <p>La pagina que buscaste no existe.</p>
          <Link to="/" className="btn">Volver al inicio</Link>
        </div>
      </div>
    </div>
  )
}
