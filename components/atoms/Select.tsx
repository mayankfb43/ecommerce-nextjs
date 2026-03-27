"use client";

import { useId } from "react";
import {
  FormControl,
  InputLabel,
  Select as MuiSelect,
  MenuItem,
  FormHelperText,
  SelectProps as MuiSelectProps,
} from "@mui/material";

interface SelectOption {
  label: string;
  value: string | number;
}

interface SelectProps extends Omit<MuiSelectProps, "onChange"> {
  label: string;
  options: SelectOption[];
  error?: boolean;
  helperText?: string;
  onChange?: (value: any) => void;
}

export default function Select({
  label,
  options,
  error,
  helperText,
  onChange,
  value,
  ...props
}: SelectProps) {
  const labelId = useId();

  return (
    <FormControl fullWidth error={error}>
      <InputLabel id={labelId}>{label}</InputLabel>
      <MuiSelect
        labelId={labelId}
        label={label}
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        {...props}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </MuiSelect>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
}
