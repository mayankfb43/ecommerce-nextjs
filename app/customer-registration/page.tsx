import { Container, Box, Typography } from "@mui/material";
import CustomerForm from "@/components/organisms/CustomerForm";

export default function RegisterPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #F5F7FA 0%, #C3CFE2 100%)",
        py: 8,
      }}
    >
      <Container maxWidth="md">
        <Typography
          variant="h3"
          fontWeight={800}
          textAlign="center"
          gutterBottom
          sx={{
            background: "linear-gradient(90deg, #6C5CE7, #A29BFE)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 4,
          }}
        >
          Customer Registration
        </Typography>
        <Typography
          variant="body1"
          textAlign="center"
          color="text.secondary"
          sx={{ mb: 6 }}
        >
          Build your professional profile and join our ecosystem.
        </Typography>
        <CustomerForm />
      </Container>
    </Box>
  );
}
