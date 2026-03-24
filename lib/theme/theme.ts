"use client";

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#6C5CE7",
      light: "#A29BFE",
      dark: "#4834D4",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#00CEC9",
      light: "#55EFC4",
      dark: "#00B894",
      contrastText: "#FFFFFF",
    },
    error: {
      main: "#E17055",
      light: "#FAB1A0",
      dark: "#D63031",
    },
    warning: {
      main: "#FDCB6E",
      light: "#FFEAA7",
      dark: "#E17055",
    },
    success: {
      main: "#00B894",
      light: "#55EFC4",
      dark: "#00896B",
    },
    background: {
      default: "#F8F9FE",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#2D3436",
      secondary: "#636E72",
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: {
      fontSize: "2.5rem",
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 700,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: "1.75rem",
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: "1.25rem",
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: "1rem",
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.6,
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.6,
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: "10px 24px",
          fontSize: "0.9rem",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(108, 92, 231, 0.3)",
          },
        },
        containedPrimary: {
          background: "linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)",
          "&:hover": {
            background: "linear-gradient(135deg, #4834D4 0%, #6C5CE7 100%)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 10,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "0 1px 10px rgba(0,0,0,0.08)",
        },
      },
    },
  },
});

export default theme;
