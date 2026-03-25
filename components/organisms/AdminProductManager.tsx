"use client";

import { useState, useEffect } from "react";
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
import { useAppSelector } from "@/store/hooks";
import { PERMISSIONS } from "@/lib/permissions";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import TablePagination from "@mui/material/TablePagination";
import TableSortLabel from "@mui/material/TableSortLabel";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";

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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL Params State
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const search = searchParams.get("search") || "";
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || "desc";

  const { data, isLoading } = useGetProductsQuery({
    page,
    limit,
    search,
    sortBy,
    sortOrder,
  });

  const [createProduct, { isLoading: creating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [error, setError] = useState("");
  const { user } = useAppSelector((state) => state.auth);

  // Local Search State (for debouncing)
  const [localSearch, setLocalSearch] = useState(search);

  // Debounced search effect: Update URL only after 500ms of inactivity
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== search) {
        updateUrl({ search: localSearch, page: 1 });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearch, search]);

  // Sync local search with URL param if it changes (e.g., on clear or browser navigation)
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  const products = data?.products || [];
  const totalItems = data?.total || 0;

  // Permission checks
  const permissions = user?.permissions ?? [];
  const canCreate = permissions.includes(PERMISSIONS.PRODUCT_CREATE);
  const canUpdate = permissions.includes(PERMISSIONS.PRODUCT_UPDATE);
  const canDelete = permissions.includes(PERMISSIONS.PRODUCT_DELETE);

  const updateUrl = (newParams: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePageChange = (_: any, newPage: number) => {
    updateUrl({ page: newPage + 1 });
  };

  const handleLimitChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateUrl({ limit: event.target.value, page: 1 });
  };

  const handleSort = (field: string) => {
    const isAsc = sortBy === field && sortOrder === "asc";
    updateUrl({
      sortBy: field,
      sortOrder: isAsc ? "desc" : "asc",
      page: 1,
    });
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearch(event.target.value);
  };

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
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3, gap: 2, alignItems: "center" }}>
        <Typography variant="h5" fontWeight={700} sx={{ minWidth: "fit-content" }}>
          Products ({totalItems})
        </Typography>
        
        <Box sx={{ display: "flex", gap: 2, flexGrow: 1, justifyContent: "flex-end" }}>
          <Input
            placeholder="Search products..."
            size="small"
            value={localSearch}
            onChange={handleSearchChange}
            sx={{ maxWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          {canCreate && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpen()}
            >
              Add Product
            </Button>
          )}
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "background.default" }}>
              <TableCell sx={{ fontWeight: 700 }}>Image</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                <TableSortLabel
                  active={sortBy === "name"}
                  direction={sortBy === "name" ? sortOrder : "asc"}
                  onClick={() => handleSort("name")}
                >
                  Name
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                <TableSortLabel
                  active={sortBy === "category"}
                  direction={sortBy === "category" ? sortOrder : "asc"}
                  onClick={() => handleSort("category")}
                >
                  Category
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                <TableSortLabel
                  active={sortBy === "price"}
                  direction={sortBy === "price" ? sortOrder : "asc"}
                  onClick={() => handleSort("price")}
                >
                  Price
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                <TableSortLabel
                  active={sortBy === "stock"}
                  direction={sortBy === "stock" ? sortOrder : "asc"}
                  onClick={() => handleSort("stock")}
                >
                  Stock
                </TableSortLabel>
              </TableCell>
              {(canUpdate || canDelete) && (
                <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
              )}
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
                {(canUpdate || canDelete) && (
                  <TableCell>
                    {canUpdate && (
                      <IconButton color="primary" onClick={() => handleOpen(product)}>
                        <EditIcon />
                      </IconButton>
                    )}
                    {canDelete && (
                      <IconButton color="error" onClick={() => handleDelete(product._id)}>
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalItems}
          rowsPerPage={limit}
          page={page - 1}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleLimitChange}
        />
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
        {(canCreate || canUpdate) && (
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              variant="contained"
              color="primary"
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
        )}
      </Dialog>
    </Box>
  );
}
