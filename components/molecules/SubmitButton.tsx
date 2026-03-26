"use client";

import FormButton from "@/components/atoms/FormButton";
import { ButtonProps } from "@mui/material";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";

interface SubmitButtonProps extends Omit<ButtonProps, "children"> {
  label: string;
  loading?: boolean;
}

export default function SubmitButton({
  label,
  loading,
  ...props
}: SubmitButtonProps) {
  return (
    <FormButton
      loading={loading}
      endIcon={!loading ? <RocketLaunchIcon /> : null}
      {...props}
    >
      {label}
    </FormButton>
  );
}
