"use client";

import Typography from "@mui/material/Typography";
import ShopLayout from "@/components/templates/ShopLayout";
import CartPanel from "@/components/organisms/CartPanel";

export default function CartPage() {
  return (
    <ShopLayout>
      <Typography variant="h3" fontWeight={700} gutterBottom>
        Shopping Cart
      </Typography>
      <CartPanel />
    </ShopLayout>
  );
}
