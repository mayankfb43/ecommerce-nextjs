"use client";

import {
  FormControl,
  FormLabel,
  RadioGroup as MuiRadioGroup,
  FormControlLabel,
  Radio,
  FormHelperText,
} from "@mui/material";

interface RadioOption {
  label: string;
  value: string;
}

interface RadioGroupProps {
  label: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  helperText?: string;
}

export default function RadioGroup({
  label,
  options,
  value,
  onChange,
  error,
  helperText,
}: RadioGroupProps) {
  return (
    <FormControl component="fieldset" error={error}>
      <FormLabel component="legend">{label}</FormLabel>
      <MuiRadioGroup
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<Radio />}
            label={option.label}
          />
        ))}
      </MuiRadioGroup>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
}
