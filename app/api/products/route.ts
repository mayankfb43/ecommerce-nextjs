import dbConnect from "@/lib/db";
import Product from "@/lib/models/Product";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    
    // 1. Get query parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const category = searchParams.get("category");

    // 2. Build Filter
    const filter: Record<string, unknown> = {};
    if (category) filter.category = category;
    
    const nameFilter = searchParams.get("name");
    if (nameFilter) filter.name = { $regex: nameFilter, $options: "i" };

    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    if (minPrice || maxPrice) {
      const priceFilter: Record<string, number> = {};
      if (minPrice) priceFilter.$gte = parseFloat(minPrice);
      if (maxPrice) priceFilter.$lte = parseFloat(maxPrice);
      filter.price = priceFilter;
    }

    const minStock = searchParams.get("minStock");
    const maxStock = searchParams.get("maxStock");
    if (minStock || maxStock) {
      const stockFilter: Record<string, number> = {};
      if (minStock) stockFilter.$gte = parseInt(minStock);
      if (maxStock) stockFilter.$lte = parseInt(maxStock);
      filter.stock = stockFilter;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    // 3. Build Sorting
    const sort: Record<string, 1 | -1> = {};
    const order = sortOrder === "desc" ? -1 : (1 as const);
    sort[sortBy] = order;

    // 4. Execute Queries
    const skip = (page - 1) * limit;
    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    return Response.json({
      products: products.map((p) => ({ ...p, _id: String(p._id) })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
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
    const denied = await requirePermission(PERMISSIONS.PRODUCT_CREATE);
    if (denied) return denied;

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
