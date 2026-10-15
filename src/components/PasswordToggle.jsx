/* Botón para mostrar u ocultar una contraseña (compartido por Login y Registro). */
const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.6 6.2A9.8 9.8 0 0 1 12 6c6.4 0 10 7 10 7a17 17 0 0 1-2.9 3.7" />
    <path d="M6.6 6.9A17 17 0 0 0 2 13s3.6 7 10 7a9.6 9.6 0 0 0 4.6-1.1" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    <path d="m3 3 18 18" />
  </svg>
)

function PasswordToggle({ visible, onToggle }) {
  return (
    <button
      type="button"
      className="password-toggle-btn"
      onClick={onToggle}
      aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      aria-pressed={visible}
    >
      {visible ? <EyeOffIcon /> : <EyeIcon />}
    </button>
  )
}

export default PasswordToggle
