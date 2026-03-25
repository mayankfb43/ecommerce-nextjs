import dbConnect from "@/lib/db";
import User from "@/lib/models/User";
import { createSession } from "@/lib/session";
import { getPermissionsForRole } from "@/lib/permissions";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findOne({ email: email.toLowerCase() }).lean();
    if (!user) {
      return Response.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return Response.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Use stored permissions, or fall back to role defaults for legacy users
    const permissions = user.permissions?.length
      ? user.permissions
      : getPermissionsForRole(user.role);

    await createSession(String(user._id), user.role, permissions);

    return Response.json({
      user: {
        _id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        permissions,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
