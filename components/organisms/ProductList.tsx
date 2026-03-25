"use client";

import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import ProductCard from "@/components/molecules/ProductCard";
import { useGetProductsQuery } from "@/features/products/productApi";

interface ProductListProps {
  category?: string;
}

export default function ProductList({ category }: ProductListProps) {
  const { data, isLoading, error } = useGetProductsQuery({ category });
  const products = data?.products;

  if (isLoading) {
    return (
      <Grid container spacing={3}>
        {[...Array(8)].map((_, i) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={i}>
            <Skeleton variant="rounded" height={380} sx={{ borderRadius: 4 }} />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        Failed to load products. Please try again later.
      </Alert>
    );
  }

  if (!products?.length) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography variant="h5" color="text.secondary">
          No products found
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {products.map((product) => (
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={product._id}>
          <ProductCard {...product} />
        </Grid>
      ))}
    </Grid>
  );
}
