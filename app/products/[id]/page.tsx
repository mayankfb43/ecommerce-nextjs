"use client";

import { use } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import ShopLayout from "@/components/templates/ShopLayout";
import Button from "@/components/atoms/Button";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useGetProductQuery } from "@/features/products/productApi";
import { useAppDispatch } from "@/store/hooks";
import { addToCart } from "@/features/cart/cartSlice";
import { useRouter } from "next/navigation";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: product, isLoading, error } = useGetProductQuery(id);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleAddToCart = () => {
    if (!product) return;
    dispatch(
      addToCart({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image,
        stock: product.stock,
      })
    );
  };

  return (
    <ShopLayout>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.back()}
        sx={{ mb: 3 }}
      >
        Back
      </Button>

      {isLoading && (
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton variant="rounded" height={400} sx={{ borderRadius: 4 }} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton variant="text" height={50} />
            <Skeleton variant="text" height={30} width="60%" />
            <Skeleton variant="text" height={100} />
          </Grid>
        </Grid>
      )}

      {error && (
        <Alert severity="error">Failed to load product.</Alert>
      )}

      {product && (
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              component="img"
              src={product.image}
              alt={product.name}
              sx={{
                width: "100%",
                borderRadius: 4,
                objectFit: "cover",
                maxHeight: 500,
                boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Chip
              label={product.category}
              color="secondary"
              sx={{ mb: 2, fontWeight: 600 }}
            />
            <Typography variant="h3" fontWeight={700} gutterBottom>
              {product.name}
            </Typography>
            <Typography
              variant="h3"
              color="primary"
              fontWeight={800}
              sx={{ mb: 3 }}
            >
              ${product.price.toFixed(2)}
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 3, lineHeight: 1.8 }}
            >
              {product.description}
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
              <Chip
                label={product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                color={product.stock > 5 ? "success" : product.stock > 0 ? "warning" : "error"}
                variant="outlined"
              />
            </Box>

            <Button
              variant="contained"
              size="large"
              gradient
              startIcon={<ShoppingCartIcon />}
              disabled={product.stock === 0}
              onClick={handleAddToCart}
              sx={{ px: 5, py: 1.5 }}
            >
              {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </Button>
          </Grid>
        </Grid>
      )}
    </ShopLayout>
  );
}
