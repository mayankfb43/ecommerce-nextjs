"use client";

import { useState, useEffect } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import ListItemIcon from "@mui/material/ListItemIcon";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import StorefrontIcon from "@mui/icons-material/Storefront";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import LoginIcon from "@mui/icons-material/Login";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { useGetMeQuery, useLogoutMutation } from "@/features/auth/authApi";
import { setUser, clearUser } from "@/features/auth/authSlice";

export default function Navbar() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { items } = useAppSelector((state) => state.cart);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { data } = useGetMeQuery(undefined);
  const [logout] = useLogoutMutation();

  useEffect(() => {
    if (data?.user) {
      dispatch(setUser(data.user));
    }
  }, [data, dispatch]);

  const handleLogout = async () => {
    setAnchorEl(null);
    await logout(undefined);
    dispatch(clearUser());
    router.push("/");
  };

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <AppBar
      position="sticky"
      sx={{
        bgcolor: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(20px)",
        color: "text.primary",
      }}
    >
      <Toolbar sx={{ maxWidth: 1280, width: "100%", mx: "auto" }}>
        <Link
          href="/"
          style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: 8 }}
        >
          <StorefrontIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography
            variant="h5"
            fontWeight={800}
            sx={{
              background: "linear-gradient(135deg, #6C5CE7, #A29BFE)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            ShopVibe
          </Typography>
        </Link>

        <Box sx={{ flexGrow: 1, display: "flex", gap: 3, ml: 4 }}>
          <Link
            href="/products"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <Typography
              variant="body1"
              fontWeight={500}
              sx={{ "&:hover": { color: "primary.main" }, transition: "color 0.2s" }}
            >
              Products
            </Typography>
          </Link>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            onClick={() => router.push("/cart")}
            color="inherit"
            id="cart-button"
          >
            <Badge badgeContent={cartCount} color="primary">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>

          {isAuthenticated ? (
            <>
              <IconButton
                onClick={(e) => setAnchorEl(e.currentTarget)}
                id="user-menu-button"
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: "primary.main",
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                slotProps={{
                  paper: {
                    sx: { minWidth: 200, mt: 1, borderRadius: 2 },
                  },
                }}
              >
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {user?.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user?.email}
                  </Typography>
                </Box>
                <Divider />
                <MenuItem
                  onClick={() => {
                    setAnchorEl(null);
                    router.push("/orders");
                  }}
                >
                  <ListItemIcon>
                    <ReceiptLongIcon fontSize="small" />
                  </ListItemIcon>
                  My Orders
                </MenuItem>
                {user?.role === "admin" && (
                  <MenuItem
                    onClick={() => {
                      setAnchorEl(null);
                      router.push("/admin");
                    }}
                  >
                    <ListItemIcon>
                      <AdminPanelSettingsIcon fontSize="small" />
                    </ListItemIcon>
                    Admin Panel
                  </MenuItem>
                )}
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <IconButton
              onClick={() => router.push("/login")}
              color="inherit"
              id="login-button"
            >
              <LoginIcon />
            </IconButton>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
