"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import ShopLayout from "@/components/templates/ShopLayout";
import { useGetOrdersQuery } from "@/features/orders/orderApi";

const statusColors: Record<string, "default" | "info" | "warning" | "success" | "error"> = {
  pending: "warning",
  processing: "info",
  shipped: "info",
  delivered: "success",
  cancelled: "error",
};

export default function OrdersPage() {
  const { data: orders, isLoading, error } = useGetOrdersQuery();

  return (
    <ShopLayout>
      <Typography variant="h3" fontWeight={700} gutterBottom>
        My Orders
      </Typography>

      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ my: 2 }}>
          Please login to view your orders.
        </Alert>
      )}

      {orders && orders.length === 0 && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h5" color="text.secondary">
            No orders yet
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Start shopping to see your orders here!
          </Typography>
        </Box>
      )}

      {orders && orders.length > 0 && (
        <TableContainer component={Paper} sx={{ borderRadius: 3, mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "background.default" }}>
                <TableCell sx={{ fontWeight: 700 }}>Order ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Items</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order._id} hover>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {order._id.slice(-8)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                      {order.items.map((item, i) => (
                        <Typography key={i} variant="body2">
                          {item.name} × {item.quantity}
                        </Typography>
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={700} color="primary">
                      ${order.totalAmount.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={order.status}
                      size="small"
                      color={statusColors[order.status] || "default"}
                      sx={{ textTransform: "capitalize" }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </ShopLayout>
  );
}
