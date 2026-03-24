"use client";

import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import AdminLayout from "@/components/templates/AdminLayout";
import {
  useGetOrdersQuery,
  useUpdateOrderStatusMutation,
} from "@/features/orders/orderApi";

const statusColors: Record<string, "default" | "info" | "warning" | "success" | "error"> = {
  pending: "warning",
  processing: "info",
  shipped: "info",
  delivered: "success",
  cancelled: "error",
};

export default function AdminOrdersPage() {
  const { data: orders, isLoading } = useGetOrdersQuery();
  const [updateStatus] = useUpdateOrderStatusMutation();

  const handleStatusChange = async (orderId: string, status: string) => {
    await updateStatus({ id: orderId, status });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Orders ({orders?.length || 0})
      </Typography>

      <TableContainer component={Paper} sx={{ borderRadius: 3, mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "background.default" }}>
              <TableCell sx={{ fontWeight: 700 }}>Order ID</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Items</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders?.map((order) => (
              <TableRow key={order._id} hover>
                <TableCell>
                  <Typography variant="body2" fontFamily="monospace">
                    {order._id.slice(-8)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{order.userId.slice(-8)}</Typography>
                </TableCell>
                <TableCell>
                  <Chip label={`${order.items.length} items`} size="small" />
                </TableCell>
                <TableCell>
                  <Typography fontWeight={700} color="primary">
                    ${order.totalAmount.toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Select
                    size="small"
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(order._id, e.target.value)
                    }
                    sx={{ minWidth: 130 }}
                    renderValue={(val) => (
                      <Chip
                        label={val}
                        size="small"
                        color={statusColors[val] || "default"}
                        sx={{ textTransform: "capitalize" }}
                      />
                    )}
                  >
                    {["pending", "processing", "shipped", "delivered", "cancelled"].map(
                      (s) => (
                        <MenuItem key={s} value={s} sx={{ textTransform: "capitalize" }}>
                          {s}
                        </MenuItem>
                      )
                    )}
                  </Select>
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
    </AdminLayout>
  );
}
