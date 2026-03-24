"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import CardActions from "@mui/material/CardActions";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import Button from "@/components/atoms/Button";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useAppDispatch } from "@/store/hooks";
import { addToCart } from "@/features/cart/cartSlice";
import { useRouter } from "next/navigation";

interface ProductCardProps {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  category: string;
}

export default function ProductCard({
  _id,
  name,
  description,
  price,
  stock,
  image,
  category,
}: ProductCardProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(
      addToCart({
        productId: _id,
        name,
        price,
        quantity: 1,
        image,
        stock,
      })
    );
  };

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        position: "relative",
        overflow: "visible",
      }}
      onClick={() => router.push(`/products/${_id}`)}
    >
      <Box sx={{ position: "relative" }}>
        <CardMedia
          component="img"
          height="220"
          image={image}
          alt={name}
          sx={{ objectFit: "cover" }}
        />
        <Chip
          label={category}
          size="small"
          color="secondary"
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            fontWeight: 600,
          }}
        />
      </Box>
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Typography variant="h6" gutterBottom noWrap>
          {name}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            mb: 1,
          }}
        >
          {description}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
          <Typography
            variant="h5"
            color="primary"
            fontWeight={700}
          >
            ${price.toFixed(2)}
          </Typography>
          {stock <= 5 && stock > 0 && (
            <Chip
              label={`Only ${stock} left`}
              size="small"
              color="warning"
              variant="outlined"
            />
          )}
          {stock === 0 && (
            <Chip label="Out of stock" size="small" color="error" />
          )}
        </Box>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button
          gradient
          fullWidth
          startIcon={<ShoppingCartIcon />}
          disabled={stock === 0}
          onClick={handleAddToCart}
        >
          {stock === 0 ? "Out of Stock" : "Add to Cart"}
        </Button>
      </CardActions>
    </Card>
  );
}
