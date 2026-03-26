import dbConnect from "@/lib/db";
import Customer from "@/lib/models/Customer";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();

    const customer = await Customer.create(body);

    return NextResponse.json(
      { message: "Customer registered successfully", customer },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await dbConnect();
    const customers = await Customer.find().sort({ createdAt: -1 });
    return NextResponse.json(customers);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
