"use client";

import { Button, ButtonProps, CircularProgress } from "@mui/material";

interface FormButtonProps extends ButtonProps {
  loading?: boolean;
}

export default function FormButton({
  children,
  loading,
  disabled,
  ...props
}: FormButtonProps) {
  return (
    <Button
      type="submit"
      variant="contained"
      disabled={disabled || loading}
      sx={{
        background: "linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)",
        color: "#fff",
        py: 1.5,
        fontWeight: 600,
        "&:hover": {
          background: "linear-gradient(135deg, #4834D4 0%, #6C5CE7 100%)",
          boxShadow: "0 4px 15px rgba(108, 92, 231, 0.4)",
        },
        ...props.sx,
      }}
      {...props}
    >
      {loading ? <CircularProgress size={24} color="inherit" /> : children}
    </Button>
  );
}
