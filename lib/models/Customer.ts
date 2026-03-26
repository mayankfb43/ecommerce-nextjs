import mongoose, { Schema, Document } from "mongoose";

export interface IAddress {
  type: string;
  street: string;
  city: string;
  zipCode: string;
}

export interface IEmployment {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
}

export interface ICustomer extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  interests: string[];
  addresses: IAddress[];
  employmentHistory: IEmployment[];
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>({
  type: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  zipCode: { type: String, required: true },
});

const EmploymentSchema = new Schema<IEmployment>({
  company: { type: String, required: true },
  position: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String },
});

const CustomerSchema = new Schema<ICustomer>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    gender: { type: String, required: true },
    interests: { type: [String], default: [] },
    addresses: { type: [AddressSchema], default: [] },
    employmentHistory: { type: [EmploymentSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.Customer ||
  mongoose.model<ICustomer>("Customer", CustomerSchema);
