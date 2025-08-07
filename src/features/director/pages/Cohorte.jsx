import { Box, Typography, Card, CardContent, Alert } from '@mui/material'
import BuildIcon from '@mui/icons-material/Build'

export default function Cohorte() {
  return (
    <Box>
    
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Informes por Cohorte
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Análisis generacional de estudiantes
        </Typography>
      </Box>

      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 6, textAlign: 'center' }}>
          <BuildIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Próximamente
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Este módulo está en desarrollo
          </Typography>
          <Alert severity="info" sx={{ maxWidth: 400, mx: 'auto' }}>
            <Typography variant="body2">
              <strong>Desarrollo a cargo de:</strong> Arturo
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    </Box>
  )
}
