"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";

interface AuthFormProps {
  mode: "login" | "register";
  onSubmit: (data: {
    name?: string;
    email: string;
    password: string;
  }) => Promise<void>;
  error?: string;
  isLoading?: boolean;
}

export default function AuthForm({
  mode,
  onSubmit,
  error,
  isLoading,
}: AuthFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      ...(mode === "register" ? { name } : {}),
      email,
      password,
    });
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        maxWidth: 440,
        mx: "auto",
        p: 4,
        borderRadius: 3,
        bgcolor: "background.paper",
        boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
      }}
    >
      <Typography variant="h4" textAlign="center" gutterBottom fontWeight={700}>
        {mode === "login" ? "Welcome Back" : "Create Account"}
      </Typography>
      <Typography
        variant="body2"
        textAlign="center"
        color="text.secondary"
        sx={{ mb: 3 }}
      >
        {mode === "login"
          ? "Sign in to continue shopping"
          : "Join us and start shopping"}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        {mode === "register" && (
          <Input
            label="Full Name"
            id="auth-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}
        <Input
          label="Email Address"
          type="email"
          id="auth-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Password"
          type="password"
          id="auth-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          inputProps={{ minLength: 6 }}
        />
        <Button
          type="submit"
          variant="contained"
          size="large"
          gradient
          disabled={isLoading}
          sx={{ mt: 1 }}
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : mode === "login" ? (
            "Sign In"
          ) : (
            "Create Account"
          )}
        </Button>
      </Box>
    </Box>
  );
}
