"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Divider,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import CheckboxGroup from "@/components/atoms/CheckboxGroup";
import RadioGroup from "@/components/atoms/RadioGroup";
import SubmitButton from "@/components/molecules/SubmitButton";
import { useState } from "react";

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

export default function CustomerForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      gender: "male",
      interests: [],
      addresses: [{ type: "Home", street: "", city: "", zipCode: "" }],
      employmentHistory: [{ company: "", position: "", startDate: "" }],
    },
  });

  const { fields: addressFields, append: appendAddress, remove: removeAddress } =
    useFieldArray({ control, name: "addresses" });

  const { fields: employmentFields, append: appendEmployment, remove: removeEmployment } =
    useFieldArray({ control, name: "employmentHistory" });

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
      reset();
    } catch (err: any) {
      setServerError(err.message);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3 }}>
      <Paper sx={{ p: 4, borderRadius: 3, background: "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(10px)" }}>
        <Typography variant="h5" fontWeight={700} gutterBottom sx={{ color: "#4834D4" }}>
          Personal Information
        </Typography>
        <Grid container spacing={3} component="div">
          <Grid size={{ xs: 12, sm: 6 }} component="div">
            <Controller
              name="firstName"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="First Name"
                  error={!!errors.firstName}
                  helperText={errors.firstName?.message}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }} component="div">
            <Controller
              name="lastName"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Last Name"
                  error={!!errors.lastName}
                  helperText={errors.lastName?.message}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }} component="div">
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Email"
                  type="email"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }} component="div">
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Phone Number"
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }} component="div">
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
          <Grid size={{ xs: 12, sm: 6 }} component="div">
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

        <Divider sx={{ my: 4 }} />

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h5" fontWeight={700} sx={{ color: "#4834D4" }}>
            Addresses
          </Typography>
          <IconButton color="primary" onClick={() => appendAddress({ type: "Home", street: "", city: "", zipCode: "" })}>
            <AddIcon />
          </IconButton>
        </Box>
        {addressFields.map((item, index) => (
          <Grid container spacing={2} key={item.id} sx={{ mb: 2, alignItems: "center" }} component="div">
            <Grid size={{ xs: 12, sm: 2 }} component="div">
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
            <Grid size={{ xs: 12, sm: 4 }} component="div">
              <Controller
                name={`addresses.${index}.street`}
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Street"
                    error={!!errors.addresses?.[index]?.street}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }} component="div">
              <Controller
                name={`addresses.${index}.city`}
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="City"
                    error={!!errors.addresses?.[index]?.city}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }} component="div">
              <Controller
                name={`addresses.${index}.zipCode`}
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Zip Code"
                    error={!!errors.addresses?.[index]?.zipCode}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 1 }} component="div">
              <IconButton color="error" onClick={() => removeAddress(index)} disabled={addressFields.length === 1}>
                <DeleteIcon />
              </IconButton>
            </Grid>
          </Grid>
        ))}

        <Divider sx={{ my: 4 }} />

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h5" fontWeight={700} sx={{ color: "#4834D4" }}>
            Employment History
          </Typography>
          <IconButton color="primary" onClick={() => appendEmployment({ company: "", position: "", startDate: "" })}>
            <AddIcon />
          </IconButton>
        </Box>
        {employmentFields.map((item, index) => (
          <Grid container spacing={2} key={item.id} sx={{ mb: 2, alignItems: "center" }} component="div">
            <Grid size={{ xs: 12, sm: 4 }} component="div">
              <Controller
                name={`employmentHistory.${index}.company`}
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Company"
                    error={!!errors.employmentHistory?.[index]?.company}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }} component="div">
              <Controller
                name={`employmentHistory.${index}.position`}
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Position"
                    error={!!errors.employmentHistory?.[index]?.position}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }} component="div">
              <Controller
                name={`employmentHistory.${index}.startDate`}
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Start Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.employmentHistory?.[index]?.startDate}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 1 }} component="div">
              <IconButton color="error" onClick={() => removeEmployment(index)} disabled={employmentFields.length === 1}>
                <DeleteIcon />
              </IconButton>
            </Grid>
          </Grid>
        ))}

        <Box sx={{ mt: 4, display: "flex", flexDirection: "column", gap: 2 }}>
          {serverError && (
            <Typography color="error" textAlign="center">
              {serverError}
            </Typography>
          )}
          {success && (
            <Typography color="success.main" textAlign="center" fontWeight={600}>
              ✅ Registration Successful!
            </Typography>
          )}
          <SubmitButton
            loading={isSubmitting}
            fullWidth
            label="Register Profile"
          />
        </Box>
      </Paper>
    </Box>
  );
}
