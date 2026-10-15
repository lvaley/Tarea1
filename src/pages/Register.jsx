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

function Register() {
  const { register, isAuthenticated, isInitializing, status, clearError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [serverErrors, setServerErrors] = useState({}) // errores devueltos por la API, por campo
  const [formError, setFormError] = useState(null) // error general (no asociado a un campo)
  const [submitted, setSubmitted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const isLoading = status === 'loading'

  useEffect(() => {
    clearError()
  }, [clearError])

  const redirectTo = location.state?.from || '/perfil'

  if (isInitializing) return <SessionCheck />
  if (isAuthenticated) return <Navigate to={redirectTo} replace />

  const validate = () => {
    const errors = {}
    const name = form.name.trim()
    if (!name) errors.name = 'El nombre es obligatorio.'
    else if (name.length < 2) errors.name = 'El nombre debe tener al menos 2 caracteres.'
    else if (name.length > 80) errors.name = 'El nombre no puede superar los 80 caracteres.'

    if (!form.email.trim()) errors.email = 'El correo es obligatorio.'
    else if (!EMAIL_REGEX.test(form.email.trim())) errors.email = 'Ingresa un correo válido.'

    if (!form.password) errors.password = 'La contraseña es obligatoria.'
    else if (form.password.length < 8) errors.password = 'Debe tener al menos 8 caracteres.'
    else if (form.password.length > 72) errors.password = 'No puede superar los 72 caracteres.'

    if (!form.confirm) errors.confirm = 'Repite la contraseña.'
    else if (form.confirm !== form.password) errors.confirm = 'Las contraseñas no coinciden.'
    return errors
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    // Al corregir un campo, se descarta el error que el servidor había marcado en él.
    setServerErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitted(true)

    const errors = validate()
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setServerErrors({})
    setFormError(null)
    const result = await register({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
    })

    if (result.ok) {
      navigate(redirectTo, { replace: true })
      return
    }
    // 409 = correo repetido: se marca en el campo del correo. 400 trae errores por campo.
    // Solo lo que no pertenece a ningún campo (ej. sin conexión) va a la alerta superior.
    const mapped = {
      ...result.fieldErrors,
      ...(result.status === 409 && { email: result.error }),
    }
    setServerErrors(mapped)
    setFormError(Object.keys(mapped).length > 0 ? null : result.error)
  }

  const errorFor = (field) => fieldErrors[field] || serverErrors[field]
  const showError = (field) => submitted && !!errorFor(field)
  return (
    <Container className="section login-section">
      <Row className="justify-content-center">
        <Col md={7} lg={5}>
          <div className="text-center mb-4">
            <p className="eyebrow">Mi cuenta</p>
            <h1 className="login-title">Crear cuenta</h1>
            <p className="login-subtitle">
              Regístrate para guardar tus pedidos y consultar tu historial.
            </p>
          </div>

          <Card className="login-card">
            <Card.Body>
              {formError && (
                <Alert variant="danger" className="py-2">
                  {formError}
                </Alert>
              )}

              <Form noValidate onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="registerName">
                  <Form.Label>Nombre completo</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    isInvalid={showError('name')}
                    placeholder="Tu nombre"
                    autoComplete="name"
                    maxLength={80}
                  />
                  <Form.Control.Feedback type="invalid">{errorFor('name')}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3" controlId="registerEmail">
                  <Form.Label>Correo electrónico</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    isInvalid={showError('email')}
                    placeholder="tu@correo.com"
                    autoComplete="username"
                  />
                  <Form.Control.Feedback type="invalid">{errorFor('email')}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3" controlId="registerPassword">
                  <Form.Label>Contraseña</Form.Label>
                  <InputGroup hasValidation>
                    <Form.Control
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      isInvalid={showError('password')}
                      placeholder="Mínimo 8 caracteres"
                      autoComplete="new-password"
                      maxLength={72}
                    />
                    <PasswordToggle
                      visible={showPassword}
                      onToggle={() => setShowPassword((prev) => !prev)}
                    />
                    <Form.Control.Feedback type="invalid">{errorFor('password')}</Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-3" controlId="registerConfirm">
                  <Form.Label>Repite la contraseña</Form.Label>
                  <Form.Control
                    type={showPassword ? 'text' : 'password'}
                    name="confirm"
                    value={form.confirm}
                    onChange={handleChange}
                    isInvalid={showError('confirm')}
                    placeholder="Repite tu contraseña"
                    autoComplete="new-password"
                    maxLength={72}
                  />
                  <Form.Control.Feedback type="invalid">{errorFor('confirm')}</Form.Control.Feedback>
                </Form.Group>

                <button type="submit" className="btn-neko w-100 login-submit-btn" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" className="me-2" />
                      Creando cuenta...
                    </>
                  ) : (
                    'Crear cuenta'
                  )}
                </button>
              </Form>
            </Card.Body>
          </Card>

          <p className="text-center login-switch">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" state={location.state}>
              Iniciar sesión
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

export default Register
