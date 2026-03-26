"use client";

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
  return (
    <FormControl fullWidth error={error}>
      <InputLabel>{label}</InputLabel>
      <MuiSelect
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
