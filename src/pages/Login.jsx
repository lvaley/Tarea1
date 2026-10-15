import { useEffect, useState } from 'react'
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
import PasswordToggle from '../components/PasswordToggle.jsx'
import SessionCheck from '../components/SessionCheck.jsx'
import './Login.css'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function Login() {
  const { login, isAuthenticated, isInitializing, status, error, notice, clearError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState({ email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [slow, setSlow] = useState(false)

  const isLoading = status === 'loading'

  // Al entrar a esta página se descartan los errores de otros formularios (ej. Registro).
  useEffect(() => {
    clearError()
  }, [clearError])

  // El servidor gratuito puede tardar en "despertar": si la espera se alarga, se avisa.
  useEffect(() => {
    if (!isLoading) return undefined
    const timer = setTimeout(() => setSlow(true), 4000)
    return () => {
      clearTimeout(timer)
      setSlow(false)
    }
  }, [isLoading])

  const redirectTo = location.state?.from || '/perfil'

  if (isInitializing) return <SessionCheck />
  // Si ya hay sesión iniciada, no tiene sentido mostrar el login de nuevo.
  if (isAuthenticated) return <Navigate to={redirectTo} replace />

  const validate = () => {
    const errors = {}
    if (!form.email.trim()) {
      errors.email = 'El correo es obligatorio.'
    } else if (!EMAIL_REGEX.test(form.email.trim())) {
      errors.email = 'Ingresa un correo válido.'
    }
    if (!form.password) {
      errors.password = 'La contraseña es obligatoria.'
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
              {notice && (
                <Alert variant="warning" className="py-2">
                  {notice}
                </Alert>
              )}
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
                    <PasswordToggle
                      visible={showPassword}
                      onToggle={() => setShowPassword((prev) => !prev)}
                    />
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
                      <Spinner as="span" animation="border" size="sm" className="me-2" />
                      Verificando...
                    </>
                  ) : (
                    'Iniciar sesión'
                  )}
                </button>

                {isLoading && slow && (
                  <p className="login-slow-hint" role="status">
                    El servidor está despertando, esto puede tardar hasta un minuto la primera vez.
                  </p>
                )}
              </Form>
            </Card.Body>
          </Card>

          <p className="text-center login-switch">
            ¿Aún no tienes cuenta?{' '}
            <Link to="/register" state={location.state}>
              Crear cuenta
            </Link>
          </p>
          <p className="text-center login-back-link">
            <Link to="/">← Volver al inicio</Link>
          </p>
        </Col>
      </Row>
    </Container>
  )
}

export default Login
