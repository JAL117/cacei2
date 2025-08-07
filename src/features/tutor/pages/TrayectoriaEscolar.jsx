import React from 'react'
import { Box, Typography } from '@mui/material'

export default function TrayectoriaEscolar() {
  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Trayectoria Escolar
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Contenido de la trayectoria escolar del tutorado.
      </Typography>
    </Box>
  )
}
