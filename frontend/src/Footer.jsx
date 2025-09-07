import React from 'react';
import { AppBar, Toolbar, Typography, useTheme } from '@mui/material';

export const Footer = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const currentYear = new Date().getFullYear();

  return (
    <AppBar
      component="footer"
      position="static"
      elevation={1}
      sx={{
        mt: 'auto',
        bgcolor: isDark ? 'background.default' : 'primary.main',
        color: isDark ? 'text.secondary' : 'primary.contrastText',
        py: 1.5,
      }}
    >
      <Toolbar disableGutters sx={{ justifyContent: 'center', px: 2 }}>
        <Typography
          variant="body2"
          sx={{
            fontSize: '0.875rem',
            textAlign: 'center',
            lineHeight: 1.5,
          }}
        >
          © {currentYear} Task Manager by Darius Olsson Carter — All rights reserved.
        </Typography>
      </Toolbar>
    </AppBar>
  );
};
