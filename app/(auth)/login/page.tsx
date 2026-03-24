"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import ShopLayout from "@/components/templates/ShopLayout";
import AuthForm from "@/components/molecules/AuthForm";
import { useLoginMutation } from "@/features/auth/authApi";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/features/auth/authSlice";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [login, { isLoading }] = useLoginMutation();
  const [error, setError] = useState("");
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleSubmit = async (data: { email: string; password: string }) => {
    try {
      setError("");
      const res = await login(data).unwrap();
      dispatch(setUser(res.user));
      router.push("/products");
    } catch (err: unknown) {
      const apiError = err as { data?: { error?: string } };
      setError(apiError?.data?.error || "Login failed");
    }
  };

  return (
    <ShopLayout>
      <Box sx={{ py: 6 }}>
        <AuthForm
          mode="login"
          onSubmit={handleSubmit}
          error={error}
          isLoading={isLoading}
        />
        <Typography
          variant="body2"
          textAlign="center"
          sx={{ mt: 3 }}
          color="text.secondary"
        >
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            style={{ color: "#6C5CE7", fontWeight: 600 }}
          >
            Sign Up
          </Link>
        </Typography>
      </Box>
    </ShopLayout>
  );
}
