"use client";

import { useMemo } from "react";
import FormButton from "@/components/atoms/FormButton";
import { ButtonProps } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import AppRegistrationIcon from "@mui/icons-material/AppRegistration";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";

const ICONS = [
  SendIcon,
  HowToRegIcon,
  AppRegistrationIcon,
  RocketLaunchIcon,
  AssignmentIndIcon,
];

interface SubmitButtonProps extends Omit<ButtonProps, "children"> {
  label: string;
  loading?: boolean;
}

export default function SubmitButton({
  label,
  loading,
  ...props
}: SubmitButtonProps) {
  // Select a random icon once on render
  const RandomIcon = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * ICONS.length);
    return ICONS[randomIndex];
  }, []);

  return (
    <FormButton
      loading={loading}
      endIcon={!loading ? <RandomIcon /> : null}
      {...props}
    >
      {label}
    </FormButton>
  );
}
