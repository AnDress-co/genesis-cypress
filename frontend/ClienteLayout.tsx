import { useEffect, useRef, useState } from 'react'
import { Link, Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useClienteAuthStore } from '../../store/clienteAuthStore'

export default function ClienteLayout() {
  const { cliente, cerrarSesion } = useClienteAuthStore()
  const navigate = useNavigate()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Cierra el menú desplegable al hacer clic fuera de él o al presionar Escape
  useEffect(() => {
    const cerrarAlHacerClicFuera = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuAbierto(false)
      }
    }
    const cerrarConEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuAbierto(false)
    }
    document.addEventListener('mousedown', cerrarAlHacerClicFuera)
    document.addEventListener('keydown', cerrarConEscape)
    return () => {
      document.removeEventListener('mousedown', cerrarAlHacerClicFuera)
      document.removeEventListener('keydown', cerrarConEscape)
    }
  }, [])

  const handleCerrarSesion = () => {
    setMenuAbierto(false)
    cerrarSesion()
    navigate('/cliente/login')
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-black">G</span>
              </div>
              <span className="text-white font-bold">GENESIS</span>
            </div>
            <div className="flex gap-6">
              <NavLink
                to="/cliente/catalogo"
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${isActive ? 'text-indigo-400' : 'text-gray-400 hover:text-white'}`
                }
              >
                🛍️ Catálogo
              </NavLink>
              <NavLink
                to="/cliente/pedidos"
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${isActive ? 'text-indigo-400' : 'text-gray-400 hover:text-white'}`
                }
              >
                📦 Mis Pedidos
              </NavLink>
            </div>
          </div>

          {/* Menú de usuario desplegable */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              data-testid="menu-usuario"
              aria-haspopup="menu"
              aria-expanded={menuAbierto}
              onClick={() => setMenuAbierto((abierto) => !abierto)}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm px-4 py-2 rounded-lg transition-colors"
            >
              <span>Hola, {cliente?.nombreCompleto.split(' ')[0]}</span>
              <span aria-hidden="true" className="text-xs">▾</span>
            </button>

            {menuAbierto && (
              <div
                role="menu"
                data-testid="menu-usuario-opciones"
                className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl py-1 z-40"
              >
                <Link
                  to="/cliente/pedidos"
                  role="menuitem"
                  onClick={() => setMenuAbierto(false)}
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                >
                  Mis Pedidos
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleCerrarSesion}
                  className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}
