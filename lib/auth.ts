import "server-only";
import { getSession } from "./session";
import dbConnect from "./db";
import User from "./models/User";

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  await dbConnect();
  const user = await User.findById(session.userId).select("-password").lean();
  if (!user) return null;

  return {
    _id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== "admin") {
    throw new Error("Forbidden");
  }
  return user;
}

export function unauthorizedResponse() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

export function forbiddenResponse() {
  return Response.json({ error: "Forbidden" }, { status: 403 });
}
