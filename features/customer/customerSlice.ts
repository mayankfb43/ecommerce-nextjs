import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Address {
  type: string;
  street: string;
  city: string;
  zipCode: string;
}

interface Employment {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
}

interface CustomerState {
  step: number;
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    gender: "male" | "female" | "other";
    interests: string[];
    addresses: Address[];
    employmentHistory: Employment[];
  };
}

const initialState: CustomerState = {
  step: 0,
  formData: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "male",
    interests: [],
    addresses: [{ type: "Home", street: "", city: "", zipCode: "" }],
    employmentHistory: [{ company: "", position: "", startDate: "" }],
  },
};

// Simple helper to load state from localstorage
const loadFromLocalStorage = (): CustomerState | undefined => {
  if (typeof window === "undefined") return undefined;
  try {
    const serializedState = localStorage.getItem("customer_registration_state");
    if (serializedState === null) return undefined;
    return JSON.parse(serializedState);
  } catch (err) {
    return undefined;
  }
};

const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {
    hydrate: (state) => {
      const persisted = loadFromLocalStorage();
      if (persisted) {
        state.step = persisted.step;
        state.formData = persisted.formData;
      }
    },
    updateStep: (state, action: PayloadAction<number>) => {
      state.step = action.payload;
      localStorage.setItem("customer_registration_state", JSON.stringify(state));
    },
    updateFormData: (state, action: PayloadAction<Partial<CustomerState["formData"]>>) => {
      state.formData = { ...state.formData, ...action.payload };
      localStorage.setItem("customer_registration_state", JSON.stringify(state));
    },
    resetForm: (state) => {
      state.step = 0;
      state.formData = initialState.formData;
      localStorage.removeItem("customer_registration_state");
    },
  },
});

export const { hydrate, updateStep, updateFormData, resetForm } = customerSlice.actions;
export default customerSlice.reducer;
