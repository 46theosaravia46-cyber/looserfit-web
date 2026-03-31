import './Ticker.css'

const ITEMS = [
  'Envíos a todo el país por Correo Argentino',
  'Nueva colección disponible',
  'Streetwear Buenos Aires',
  'Talles S M L XL XXL',
  'Drops exclusivos',
]

export default function Ticker() {
  const duplicated = [...ITEMS, ...ITEMS]

  return (
    <div className="ticker-wrap">
      <div className="ticker-track">
        {duplicated.map((item, i) => (
          <span className="ticker-item" key={i}>{item}</span>
        ))}
      </div>
    </div>
  )
}