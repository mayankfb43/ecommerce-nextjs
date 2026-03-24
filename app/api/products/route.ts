import dbConnect from "@/lib/db";
import Product from "@/lib/models/Product";
import { getSession } from "@/lib/session";
import { forbiddenResponse, unauthorizedResponse } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const filter = category ? { category } : {};
    const products = await Product.find(filter).sort({ createdAt: -1 }).lean();

    return Response.json(
      products.map((p) => ({ ...p, _id: String(p._id) }))
    );
  } catch (error) {
    console.error("Get products error:", error);
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
    if (session.role !== "admin") return forbiddenResponse();

    const body = await request.json();
    const { name, description, price, stock, image, category } = body;

    if (!name || !description || price == null || stock == null || !image || !category) {
      return Response.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    await dbConnect();
    const product = await Product.create({
      name,
      description,
      price,
      stock,
      image,
      category,
    });

    return Response.json(
      { ...product.toObject(), _id: String(product._id) },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create product error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
