"use client";

import MuiButton, { ButtonProps as MuiButtonProps } from "@mui/material/Button";

interface ButtonProps extends MuiButtonProps {
  gradient?: boolean;
}

export default function Button({ gradient, sx, ...props }: ButtonProps) {
  return (
    <MuiButton
      sx={{
        ...(gradient && {
          background: "linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)",
          color: "#fff",
          "&:hover": {
            background: "linear-gradient(135deg, #4834D4 0%, #6C5CE7 100%)",
            boxShadow: "0 4px 15px rgba(108, 92, 231, 0.4)",
          },
        }),
        ...sx,
      }}
      {...props}
    />
  );
}
