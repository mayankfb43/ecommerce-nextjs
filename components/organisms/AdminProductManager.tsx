"use client";

import { useState, useEffect, useMemo, useCallback, startTransition, useRef } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
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
import Avatar from "@mui/material/Avatar";
import SearchIcon from "@mui/icons-material/Search";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridPaginationModel,
  GridSortModel,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarExport,
  GridToolbarDensitySelector,
  GridToolbarQuickFilter,
  GridFilterModel,
} from "@mui/x-data-grid";
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

function CustomToolbar() {
  return (
    <GridToolbarContainer sx={{ p: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <Box sx={{ display: "flex", gap: 1 }}>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />
        <GridToolbarExport />
      </Box>
      <Box sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        width: 320,
        bgcolor: "background.paper",
        borderRadius: 2,
        px: 1.5,
        py: 0.5,
        border: 1,
        borderColor: "divider",
        boxShadow: 1,
        "& .MuiInput-root": { width: '100%' },
        "& .MuiInput-underline:before, & .MuiInput-underline:after": { display: "none" },
      }}>
        <SearchIcon fontSize="small" color="action" />
        <GridToolbarQuickFilter />
      </Box>
    </GridToolbarContainer>
  );
}

export default function AdminProductManager() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL Params State
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const search = searchParams.get("search") || "";
  const name = searchParams.get("name") || "";
  const category = searchParams.get("category") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const minStock = searchParams.get("minStock") || "";
  const maxStock = searchParams.get("maxStock") || "";
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || "desc";

  const { data, isLoading } = useGetProductsQuery({
    page,
    limit,
    search,
    category,
    name,
    minPrice: minPrice ? parseFloat(minPrice) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    minStock: minStock ? parseInt(minStock) : undefined,
    maxStock: maxStock ? parseInt(maxStock) : undefined,
    sortBy,
    sortOrder,
  }, {
    refetchOnFocus: true,
    refetchOnReconnect: true,
    pollingInterval: 60000,
  });

  const [createProduct, { isLoading: creating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [error, setError] = useState("");
  const { user } = useAppSelector((state) => state.auth);

  const permissions = user?.permissions ?? [];
  const canCreate = permissions.includes(PERMISSIONS.PRODUCT_CREATE);
  const canUpdate = permissions.includes(PERMISSIONS.PRODUCT_UPDATE);
  const canDelete = permissions.includes(PERMISSIONS.PRODUCT_DELETE);

  const updateUrl = useCallback((newParams: Record<string, string | number | null>) => {
    if (!isMounted.current) return;

    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    if (params.toString() === searchParams.toString()) return;

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }, [searchParams, router, pathname]);

  const products = data?.products || [];
  const totalItems = data?.total || 0;

  const paginationModel = useMemo(() => ({
    page: page - 1,
    pageSize: limit,
  }), [page, limit]);

  const sortModel: GridSortModel = useMemo(() => [
    { field: sortBy, sort: sortOrder },
  ], [sortBy, sortOrder]);

  const filterModel: GridFilterModel = useMemo(() => {
    const items: (import("@mui/x-data-grid").GridFilterItem)[] = [];
    if (name) items.push({ field: "name", operator: "contains", value: name, id: 1 });
    if (category) items.push({ field: "category", operator: "equals", value: category, id: 2 });
    if (minPrice) items.push({ field: "price", operator: ">=", value: minPrice, id: 3 });
    if (maxPrice) items.push({ field: "price", operator: "<=", value: maxPrice, id: 4 });
    if (minStock) items.push({ field: "stock", operator: ">=", value: minStock, id: 5 });
    if (maxStock) items.push({ field: "stock", operator: "<=", value: maxStock, id: 6 });

    return {
      items,
      quickFilterValues: search ? search.split(" ") : [],
    };
  }, [search, name, category, minPrice, maxPrice, minStock, maxStock]);

  const handlePaginationModelChange = (model: GridPaginationModel) => {
    if (model.page + 1 === page && model.pageSize === limit) return;
    updateUrl({
      page: model.page + 1,
      limit: model.pageSize,
    });
  };

  const handleSortModelChange = (model: GridSortModel) => {
    const newSortBy = model[0]?.field || "createdAt";
    const newSortOrder = model[0]?.sort || "desc";

    if (newSortBy === sortBy && newSortOrder === sortOrder) return;

    updateUrl({
      sortBy: newSortBy,
      sortOrder: newSortOrder,
      page: 1,
    });
  };

  const handleFilterModelChange = (model: GridFilterModel) => {
    const quickSearch = model.quickFilterValues?.filter((v) => !!v).join(" ") || "";
    
    const params: Record<string, string | number | null> = {
      search: quickSearch,
      name: null,
      category: null,
      minPrice: null,
      maxPrice: null,
      minStock: null,
      maxStock: null,
      page: 1,
    };

    model.items.forEach((item) => {
      if (item.value === undefined || item.value === null || item.value === "") return;
      const val = String(item.value);
      const op = item.operator;

      if (item.field === "name") params.name = val;
      if (item.field === "category") params.category = val;
      
      if (item.field === "price") {
        if (op === ">" || op === ">=") params.minPrice = val;
        else if (op === "<" || op === "<=") params.maxPrice = val;
        else if (op === "=") {
          params.minPrice = val;
          params.maxPrice = val;
        }
      }
      
      if (item.field === "stock") {
        if (op === ">" || op === ">=") params.minStock = val;
        else if (op === "<" || op === "<=") params.maxStock = val;
        else if (op === "=") {
          params.minStock = val;
          params.maxStock = val;
        }
      }
    });

    updateUrl(params);
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

  const columns: GridColDef[] = [
    {
      field: "image",
      headerName: "Image",
      width: 80,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Avatar
            variant="rounded"
            src={params.value as string}
            alt={params.row.name}
            sx={{ width: 45, height: 45 }}
          />
        </Box>
      ),
    },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "category",
      headerName: "Category",
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Chip label={params.value} size="small" color="secondary" />
      ),
    },
    {
      field: "price",
      headerName: "Price",
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          ${(params.value as number).toFixed(2)}
        </Typography>
      ),
    },
    {
      field: "stock",
      headerName: "Stock",
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value > 5 ? "success" : params.value > 0 ? "warning" : "error"}
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          {canUpdate && (
            <IconButton color="primary" onClick={() => handleOpen(params.row as Product)}>
              <EditIcon />
            </IconButton>
          )}
          {canDelete && (
            <IconButton color="error" onClick={() => handleDelete(params.row._id)}>
              <DeleteIcon />
            </IconButton>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3, gap: 2, alignItems: "center" }}>
        <Typography variant="h5" fontWeight={700} sx={{ minWidth: "fit-content" }}>
          Products ({totalItems})
        </Typography>

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

      <Paper sx={{ height: 650, width: "100%", borderRadius: 3, overflow: "hidden" }}>
        <DataGrid
          rows={products}
          columns={columns}
          getRowId={(row) => row._id}
          loading={isLoading}
          slots={{ toolbar: CustomToolbar }}
          filterModel={filterModel}
          onFilterModelChange={handleFilterModelChange}
          paginationMode="server"
          sortingMode="server"
          rowCount={totalItems}
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationModelChange}
          sortModel={sortModel}
          onSortModelChange={handleSortModelChange}
          pageSizeOptions={[5, 10, 25]}
          disableRowSelectionOnClick
          sx={{
            border: "none",
            "& .MuiDataGrid-columnHeaders": {
              bgcolor: "background.default",
              borderBottom: "1px solid",
              borderColor: "divider",
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "1px solid",
              borderColor: "divider",
            },
            "& .MuiDataGrid-cell:focus": {
              outline: "none",
            },
            "& .MuiDataGrid-row:hover": {
              bgcolor: "action.hover",
            },
          }}
        />
      </Paper>

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
