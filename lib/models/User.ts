import mongoose, { Schema, Document, Model } from "mongoose";
import { getPermissionsForRole } from "@/lib/permissions";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "guest" | "customer" | "admin";
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["guest", "customer", "admin"], default: "customer" },
    permissions: { type: [String], default: [] },
  },
  { timestamps: true }
);

// Assign default permissions based on role if not explicitly set
UserSchema.pre("save", function () {
  if (this.isNew && this.permissions.length === 0) {
    this.permissions = getPermissionsForRole(this.role);
  }
});

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
