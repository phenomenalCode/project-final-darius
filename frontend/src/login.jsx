import React, { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
} from '@mui/material';

const LoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      localStorage.setItem('token', data.token);
      onLogin(data.token);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        backgroundColor: '#fff9c4', // light yellow
        maxWidth: 400,
        width: '100%',
      }}
      component="form"
      onSubmit={handleLogin}
      aria-labelledby="login-form-heading"
    >
      <Typography
        variant="h5"
        component="h2"
        id="login-form-heading"
        tabIndex={0}
        sx={{ color: '#1976d2', textAlign: 'center' }} // blue heading
      >
        Login
      </Typography>

      <TextField
        label="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        autoComplete="username"
        fullWidth
      />

      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoComplete="current-password"
        fullWidth
      />

      <Button
        type="submit"
        variant="contained"
        sx={{
          backgroundColor: '#1976d2', // blue
          color: '#fff59d', // yellow text
          '&:hover': { backgroundColor: '#1565c0' },
        }}
        fullWidth
      >
        Login
      </Button>

      {error && (
        <Typography
          role="alert"
          aria-live="polite"
          tabIndex={0}
          sx={{ color: 'red', textAlign: 'center' }}
        >
          {error}
        </Typography>
      )}
    </Paper>
  );
};

export default LoginForm;
