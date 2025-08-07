import { Box, Card, CardContent, Typography } from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'

export default function StatsCard({ title, value, change, icon: Icon, color, isNegative = false, description }) {
  return (
    <Card sx={{ 
      borderRadius: 4, 
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      height: '100%',
      border: '1px solid',
      borderColor: 'grey.100',
      transition: 'all 0.3s ease',
      width: '100%',
      maxWidth: '100%',
      boxSizing: 'border-box',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        borderColor: `${color}40`
      }
    }}>
      <CardContent sx={{ 
        p: { xs: 2, sm: 3, md: 4 },
        width: '100%',
        boxSizing: 'border-box',
        '&:last-child': {
          paddingBottom: { xs: 2, sm: 3, md: 4 }
        }
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          mb: { xs: 2, sm: 3 },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 0 },
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <Box sx={{ 
            flex: 1, 
            minWidth: 0,
            width: '100%',
            maxWidth: '100%',
            wordBreak: 'break-word',
            overflow: 'hidden'
          }}>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              gutterBottom 
              sx={{ 
                fontWeight: 500,
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }}
            >
              {title}
            </Typography>
            <Typography 
              variant="h3" 
              fontWeight="700" 
              sx={{ 
                mb: 1, 
                color: '#1F2937',
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                lineHeight: 1.2
              }}
            >
              {value}
            </Typography>
            {description && (
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ 
                  display: 'block', 
                  mb: 2,
                  fontSize: { xs: '0.7rem', sm: '0.75rem' }
                }}
              >
                {description}
              </Typography>
            )}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              flexWrap: 'wrap',
              maxWidth: '100%'
            }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                px: { xs: 1, sm: 1.5 },
                py: 0.5,
                borderRadius: 2,
                backgroundColor: isNegative ? '#FEF2F2' : '#F0FDF4'
              }}>
                {isNegative ? (
                  <TrendingDownIcon sx={{ fontSize: { xs: 12, sm: 14 }, color: '#EF4444' }} />
                ) : (
                  <TrendingUpIcon sx={{ fontSize: { xs: 12, sm: 14 }, color: '#10B981' }} />
                )}
                <Typography 
                  variant="caption" 
                  color={isNegative ? '#EF4444' : '#10B981'}
                  fontWeight="600"
                  sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                >
                  {change}
                </Typography>
              </Box>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
              >
                vs mes anterior
              </Typography>
            </Box>
          </Box>
          <Box sx={{
            p: { xs: 2, sm: 2.5 },
            borderRadius: 3,
            backgroundColor: `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ml: { xs: 0, sm: 2 },
            alignSelf: { xs: 'flex-end', sm: 'flex-start' },
            flexShrink: 0,
            minWidth: 'fit-content'
          }}>
            <Icon sx={{ 
              color, 
              fontSize: { xs: 24, sm: 28, md: 32 } 
            }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}
