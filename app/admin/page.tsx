"use client";

import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import InventoryIcon from "@mui/icons-material/Inventory";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PeopleIcon from "@mui/icons-material/People";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AdminLayout from "@/components/templates/AdminLayout";
import { useGetProductsQuery } from "@/features/products/productApi";
import { useGetOrdersQuery } from "@/features/orders/orderApi";

const StatCard = ({
  icon,
  title,
  value,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  color: string;
}) => (
  <Paper
    sx={{
      p: 3,
      borderRadius: 3,
      display: "flex",
      alignItems: "center",
      gap: 2,
      boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    }}
  >
    <Box
      sx={{
        width: 56,
        height: 56,
        borderRadius: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: `${color}15`,
        color: color,
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
      <Typography variant="h4" fontWeight={700}>
        {value}
      </Typography>
    </Box>
  </Paper>
);

export default function AdminDashboard() {
  const { data: products } = useGetProductsQuery({});
  const { data: orders } = useGetOrdersQuery();

  const totalRevenue = orders
    ? orders.reduce((sum, o) => sum + o.totalAmount, 0)
    : 0;

  return (
    <AdminLayout>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Welcome back, Admin! Here&apos;s your store overview.
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            icon={<InventoryIcon sx={{ fontSize: 28 }} />}
            title="Total Products"
            value={products?.length || 0}
            color="#6C5CE7"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            icon={<ReceiptLongIcon sx={{ fontSize: 28 }} />}
            title="Total Orders"
            value={orders?.length || 0}
            color="#00CEC9"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            icon={<TrendingUpIcon sx={{ fontSize: 28 }} />}
            title="Revenue"
            value={`$${totalRevenue.toFixed(2)}`}
            color="#00B894"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            icon={<PeopleIcon sx={{ fontSize: 28 }} />}
            title="Customers"
            value="—"
            color="#E17055"
          />
        </Grid>
      </Grid>
    </AdminLayout>
  );
}
