import dbConnect from "@/lib/db";
import Order from "@/lib/models/Order";
import { getSession } from "@/lib/session";
import { unauthorizedResponse } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();
    await dbConnect();

    const filter =
      session.role === "admin" ? {} : { userId: session.userId };
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return Response.json(
      orders.map((o) => ({ ...o, _id: String(o._id) }))
    );
  } catch (error) {
    console.error("Get orders error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    const { items, totalAmount } = await request.json();

    if (!items || !items.length || !totalAmount) {
      return Response.json(
        { error: "Items and totalAmount are required" },
        { status: 400 }
      );
    }

    await dbConnect();
    const order = await Order.create({
      userId: session.userId,
      items,
      totalAmount,
      status: "pending",
    });

    return Response.json(
      { ...order.toObject(), _id: String(order._id) },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create order error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
