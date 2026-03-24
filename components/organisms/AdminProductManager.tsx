"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Chip from "@mui/material/Chip";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  Product,
} from "@/features/products/productApi";

interface ProductForm {
  name: string;
  description: string;
  price: string;
  stock: string;
  image: string;
  category: string;
}

const emptyForm: ProductForm = {
  name: "",
  description: "",
  price: "",
  stock: "",
  image: "",
  category: "",
};

export default function AdminProductManager() {
  const { data: products, isLoading } = useGetProductsQuery({});
  const [createProduct, { isLoading: creating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [error, setError] = useState("");

  const handleOpen = (product?: Product) => {
    if (product) {
      setEditingId(product._id);
      setForm({
        name: product.name,
        description: product.description,
        price: String(product.price),
        stock: String(product.stock),
        image: product.image,
        category: product.category,
      });
    } else {
      setEditingId(null);
      setForm(emptyForm);
    }
    setError("");
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  };

  const handleSubmit = async () => {
    try {
      setError("");
      const data = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        image: form.image,
        category: form.category,
      };

      if (editingId) {
        await updateProduct({ id: editingId, data }).unwrap();
      } else {
        await createProduct(data).unwrap();
      }
      handleClose();
    } catch {
      setError("Failed to save product");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      await deleteProduct(id);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Products ({products?.length || 0})
        </Typography>
        <Button
          variant="contained"
          gradient
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Product
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "background.default" }}>
              <TableCell sx={{ fontWeight: 700 }}>Image</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Price</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Stock</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products?.map((product) => (
              <TableRow key={product._id} hover>
                <TableCell>
                  <Box
                    component="img"
                    src={product.image}
                    alt={product.name}
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: 1,
                      objectFit: "cover",
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Typography fontWeight={600}>{product.name}</Typography>
                </TableCell>
                <TableCell>
                  <Chip label={product.category} size="small" color="secondary" />
                </TableCell>
                <TableCell>${product.price.toFixed(2)}</TableCell>
                <TableCell>
                  <Chip
                    label={product.stock}
                    size="small"
                    color={product.stock > 5 ? "success" : product.stock > 0 ? "warning" : "error"}
                  />
                </TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleOpen(product)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(product._id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>
          {editingId ? "Edit Product" : "Add New Product"}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <Input
              label="Product Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <Input
              label="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              multiline
              rows={3}
              required
            />
            <Box sx={{ display: "flex", gap: 2 }}>
              <Input
                label="Price"
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
              />
              <Input
                label="Stock"
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                required
              />
            </Box>
            <Input
              label="Image URL"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              required
            />
            <Input
              label="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            variant="contained"
            gradient
            onClick={handleSubmit}
            disabled={creating || updating}
          >
            {creating || updating ? (
              <CircularProgress size={20} color="inherit" />
            ) : editingId ? (
              "Update"
            ) : (
              "Create"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
