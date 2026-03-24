"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import Button from "@/components/atoms/Button";
import ShopLayout from "@/components/templates/ShopLayout";
import ProductList from "@/components/organisms/ProductList";
import StorefrontIcon from "@mui/icons-material/Storefront";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import VerifiedIcon from "@mui/icons-material/Verified";
import { useRouter } from "next/navigation";

const features = [
  {
    icon: <LocalShippingIcon sx={{ fontSize: 40, color: "primary.main" }} />,
    title: "Free Shipping",
    desc: "On orders over $50",
  },
  {
    icon: <SupportAgentIcon sx={{ fontSize: 40, color: "secondary.main" }} />,
    title: "24/7 Support",
    desc: "Always here to help",
  },
  {
    icon: <VerifiedIcon sx={{ fontSize: 40, color: "success.main" }} />,
    title: "Quality Guarantee",
    desc: "Premium products only",
  },
];

export default function HomePage() {
  const router = useRouter();

  return (
    <ShopLayout>
      {/* Hero Section */}
      <Box
        sx={{
          py: { xs: 6, md: 10 },
          textAlign: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: 4,
          color: "#fff",
          mb: 6,
          px: 3,
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
          },
        }}
      >
        <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
          <Chip
            icon={<StorefrontIcon />}
            label="New Collection 2024"
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              color: "#fff",
              fontWeight: 600,
              mb: 3,
              backdropFilter: "blur(10px)",
            }}
          />
          <Typography
            variant="h1"
            fontWeight={800}
            sx={{
              fontSize: { xs: "2.5rem", md: "3.5rem" },
              mb: 2,
              lineHeight: 1.1,
            }}
          >
            Discover Premium
            <br />
            Products
          </Typography>
          <Typography
            variant="h6"
            sx={{ opacity: 0.9, mb: 4, fontWeight: 400 }}
          >
            Shop the latest trends with unbeatable quality and prices
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => router.push("/products")}
            sx={{
              bgcolor: "#fff",
              color: "#6C5CE7",
              fontWeight: 700,
              px: 5,
              py: 1.5,
              fontSize: "1.1rem",
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.9)",
                boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
              },
            }}
          >
            Shop Now
          </Button>
        </Container>
      </Box>

      {/* Features */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {features.map((f) => (
          <Grid size={{ xs: 12, md: 4 }} key={f.title}>
            <Box
              sx={{
                textAlign: "center",
                p: 4,
                borderRadius: 3,
                bgcolor: "background.paper",
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                transition: "transform 0.2s",
                "&:hover": { transform: "translateY(-4px)" },
              }}
            >
              {f.icon}
              <Typography variant="h6" fontWeight={700} sx={{ mt: 2 }}>
                {f.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {f.desc}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Featured Products */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Featured Products
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Handpicked just for you
        </Typography>
        <ProductList />
      </Box>
    </ShopLayout>
  );
}
