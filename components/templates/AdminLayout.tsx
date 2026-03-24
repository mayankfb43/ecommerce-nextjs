"use client";

import { useEffect } from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import DashboardIcon from "@mui/icons-material/Dashboard";
import InventoryIcon from "@mui/icons-material/Inventory";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { useGetMeQuery } from "@/features/auth/authApi";

const drawerWidth = 260;

const menuItems = [
  { text: "Dashboard", icon: <DashboardIcon />, href: "/admin" },
  { text: "Products", icon: <InventoryIcon />, href: "/admin/products" },
  { text: "Orders", icon: <ReceiptLongIcon />, href: "/admin/orders" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  useGetMeQuery(undefined);

  useEffect(() => {
    if (isAuthenticated && user?.role !== "admin") {
      router.push("/");
    }
  }, [isAuthenticated, user, router]);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            bgcolor: "#1a1a2e",
            color: "#fff",
            borderRight: "none",
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography
            variant="h5"
            fontWeight={800}
            sx={{
              background: "linear-gradient(135deg, #A29BFE, #6C5CE7)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Admin Panel
          </Typography>
        </Box>
        <List>
          {menuItems.map((item) => (
            <ListItemButton
              key={item.href}
              component={Link}
              href={item.href}
              selected={pathname === item.href}
              sx={{
                mx: 1,
                borderRadius: 2,
                mb: 0.5,
                "&.Mui-selected": {
                  bgcolor: "rgba(108, 92, 231, 0.2)",
                  color: "#A29BFE",
                  "& .MuiListItemIcon-root": { color: "#A29BFE" },
                },
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.05)",
                },
                "& .MuiListItemIcon-root": { color: "rgba(255,255,255,0.6)" },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          ))}
        </List>
        <Box sx={{ flexGrow: 1 }} />
        <List>
          <ListItemButton
            component={Link}
            href="/"
            sx={{
              mx: 1,
              borderRadius: 2,
              mb: 2,
              "&:hover": { bgcolor: "rgba(255,255,255,0.05)" },
              "& .MuiListItemIcon-root": { color: "rgba(255,255,255,0.6)" },
            }}
          >
            <ListItemIcon>
              <ArrowBackIcon />
            </ListItemIcon>
            <ListItemText primary="Back to Shop" />
          </ListItemButton>
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "background.default",
          p: 4,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
