import dbConnect from "@/lib/db";
import Product from "@/lib/models/Product";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import type { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/products/[id]">
) {
  try {
    const { id } = await ctx.params;
    await dbConnect();
    const product = await Product.findById(id).lean();
    if (!product) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }
    return Response.json({ ...product, _id: String(product._id) });
  } catch (error) {
    console.error("Get product error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  ctx: RouteContext<"/api/products/[id]">
) {
  try {
    const denied = await requirePermission(PERMISSIONS.PRODUCT_UPDATE);
    if (denied) return denied;

    const { id } = await ctx.params;
    const body = await request.json();

    await dbConnect();
    const product = await Product.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).lean();

    if (!product) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    return Response.json({ ...product, _id: String(product._id) });
  } catch (error) {
    console.error("Update product error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/products/[id]">
) {
  try {
    const denied = await requirePermission(PERMISSIONS.PRODUCT_DELETE);
    if (denied) return denied;

    const { id } = await ctx.params;

    await dbConnect();
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    return Response.json({ message: "Product deleted" });
  } catch (error) {
    console.error("Delete product error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
