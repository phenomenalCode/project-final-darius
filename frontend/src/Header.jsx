import React from "react";
import { AppBar, Toolbar, Typography, Button, Box, useTheme } from "@mui/material";

export const Header = ({ onLogout, onOpenGroups }) => {
  const theme = useTheme();

  const buttonStyle = {
    bgcolor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    "&:hover": {
      bgcolor: theme.palette.mode === "dark"
        ? theme.palette.background.default
        : "#e0e0e0",
    },
    ml: 1,
  };

  return (
    <AppBar
      position="static"
      elevation={2}
      sx={{ bgcolor: theme.palette.primary.main }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6" color={theme.palette.primary.contrastText}>
          Task Manager
        </Typography>

        <Box>
          <Button onClick={onOpenGroups} sx={buttonStyle}>
            Groups
          </Button>
          <Button onClick={onLogout} sx={buttonStyle}>
            Sign Out
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
