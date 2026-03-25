import dbConnect from "@/lib/db";
import Order from "@/lib/models/Order";
import { getSession } from "@/lib/session";
import { unauthorizedResponse, forbiddenResponse, requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import type { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/orders/[id]">
) {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    const { id } = await ctx.params;
    await dbConnect();

    const order = await Order.findById(id).lean();
    if (!order) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }

    if (session.role !== "admin" && order.userId !== session.userId) {
      return forbiddenResponse();
    }

    return Response.json({ ...order, _id: String(order._id) });
  } catch (error) {
    console.error("Get order error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  ctx: RouteContext<"/api/orders/[id]">
) {
  try {
    const denied = await requirePermission(PERMISSIONS.ORDER_UPDATE_STATUS);
    if (denied) return denied;

    const { id } = await ctx.params;
    const { status } = await request.json();

    if (!status) {
      return Response.json({ error: "Status is required" }, { status: 400 });
    }

    await dbConnect();
    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).lean();

    if (!order) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }

    return Response.json({ ...order, _id: String(order._id) });
  } catch (error) {
    console.error("Update order error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
