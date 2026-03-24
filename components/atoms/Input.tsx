"use client";

import TextField, { TextFieldProps } from "@mui/material/TextField";

export default function Input(props: TextFieldProps) {
  return (
    <TextField
      fullWidth
      variant="outlined"
      {...props}
    />
  );
}
