import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, TextField, Typography, Link, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import { login, forgotPassword } from '../../../api/personal'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [forgotOpen, setForgotOpen] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSent, setForgotSent] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    
    try {
      const response = await login({ email, password })
      
      if (response.user && response.user.roles) {
        // Guardar el ID del usuario en localStorage
        if (response.user.id) {
          localStorage.setItem('userID', response.user.id)
          console.log('🔑 Usuario logueado - ID guardado:', response.user.id)
        }
        
        const userRole = response.user.roles[0] 
        
        if (userRole === 'Director') {
          navigate('/director/home', { replace: true })
        } else if (userRole === 'Tutor Académico') {
          navigate('/tutor/home', { replace: true })
        } else if (userRole === 'Docente') {
          navigate('/docente/home', { replace: true })
        } else {
          alert('Rol no reconocido')
        }
      }
    } catch (error) {
      alert('Credenciales incorrectas')
    }
  }

  const handleForgot = async (e) => {
    e.preventDefault()
    
    try {
      await forgotPassword(forgotEmail)
      setForgotSent(true)
    } catch (error) {
      alert('Error al enviar el correo de recuperación')
    }
  }

  return (
    <Box sx={{
      position: 'fixed',
      inset: 0,
      minHeight: '100vh',
      minWidth: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: '#f5f6fa',
      overflow: 'hidden',
    }}>
      <Box component="form" onSubmit={handleLogin} sx={{
        width: { xs: '90%', sm: 370 },
        maxWidth: 400,
        p: { xs: 2, sm: 4 },
        bgcolor: 'white',
        borderRadius: 3,
        boxShadow: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}>
        <Typography variant="h5" fontWeight={700} color="primary.main" align="center" mb={1}>
          KairoLink
        </Typography>
        <Typography variant="subtitle1" align="center" color="text.secondary">
          Inicia sesión para continuar
        </Typography>
        <TextField
          label="Correo electrónico"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          fullWidth
        />
        <TextField
          label="Contraseña"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          fullWidth
        />
        <Button type="submit" variant="contained" size="large" sx={{ mt: 1 }}>
          Iniciar sesión
        </Button>
        <Link
          component="button"
          variant="body2"
          onClick={() => setForgotOpen(true)}
          sx={{ alignSelf: 'flex-end', mt: 1 }}
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </Box>
      <Dialog open={forgotOpen} onClose={() => { setForgotOpen(false); setForgotSent(false); setForgotEmail('') }}>
        <DialogTitle>Recuperar contraseña</DialogTitle>
        <DialogContent>
          {forgotSent ? (
            <Typography>Se han enviado instrucciones al correo electrónico</Typography>
          ) : (
            <TextField
              autoFocus
              margin="dense"
              label="Correo electrónico"
              type="email"
              fullWidth
              value={forgotEmail}
              onChange={e => setForgotEmail(e.target.value)}
              required
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setForgotOpen(false); setForgotSent(false); setForgotEmail('') }}>Cancelar</Button>
          {!forgotSent && <Button onClick={handleForgot} variant="contained">Enviar</Button>}
        </DialogActions>
      </Dialog>
    </Box>
  )
}
