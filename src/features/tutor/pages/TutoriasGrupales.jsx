import React from 'react'
import { Box, Typography } from '@mui/material'

export default function TutoriasGrupales() {
  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Tutorías Grupales
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Próximamente. Desarrollo a cargo de Mora.
      </Typography>
    </Box>
  )
}
