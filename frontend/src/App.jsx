import React, { useState, useMemo, useCallback } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";
import { useTaskStore } from './store/useTaskStore';
import { Header } from './Header';
import { SubmitTask } from './SubmitTask';
import { DisplayTasks } from './DisplayTasks';
import { Footer } from './Footer';
import RegisterForm from './registration.jsx';
import LoginForm from './login.jsx';
import GroupsManagement from './groups-mngnt.jsx';
import {
  Box,
  Button,
  Typography,
  Paper,
  Container,
  CssBaseline,
  createTheme,
  ThemeProvider,
} from '@mui/material';

/* ------------------ LOGIN PAGE (externalized later) ------------------ */
const LoginPage = ({ theme, onLogin }) => {
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 3,
          backgroundColor: "blue",
          color: "#fff",
          p: 3,
        }}
      >
        <Typography variant="h3" tabIndex={0}>
          Welcome to To-Do App
        </Typography>

        <LoginForm onLogin={onLogin} />

        <Button
          variant="outlined"
          onClick={() => setShowRegisterModal(true)}
          sx={{
            backgroundColor: "#fff9c4",
            borderColor: "#fff",
            color: "#005FCC",
            "&:hover": {
              backgroundColor: "#005FCC",
              borderColor: "#eee",
              color: "#eee",
            },
          }}
        >
          Register
        </Button>

        {showRegisterModal && (
          <Box
            role="dialog"
            aria-modal="true"
            sx={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
            onClick={() => setShowRegisterModal(false)}
          >
            <Box
              role="document"
              sx={{
                backgroundColor: "beige",
                p: 3,
                borderRadius: 2,
                maxWidth: 400,
                width: "90%",
                position: "relative",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                onClick={() => setShowRegisterModal(false)}
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  minWidth: "32px",
                  color: "#000",
                }}
              >
                &times;
              </Button>
              <RegisterForm />
            </Box>
          </Box>
        )}
      </Box>
    </ThemeProvider>
  );
};

/* ------------------ APP (with inline MainApp) ------------------ */
export const App = () => {
  const [darkMode, setDarkMode] = useState(false);
  const tasks = useTaskStore((s) => s.tasks);

  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    return token ? { token } : null;
  });

  const [showGroups, setShowGroups] = useState(false);

  const handleLogin = (token) => {
    localStorage.setItem('token', token);
      setUser({ ...userData, token }); 
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const toggleDarkMode = useCallback(() => setDarkMode((prev) => !prev), []);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
          primary: {
            main: darkMode ? '#9c27b0' : '#1976d2',
            contrastText: '#fff',
          },
          background: {
            default: darkMode ? '#000' : '#fff',
            paper: darkMode ? '#1a1a1a' : '#f5f5f5',
          },
        },
      }),
    [darkMode]
  );

  /* ------------------ MAIN APP ------------------ */
  const MainApp = () => (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          backgroundImage: darkMode
            ? 'url(/photos/stars-night-galaxy-4k-3840x2160.webp)'
            : 'url(/photos/7247856.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          pb: { xs: 10, md: 8 },
        }}
      >
        <Header
          user={user}
          onLogout={handleLogout}
          onOpenGroups={() => setShowGroups(true)}
        />

        <Container
          maxWidth="xl"
          sx={{
            mt: { xs: 2, md: 4 },
            px: { xs: 1, sm: 2, md: 4 },
            display: 'flex',
            gap: { xs: 2, md: 4 },
            flexDirection: { xs: 'column', md: 'row' },
          }}
        >
          <Box
            sx={{ flex: { xs: '100%', md: '0 0 280px' }, order: { xs: 2, md: 1 } }}
          >
            <DisplayTasks />
          </Box>

          <Box
            sx={{
              order: { xs: 1, md: 2 },
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              width: '100%',
              maxWidth: { md: 900, lg: 1100 },
              p: { xs: 2, sm: 3, md: 4 },
              borderRadius: 2,
              boxShadow: 4,
              backgroundColor: darkMode
                ? 'rgba(33,33,33,0.85)'
                : 'rgba(255,255,255,0.85)',
              color: theme.palette.text.primary,
            }}
          >
            <Paper
              elevation={4}
              sx={{ p: { xs: 2, sm: 3 }, textAlign: 'center', width: '100%', maxWidth: 400 }}
            >
              <Typography variant="h4" gutterBottom>
                To Do List
              </Typography>
              <Typography variant="body1">Total Tasks: {tasks.length}</Typography>
              <Typography variant="body1">
                Uncompleted Tasks: {tasks.filter((t) => !t.completed).length}
              </Typography>
            </Paper>

            <SubmitTask />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="contained" color="primary" onClick={toggleDarkMode}>
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </Button>
            </Box>
          </Box>
        </Container>

        {showGroups && (
          <GroupsManagement onClose={() => setShowGroups(false)} />
        )}
      </Box>
      <Footer />
    </ThemeProvider>
  );

  /* ------------------ ROUTING ------------------ */
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={user ? (
            <Navigate to="/app" replace />
          ) : (
            <LoginPage theme={theme} onLogin={handleLogin} />
          )}
        />
        <Route
          path="/app"
          element={user ? (
            <MainApp />
          ) : (
            <Navigate to="/login" replace />
          )}
        />
        <Route
          path="*"
          element={<Navigate to={user ? "/app" : "/login"} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
};
