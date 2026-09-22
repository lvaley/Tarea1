import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import Alert from 'react-bootstrap/Alert'
import Spinner from 'react-bootstrap/Spinner'
import { useAuth } from '../context/AuthContext.jsx'
import './Login.css'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/* Iconos en línea, sin dependencias externas */
const EyeIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const EyeOffIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10.6 6.2A9.8 9.8 0 0 1 12 6c6.4 0 10 7 10 7a17 17 0 0 1-2.9 3.7" />
    <path d="M6.6 6.9A17 17 0 0 0 2 13s3.6 7 10 7a9.6 9.6 0 0 0 4.6-1.1" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    <path d="m3 3 18 18" />
  </svg>
)

function Login() {
  const { login, isAuthenticated, status, error } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState({ email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Si ya hay sesión iniciada, no tiene sentido mostrar el login de nuevo.
  const redirectTo = location.state?.from || '/perfil'
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  const validate = () => {
    const errors = {}
    if (!form.email.trim()) {
      errors.email = 'El correo es obligatorio.'
    } else if (!EMAIL_REGEX.test(form.email.trim())) {
      errors.email = 'Ingresa un correo válido.'
    }
    if (!form.password) {
      errors.password = 'La contraseña es obligatoria.'
    } else if (form.password.length < 6) {
      errors.password = 'Debe tener al menos 6 caracteres.'
    }
    return errors
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitted(true)

    const errors = validate()
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    const result = await login(form)
    if (result.ok) {
      navigate(redirectTo, { replace: true })
    }
  }

  const isLoading = status === 'loading'

  return (
    <Container className="section login-section">
      <Row className="justify-content-center">
        <Col md={7} lg={5}>
          <div className="text-center mb-4">
            <p className="eyebrow">Mi cuenta</p>
            <h1 className="login-title">Iniciar sesión</h1>
            <p className="login-subtitle">
              Accede para ver tu perfil y el historial de tus pedidos.
            </p>
          </div>

          <Card className="login-card">
            <Card.Body>
              {status === 'error' && error && (
                <Alert variant="danger" className="py-2">
                  {error}
                </Alert>
              )}

              <Form noValidate onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="loginEmail">
                  <Form.Label>Correo electrónico</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    isInvalid={submitted && !!fieldErrors.email}
                    placeholder="tu@correo.com"
                    autoComplete="username"
                  />
                  <Form.Control.Feedback type="invalid">
                    {fieldErrors.email}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3" controlId="loginPassword">
                  <Form.Label>Contraseña</Form.Label>
                  <InputGroup hasValidation>
                    <Form.Control
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      isInvalid={submitted && !!fieldErrors.password}
                      placeholder="••••••••"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={
                        showPassword
                          ? 'Ocultar contraseña'
                          : 'Mostrar contraseña'
                      }
                      aria-pressed={showPassword}
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                    <Form.Control.Feedback type="invalid">
                      {fieldErrors.password}
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>

                <button
                  type="submit"
                  className="btn-neko w-100 login-submit-btn"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        className="me-2"
                      />
                      Verificando...
                    </>
                  ) : (
                    'Iniciar sesión'
                  )}
                </button>
              </Form>
            </Card.Body>
          </Card>

          <p className="text-center login-back-link">
            <Link to="/">← Volver al inicio</Link>
          </p>
        </Col>
      </Row>
    </Container>
  )
}

export default Login
