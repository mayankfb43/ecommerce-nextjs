import { deleteSession } from "@/lib/session";

export async function POST() {
  try {
    await deleteSession();
    return Response.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
