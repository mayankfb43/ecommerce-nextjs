"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import CartItemComponent from "@/components/molecules/CartItem";
import Button from "@/components/atoms/Button";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { clearCart } from "@/features/cart/cartSlice";
import { useCreateOrderMutation } from "@/features/orders/orderApi";
import { useRouter } from "next/navigation";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";

export default function CartPanel() {
  const { items, totalAmount } = useAppSelector((state) => state.cart);
  const dispatch = useAppDispatch();
  const [createOrder, { isLoading, error }] = useCreateOrderMutation();
  const router = useRouter();

  const handleCheckout = async () => {
    try {
      const orderItems = items.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      }));

      await createOrder({ items: orderItems, totalAmount }).unwrap();
      dispatch(clearCart());
      router.push("/orders");
    } catch {
      // Error handled by RTK Query
    }
  };

  if (items.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          Your cart is empty
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Add some products to get started!
        </Typography>
        <Button
          variant="contained"
          gradient
          onClick={() => router.push("/products")}
        >
          Browse Products
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to place order. Please login first.
        </Alert>
      )}

      {items.map((item) => (
        <CartItemComponent key={item.productId} {...item} />
      ))}

      <Divider sx={{ my: 3 }} />

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 3,
          borderRadius: 3,
          background: "linear-gradient(135deg, #f8f9fe 0%, #eef0ff 100%)",
        }}
      >
        <Box>
          <Typography variant="body2" color="text.secondary">
            Total ({items.length} items)
          </Typography>
          <Typography variant="h4" fontWeight={700} color="primary">
            ${totalAmount.toFixed(2)}
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="large"
          gradient
          startIcon={
            isLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <ShoppingCartCheckoutIcon />
            )
          }
          disabled={isLoading}
          onClick={handleCheckout}
        >
          {isLoading ? "Placing Order..." : "Place Order"}
        </Button>
      </Box>
    </Box>
  );
}
