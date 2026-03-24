"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAppDispatch } from "@/store/hooks";
import { updateQuantity, removeFromCart } from "@/features/cart/cartSlice";

interface CartItemProps {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  stock: number;
}

export default function CartItem({
  productId,
  name,
  price,
  quantity,
  image,
  stock,
}: CartItemProps) {
  const dispatch = useAppDispatch();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        py: 2,
        px: 2,
        borderRadius: 2,
        bgcolor: "background.paper",
        boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
        mb: 2,
      }}
    >
      <Box
        component="img"
        src={image}
        alt={name}
        sx={{
          width: 80,
          height: 80,
          borderRadius: 2,
          objectFit: "cover",
        }}
      />
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography variant="subtitle1" fontWeight={600} noWrap>
          {name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          ${price.toFixed(2)} each
        </Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton
          size="small"
          onClick={() =>
            dispatch(updateQuantity({ productId, quantity: quantity - 1 }))
          }
          disabled={quantity <= 1}
        >
          <RemoveIcon fontSize="small" />
        </IconButton>
        <Typography fontWeight={600} sx={{ minWidth: 24, textAlign: "center" }}>
          {quantity}
        </Typography>
        <IconButton
          size="small"
          onClick={() =>
            dispatch(updateQuantity({ productId, quantity: quantity + 1 }))
          }
          disabled={quantity >= stock}
        >
          <AddIcon fontSize="small" />
        </IconButton>
      </Box>
      <Typography
        variant="subtitle1"
        fontWeight={700}
        color="primary"
        sx={{ minWidth: 80, textAlign: "right" }}
      >
        ${(price * quantity).toFixed(2)}
      </Typography>
      <IconButton
        color="error"
        onClick={() => dispatch(removeFromCart(productId))}
      >
        <DeleteIcon />
      </IconButton>
    </Box>
  );
}
