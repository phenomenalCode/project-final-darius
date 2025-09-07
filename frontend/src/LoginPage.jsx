import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  CssBaseline,
  ThemeProvider,
} from "@mui/material";
import LoginForm from "./login.jsx";
import RegisterForm from "./registration.jsx";

export default function LoginPage({ theme, onLogin }) {
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
          backgroundColor: "blue", // page background
          color: "#fff", // text color on blue
          p: 3,
        }}
      >
        <Typography variant="h3" tabIndex={0}>
          Welcome to To-Do App
        </Typography>

        {/* Login form */}
        <LoginForm onLogin={onLogin} />

        {/* Register button */}
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

        {/* Register modal */}
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
                backgroundColor: "beige", // modal background
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
}
