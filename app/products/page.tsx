"use client";

import Typography from "@mui/material/Typography";
import ShopLayout from "@/components/templates/ShopLayout";
import ProductList from "@/components/organisms/ProductList";

export default function ProductsPage() {
  return (
    <ShopLayout>
      <Typography variant="h3" fontWeight={700} gutterBottom>
        All Products
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Browse our complete collection
      </Typography>
      <ProductList />
    </ShopLayout>
  );
}
