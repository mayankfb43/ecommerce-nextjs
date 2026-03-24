"use client";

import AdminLayout from "@/components/templates/AdminLayout";
import AdminProductManager from "@/components/organisms/AdminProductManager";

export default function AdminProductsPage() {
  return (
    <AdminLayout>
      <AdminProductManager />
    </AdminLayout>
  );
}
