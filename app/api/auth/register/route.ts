import dbConnect from "@/lib/db";
import User from "@/lib/models/User";
import { createSession } from "@/lib/session";
import { getPermissionsForRole } from "@/lib/permissions";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return Response.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return Response.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    await dbConnect();

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return Response.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const permissions = getPermissionsForRole("customer");
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "customer",
      permissions,
    });

    await createSession(String(user._id), user.role, permissions);

    return Response.json(
      {
        user: {
          _id: String(user._id),
          name: user.name,
          email: user.email,
          role: user.role,
          permissions: user.permissions,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
