"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Button,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import CheckboxGroup from "@/components/atoms/CheckboxGroup";
import RadioGroup from "@/components/atoms/RadioGroup";
import SubmitButton from "@/components/molecules/SubmitButton";
import { useState, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { hydrate, updateStep, updateFormData, resetForm } from "@/features/customer/customerSlice";

const addressSchema = z.object({
  type: z.string().min(1, "Type is required"),
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  zipCode: z.string().min(1, "Zip Code is required"),
});

const employmentSchema = z.object({
  company: z.string().min(1, "Company is required"),
  position: z.string().min(1, "Position is required"),
  startDate: z.string().min(1, "Start Date is required"),
  endDate: z.string().optional(),
});

const customerSchema = z.object({
  firstName: z.string().min(2, "First Name must be at least 2 characters"),
  lastName: z.string().min(2, "Last Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  gender: z.enum(["male", "female", "other"]),
  interests: z.array(z.string()).min(1, "Select at least one interest"),
  addresses: z.array(addressSchema).min(1, "At least one address is required"),
  employmentHistory: z.array(employmentSchema).min(1, "At least one employment record is required"),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

const steps = ["Personal Details", "Address Information", "Employment Details"];

export default function CustomerForm() {
  const dispatch = useAppDispatch();
  const { step: activeStep, formData: persistedData } = useAppSelector((state) => state.customer);

  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Use values prop for reactive sync with deep-cloned Redux state
  const values = useMemo(() => structuredClone(persistedData), [persistedData]);

  const {
    control,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    values, // RHF will reset the form whenever this memoized clone changes
  });

  // Handle hydration once on mount
  useEffect(() => {
    dispatch(hydrate());
    setIsHydrated(true);
  }, [dispatch]);

  const { fields: addressFields, append: appendAddress, remove: removeAddress } =
    useFieldArray({ control, name: "addresses" });

  const { fields: employmentFields, append: appendEmployment, remove: removeEmployment } =
    useFieldArray({ control, name: "employmentHistory" });

  const handleNext = async () => {
    let result = false;
    if (activeStep === 0) {
      result = await trigger(["firstName", "lastName", "email", "phone", "gender", "interests"]);
    } else if (activeStep === 1) {
      result = await trigger("addresses");
    }

    if (result) {
      dispatch(updateFormData(structuredClone(getValues())));
      dispatch(updateStep(activeStep + 1));
    }
  };

  const handleBack = () => {
    dispatch(updateFormData(structuredClone(getValues())));
    dispatch(updateStep(activeStep - 1));
  };

  const onSubmit = async (data: CustomerFormValues) => {
    setServerError(null);
    setSuccess(false);
    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Something went wrong");
      }

      setSuccess(true);
      dispatch(resetForm());
    } catch (err: any) {
      setServerError(err.message);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3, maxWidth: 800, mx: "auto" }}>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel sx={{
              "& .MuiStepLabel-label": { color: "#fff", opacity: 0.6 },
              "& .MuiStepLabel-label.Mui-active": { color: "#a78bfa", opacity: 1, fontWeight: 700 },
              "& .MuiStepLabel-label.Mui-completed": { color: "#34d399", opacity: 1 }
            }}>
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper sx={{ p: 4, borderRadius: 3, background: "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(10px)", boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}>
        {activeStep === 0 && (
          <Box>
            <Typography variant="h5" fontWeight={700} gutterBottom sx={{ color: "#4834D4", mb: 3 }}>
              Personal Information
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="firstName"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} label="First Name" error={!!errors.firstName} helperText={errors.firstName?.message} />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="lastName"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} label="Last Name" error={!!errors.lastName} helperText={errors.lastName?.message} />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} label="Email" type="email" error={!!errors.email} helperText={errors.email?.message} />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} label="Phone Number" error={!!errors.phone} helperText={errors.phone?.message} />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      {...field}
                      label="Gender"
                      options={[
                        { label: "Male", value: "male" },
                        { label: "Female", value: "female" },
                        { label: "Other", value: "other" },
                      ]}
                      error={!!errors.gender}
                      helperText={errors.gender?.message}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="interests"
                  control={control}
                  render={({ field }) => (
                    <CheckboxGroup
                      {...field}
                      label="Interests"
                      options={[
                        { label: "Technology", value: "tech" },
                        { label: "Sports", value: "sports" },
                        { label: "Music", value: "music" },
                        { label: "Reading", value: "reading" },
                      ]}
                      error={!!errors.interests}
                      helperText={errors.interests?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {activeStep === 1 && (
          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Typography variant="h5" fontWeight={700} sx={{ color: "#4834D4" }}>
                Addresses
              </Typography>
              <IconButton color="primary" onClick={() => appendAddress({ type: "Home", street: "", city: "", zipCode: "" })} sx={{ bgcolor: "rgba(72, 52, 212, 0.1)" }}>
                <AddIcon />
              </IconButton>
            </Box>
            {addressFields.map((item, index) => (
              <Box key={item.id} sx={{ mb: 3, p: 2, border: "1px dashed rgba(0,0,0,0.1)", borderRadius: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid size={{ xs: 12, sm: 2 }}>
                    <Controller
                      name={`addresses.${index}.type`}
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          label="Type"
                          options={[
                            { label: "Home", value: "Home" },
                            { label: "Work", value: "Work" },
                            { label: "Other", value: "Other" },
                          ]}
                          error={!!errors.addresses?.[index]?.type}
                        />
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Controller
                      name={`addresses.${index}.street`}
                      control={control}
                      render={({ field }) => (
                        <Input {...field} label="Street" error={!!errors.addresses?.[index]?.street} />
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <Controller
                      name={`addresses.${index}.city`}
                      control={control}
                      render={({ field }) => (
                        <Input {...field} label="City" error={!!errors.addresses?.[index]?.city} />
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 2 }}>
                    <Controller
                      name={`addresses.${index}.zipCode`}
                      control={control}
                      render={({ field }) => (
                        <Input {...field} label="Zip Code" error={!!errors.addresses?.[index]?.zipCode} />
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 1 }}>
                    <IconButton color="error" onClick={() => removeAddress(index)} disabled={addressFields.length === 1}>
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Box>
            ))}
            {errors.addresses && (
              <Typography color="error" variant="caption">
                {errors.addresses.message}
              </Typography>
            )}
          </Box>
        )}

        {activeStep === 2 && (
          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Typography variant="h5" fontWeight={700} sx={{ color: "#4834D4" }}>
                Employment History
              </Typography>
              <IconButton color="primary" onClick={() => appendEmployment({ company: "", position: "", startDate: "" })} sx={{ bgcolor: "rgba(72, 52, 212, 0.1)" }}>
                <AddIcon />
              </IconButton>
            </Box>
            {employmentFields.map((item, index) => (
              <Box key={item.id} sx={{ mb: 3, p: 2, border: "1px dashed rgba(0,0,0,0.1)", borderRadius: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Controller
                      name={`employmentHistory.${index}.company`}
                      control={control}
                      render={({ field }) => (
                        <Input {...field} label="Company" error={!!errors.employmentHistory?.[index]?.company} />
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Controller
                      name={`employmentHistory.${index}.position`}
                      control={control}
                      render={({ field }) => (
                        <Input {...field} label="Position" error={!!errors.employmentHistory?.[index]?.position} />
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <Controller
                      name={`employmentHistory.${index}.startDate`}
                      control={control}
                      render={({ field }) => (
                        <Input {...field} label="Start Date" type="date" InputLabelProps={{ shrink: true }} error={!!errors.employmentHistory?.[index]?.startDate} />
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 1 }}>
                    <IconButton color="error" onClick={() => removeEmployment(index)} disabled={employmentFields.length === 1}>
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Box>
            ))}
            {errors.employmentHistory && (
              <Typography color="error" variant="caption">
                {errors.employmentHistory.message}
              </Typography>
            )}
          </Box>
        )}

        <Box sx={{ mt: 4, display: "flex", justifyContent: "space-between", gap: 2 }}>
          <Button
            disabled={activeStep === 0 || isSubmitting}
            onClick={handleBack}
            startIcon={<ChevronLeftIcon />}
            sx={{ fontWeight: 600 }}
          >
            Back
          </Button>

          {activeStep === steps.length - 1 ? (
            <SubmitButton
              loading={isSubmitting}
              label="Submit Registration"
              sx={{ minWidth: 200 }}
            />
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={<ChevronRightIcon />}
              sx={{
                background: "linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)",
                fontWeight: 600,
                minWidth: 150,
                "&:hover": {
                  background: "linear-gradient(135deg, #4834D4 0%, #6C5CE7 100%)",
                }
              }}
            >
              Next
            </Button>
          )}
        </Box>

        {(serverError || success) && (
          <Box sx={{ mt: 3, textAlign: "center" }}>
            {serverError && <Typography color="error">{serverError}</Typography>}
            {success && <Typography color="success.main" fontWeight={600}>✅ Registration Successful! All data cleared.</Typography>}
          </Box>
        )}
      </Paper>
    </Box>
  );
}
