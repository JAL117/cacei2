import { useState } from 'react'
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Toolbar, 
  Box, 
  IconButton, 
  AppBar, 
  Typography,
  Avatar
} from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import PeopleIcon from '@mui/icons-material/People'
import SchoolIcon from '@mui/icons-material/School'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import DescriptionIcon from '@mui/icons-material/Description'
import AssignmentIcon from '@mui/icons-material/Assignment'
import MenuIcon from '@mui/icons-material/Menu'
import LogoutIcon from '@mui/icons-material/Logout'
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'
import GradeIcon from '@mui/icons-material/Grade'
import TimelineIcon from '@mui/icons-material/Timeline'
import ReportProblemIcon from '@mui/icons-material/ReportProblem'
import GroupIcon from '@mui/icons-material/Group'

const drawerWidth = 280

export default function Sidebar({ items = [], children, userName = "Director Principal", userRole = "Director", onLogout }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [active, setActive] = useState('Dashboard')

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    } else {
     
      window.location.reload()
    }
  }

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'white' }}>
    
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <SchoolOutlinedIcon sx={{ color: 'primary.main', fontSize: 32 }} />
        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700 }}>
          KairoLink
        </Typography>
      </Box>

    
      <Box sx={{ px: 2, py: 3, borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
          {userName.charAt(0)}
        </Avatar>
        <Box>
          <Typography variant="subtitle1" fontWeight={600}>
            {userName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {userRole}
          </Typography>
        </Box>
      </Box>

    
      <List sx={{ px: 2, py: 1, flex: 1 }}>
        {items.map(({ label, icon, onClick }) => (
          <ListItem
            button
            key={label}
            onClick={() => {
              setActive(label)
              onClick?.()
            }}
            sx={{
              borderRadius: 2,
              mb: 1,
              bgcolor: active === label ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
              '&:hover': {
                bgcolor: active === label ? 'rgba(25, 118, 210, 0.12)' : 'grey.50',
              },
            }}
          >
            <ListItemIcon
              sx={{
                color: active === label ? 'primary.main' : 'text.secondary',
                minWidth: 40,
              }}
            >              {icon === 'dashboard' && <DashboardIcon />}
              {icon === 'people' && <PeopleIcon />}
              {icon === 'school' && <SchoolIcon />}
              {icon === 'book' && <MenuBookIcon />}
              {icon === 'report' && <DescriptionIcon />}
              {icon === 'assignment' && <AssignmentIcon />}
              {icon === 'grade' && <GradeIcon />}
              {icon === 'timeline' && <TimelineIcon />}
              {icon === 'warning' && <ReportProblemIcon />}
              {icon === 'group' && <GroupIcon />}
            </ListItemIcon>
            <ListItemText 
              primary={label} 
              sx={{ 
                '& .MuiTypography-root': {
                  color: active === label ? 'primary.main' : 'text.primary',
                  fontWeight: active === label ? 600 : 400,
                }
              }}
            />
          </ListItem>
        ))}
      </List>

      <Box sx={{ p: 2, borderTop: '1px solid #f0f0f0' }}>
        <ListItem 
          button 
          onClick={handleLogout}
          sx={{ 
            borderRadius: 2,
            '&:hover': { bgcolor: 'grey.50' }
          }}
        >
          <ListItemIcon sx={{ color: 'text.secondary', minWidth: 40 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Cerrar sesión" />
        </ListItem>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          display: { sm: 'none' },
          bgcolor: 'white', 
          color: 'text.primary',
          boxShadow: 'none',
          borderBottom: '1px solid #f0f0f0'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            KairoLink
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
     
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              bgcolor: 'white',
            },
          }}
        >
          {drawer}
        </Drawer>
       
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              bgcolor: 'white',
              borderRight: '1px solid #f0f0f0',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1,  
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          bgcolor: '#f5f6fa',
      
          overflow: 'hidden'
        }}
      >
        <Toolbar sx={{ display: { sm: 'none' } }} />
        <Box sx={{ height: { xs: 'calc(100vh - 64px)', sm: '100vh' }, overflow: 'auto', p: 3 }}>
          {children}
        </Box>
      </Box>
    </Box>
  )
}
