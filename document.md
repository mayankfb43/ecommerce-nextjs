# ShopVibe — E-Commerce Application (Full Project Specification)

> This document contains the COMPLETE source code and architecture for the ShopVibe e-commerce application. Use it as a prompt for Claude Opus (or any LLM) to replicate this project on another machine.

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **UI Library**: MUI 5 (Material UI) + Emotion
- **State Management**: Redux Toolkit + RTK Query
- **Database**: MongoDB + Mongoose 9
- **Authentication**: Stateless JWT (jose) + HttpOnly Cookies
- **Authorization**: Permission-based Access Control (PBAC)
- **Styling**: MUI Theme + Emotion (no Tailwind usage despite config)

## Prerequisites
- Node.js 18+
- MongoDB running locally on `mongodb://localhost:27017`

## Setup Instructions
```bash
npx create-next-app@latest my-app --typescript --app --eslint
cd my-app
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled @emotion/cache @mui/material-nextjs @reduxjs/toolkit react-redux mongoose jose bcryptjs server-only
npm install -D @types/bcryptjs
```

## Environment Variables (.env.local)
```
MONGODB_URI=mongodb://localhost:27017/project_db
SESSION_SECRET=your-super-secret-key-change-this-in-production
```

---

## Project Structure
```
my-app/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── admin/
│   │   ├── orders/page.tsx
│   │   ├── products/page.tsx
│   │   └── page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts
│   │   │   ├── me/route.ts
│   │   │   └── register/route.ts
│   │   ├── orders/
│   │   │   ├── [id]/route.ts
│   │   │   └── route.ts
│   │   └── products/
│   │       ├── [id]/route.ts
│   │       └── route.ts
│   ├── cart/page.tsx
│   ├── orders/page.tsx
│   ├── products/
│   │   ├── [id]/page.tsx
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── Providers.tsx
│   ├── atoms/
│   │   ├── AppTypography.tsx
│   │   ├── Button.tsx
│   │   └── Input.tsx
│   ├── molecules/
│   │   ├── AuthForm.tsx
│   │   ├── CartItem.tsx
│   │   └── ProductCard.tsx
│   ├── organisms/
│   │   ├── AdminProductManager.tsx
│   │   ├── CartPanel.tsx
│   │   ├── Navbar.tsx
│   │   └── ProductList.tsx
│   └── templates/
│       ├── AdminLayout.tsx
│       └── ShopLayout.tsx
├── features/
│   ├── auth/
│   │   ├── authApi.ts
│   │   └── authSlice.ts
│   ├── cart/
│   │   └── cartSlice.ts
│   ├── orders/
│   │   └── orderApi.ts
│   └── products/
│       └── productApi.ts
├── lib/
│   ├── auth.ts
│   ├── db.ts
│   ├── jwt.ts
│   ├── models/
│   │   ├── Order.ts
│   │   ├── Product.ts
│   │   └── User.ts
│   ├── permissions.ts
│   ├── session.ts
│   └── theme/
│       ├── ThemeRegistry.tsx
│       └── theme.ts
├── seed/
│   ├── orders.json
│   ├── products.json
│   ├── users.json
│   └── README.md
├── store/
│   ├── hooks.ts
│   └── store.ts
├── middleware.ts
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## CONFIGURATION FILES

### next.config.ts
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["mongoose"],
};

export default nextConfig;
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts", ".next/dev/types/**/*.ts", "**/*.mts"],
  "exclude": ["node_modules"]
}
```

### eslint.config.mjs
```javascript
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
```

### app/globals.css
```css
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
}
```

---

## LIB — Core Utilities

### lib/db.ts
```typescript
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
```

### lib/jwt.ts
```typescript
import { SignJWT, jwtVerify } from "jose";

const secretKey = process.env.SESSION_SECRET!;
const encodedKey = new TextEncoder().encode(secretKey);

export interface SessionPayload {
  userId: string;
  role: string;
  permissions: string[];
  expiresAt: Date;
}

export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function decrypt(
  session: string | undefined = ""
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
```

### lib/session.ts
```typescript
import "server-only";
import { cookies } from "next/headers";
import { encrypt, decrypt, SessionPayload } from "./jwt";

export type { SessionPayload };

export async function createSession(userId: string, role: string, permissions: string[]) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await encrypt({ userId, role, permissions, expiresAt });
  const cookieStore = await cookies();
  cookieStore.set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) return null;
  return decrypt(session);
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}
```

### lib/permissions.ts
```typescript
// All permission constants
export const PERMISSIONS = {
  PRODUCT_VIEW: "product:view",
  PRODUCT_CREATE: "product:create",
  PRODUCT_UPDATE: "product:update",
  PRODUCT_DELETE: "product:delete",
  ORDER_CREATE: "order:create",
  ORDER_VIEW: "order:view",
  ORDER_UPDATE_STATUS: "order:update_status",
  CART_ADD: "cart:add",
  CART_VIEW: "cart:view",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// Default permissions per role
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  guest: [PERMISSIONS.PRODUCT_VIEW],
  customer: [
    PERMISSIONS.PRODUCT_VIEW,
    PERMISSIONS.ORDER_CREATE,
    PERMISSIONS.ORDER_VIEW,
    PERMISSIONS.CART_ADD,
    PERMISSIONS.CART_VIEW,
  ],
  admin: Object.values(PERMISSIONS),
};

/** Get the default permissions for a given role */
export function getPermissionsForRole(role: string): Permission[] {
  return ROLE_PERMISSIONS[role] ?? ROLE_PERMISSIONS.guest;
}

/** Check whether a permissions array includes the required permission */
export function hasPermission(
  permissions: string[],
  required: Permission
): boolean {
  return permissions.includes(required);
}
```

### lib/auth.ts
```typescript
import "server-only";
import { getSession } from "./session";
import dbConnect from "./db";
import User from "./models/User";
import { getPermissionsForRole, hasPermission, type Permission } from "./permissions";

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  await dbConnect();
  const user = await User.findById(session.userId).select("-password").lean();
  if (!user) return null;

  // Use stored permissions, or fall back to role defaults for legacy users
  const permissions = user.permissions?.length
    ? user.permissions
    : getPermissionsForRole(user.role);

  return {
    _id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    permissions,
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

export async function requirePermission(permission: Permission) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();
  if (!hasPermission(session.permissions ?? [], permission)) {
    return forbiddenResponse();
  }
  return null; // No error — permission granted
}

export function unauthorizedResponse() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

export function forbiddenResponse() {
  return Response.json({ error: "Forbidden" }, { status: 403 });
}
```

---

## LIB — Models

### lib/models/User.ts
```typescript
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
```

### lib/models/Product.ts
```typescript
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    image: { type: String, required: true },
    category: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
```

### lib/models/Order.ts
```typescript
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface IOrder extends Document {
  userId: string;
  items: IOrderItem[];
  totalAmount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: String, required: true, index: true },
    items: { type: [OrderItemSchema], required: true },
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
```

---

## LIB — Theme

### lib/theme/theme.ts
```typescript
"use client";

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#6C5CE7",
      light: "#A29BFE",
      dark: "#4834D4",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#00CEC9",
      light: "#55EFC4",
      dark: "#00B894",
      contrastText: "#FFFFFF",
    },
    error: { main: "#E17055", light: "#FAB1A0", dark: "#D63031" },
    warning: { main: "#FDCB6E", light: "#FFEAA7", dark: "#E17055" },
    success: { main: "#00B894", light: "#55EFC4", dark: "#00896B" },
    background: { default: "#F8F9FE", paper: "#FFFFFF" },
    text: { primary: "#2D3436", secondary: "#636E72" },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: { fontSize: "2.5rem", fontWeight: 700, lineHeight: 1.2 },
    h2: { fontSize: "2rem", fontWeight: 700, lineHeight: 1.3 },
    h3: { fontSize: "1.75rem", fontWeight: 600, lineHeight: 1.3 },
    h4: { fontSize: "1.5rem", fontWeight: 600, lineHeight: 1.4 },
    h5: { fontSize: "1.25rem", fontWeight: 600, lineHeight: 1.4 },
    h6: { fontSize: "1rem", fontWeight: 600, lineHeight: 1.5 },
    body1: { fontSize: "1rem", lineHeight: 1.6 },
    body2: { fontSize: "0.875rem", lineHeight: 1.6 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10, padding: "10px 24px", fontSize: "0.9rem", boxShadow: "none",
          "&:hover": { boxShadow: "0 4px 12px rgba(108, 92, 231, 0.3)" },
        },
        containedPrimary: {
          background: "linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)",
          "&:hover": { background: "linear-gradient(135deg, #4834D4 0%, #6C5CE7 100%)" },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16, boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          "&:hover": { transform: "translateY(-4px)", boxShadow: "0 8px 30px rgba(0,0,0,0.12)" },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: { "& .MuiOutlinedInput-root": { borderRadius: 10 } },
      },
    },
    MuiChip: { styleOverrides: { root: { borderRadius: 8, fontWeight: 500 } } },
    MuiAppBar: { styleOverrides: { root: { boxShadow: "0 1px 10px rgba(0,0,0,0.08)" } } },
  },
});

export default theme;
```

### lib/theme/ThemeRegistry.tsx
```tsx
"use client";

import * as React from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { useServerInsertedHTML } from "next/navigation";
import theme from "./theme";

function createEmotionCache() {
  return createCache({ key: "mui" });
}

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  const [cache] = React.useState(() => {
    const c = createEmotionCache();
    c.compat = true;
    return c;
  });

  useServerInsertedHTML(() => {
    const names = Object.keys(cache.inserted);
    if (names.length === 0) return null;

    let styles = "";
    const dataEmotionAttribute = cache.key;
    const flushed: string[] = [];
    names.forEach((name) => {
      const val = cache.inserted[name];
      if (typeof val === "string") {
        styles += val;
        flushed.push(name);
      }
    });
    flushed.forEach((name) => { delete cache.inserted[name]; });

    return (
      <style
        key={dataEmotionAttribute}
        data-emotion={`${dataEmotionAttribute} ${flushed.join(" ")}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
```

---

## STORE

### store/store.ts
```typescript
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import authReducer from "@/features/auth/authSlice";
import cartReducer from "@/features/cart/cartSlice";
import { authApi } from "@/features/auth/authApi";
import { productApi } from "@/features/products/productApi";
import { orderApi } from "@/features/orders/orderApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    [authApi.reducerPath]: authApi.reducer,
    [productApi.reducerPath]: productApi.reducer,
    [orderApi.reducerPath]: orderApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(productApi.middleware)
      .concat(orderApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### store/hooks.ts
```typescript
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store";

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
```

---

## MIDDLEWARE

### middleware.ts
```typescript
import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/jwt";
import { PERMISSIONS } from "@/lib/permissions";

declare global {
  class URLPattern {
    constructor(input: { pathname: string });
    test(input: { pathname: string }): boolean;
  }
}

const protectedRoutes = [
  new URLPattern({ pathname: "/admin/:path*" }),
  new URLPattern({ pathname: "/orders/:path*" }),
  new URLPattern({ pathname: "/cart/:path*" }),
];
const authRoutes = [
  new URLPattern({ pathname: "/login" }),
  new URLPattern({ pathname: "/register" }),
];

const routePermissions = [
  { pattern: new URLPattern({ pathname: "/admin/:path*" }), permission: PERMISSIONS.PRODUCT_CREATE },
  { pattern: new URLPattern({ pathname: "/orders/:path*" }), permission: PERMISSIONS.ORDER_VIEW },
  { pattern: new URLPattern({ pathname: "/cart/:path*" }), permission: PERMISSIONS.CART_VIEW },
  { pattern: new URLPattern({ pathname: "/products/:id" }), permission: PERMISSIONS.PRODUCT_VIEW },
];

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtectedRoute = protectedRoutes.some((p) => p.test({ pathname }));
  const isAuthRoute = authRoutes.some((p) => p.test({ pathname }));
  const cookie = req.cookies.get("session")?.value;
  const session = await decrypt(cookie);

  if (isProtectedRoute && !session?.userId) {
    const callbackUrl = encodeURIComponent(pathname);
    return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, req.nextUrl));
  }

  if (isAuthRoute && session?.userId) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  if (session) {
    const permissions = session.permissions ?? [];
    const matched = routePermissions.find((rp) => rp.pattern.test({ pathname }));
    if (matched && !permissions.includes(matched.permission)) {
      return NextResponse.redirect(new URL("/", req.nextUrl));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};
```

---

## FEATURES — RTK Query & Redux Slices

### features/auth/authApi.ts
```typescript
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/auth" }),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials: { email: string; password: string }) => ({
        url: "/login", method: "POST", body: credentials,
      }),
      invalidatesTags: ["User"],
    }),
    register: builder.mutation({
      query: (data: { name: string; email: string; password: string }) => ({
        url: "/register", method: "POST", body: data,
      }),
      invalidatesTags: ["User"],
    }),
    getMe: builder.query({
      query: () => "/me",
      providesTags: ["User"],
    }),
    logout: builder.mutation({
      query: () => ({ url: "/logout", method: "POST" }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useGetMeQuery, useLogoutMutation } = authApi;
```

### features/auth/authSlice.ts
```typescript
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = { user: null, isAuthenticated: false };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
```

### features/cart/cartSlice.ts
```typescript
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  stock: number;
}

interface CartState {
  items: CartItem[];
  totalAmount: number;
}

const initialState: CartState = { items: [], totalAmount: 0 };

function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existing = state.items.find((item) => item.productId === action.payload.productId);
      if (existing) {
        existing.quantity = Math.min(existing.quantity + action.payload.quantity, existing.stock);
      } else {
        state.items.push(action.payload);
      }
      state.totalAmount = calculateTotal(state.items);
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.productId !== action.payload);
      state.totalAmount = calculateTotal(state.items);
    },
    updateQuantity: (state, action: PayloadAction<{ productId: string; quantity: number }>) => {
      const item = state.items.find((i) => i.productId === action.payload.productId);
      if (item) {
        item.quantity = Math.max(1, Math.min(action.payload.quantity, item.stock));
      }
      state.totalAmount = calculateTotal(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      state.totalAmount = 0;
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
```

### features/products/productApi.ts
```typescript
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Product {
  _id: string; name: string; description: string; price: number;
  stock: number; image: string; category: string; createdAt: string; updatedAt: string;
}

export interface PaginatedResponse<T> {
  products: T[]; total: number; page: number; limit: number; totalPages: number;
}

export interface ProductQueryParams {
  page?: number; limit?: number; search?: string; sortBy?: string;
  sortOrder?: "asc" | "desc"; category?: string;
}

export const productApi = createApi({
  reducerPath: "productApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/products" }),
  tagTypes: ["Product"],
  endpoints: (builder) => ({
    getProducts: builder.query<PaginatedResponse<Product>, ProductQueryParams>({
      query: (params) => ({ url: "/", params }),
      providesTags: (result) =>
        result
          ? [
            ...result.products.map(({ _id }) => ({ type: "Product" as const, id: _id })),
            { type: "Product", id: "LIST" },
          ]
          : [{ type: "Product", id: "LIST" }],
    }),
    getProduct: builder.query<Product, string>({
      query: (id) => `/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Product", id }],
    }),
    createProduct: builder.mutation<Product, Partial<Product>>({
      query: (body) => ({ url: "/", method: "POST", body }),
      invalidatesTags: [{ type: "Product", id: "LIST" }],
    }),
    updateProduct: builder.mutation<Product, { id: string; data: Partial<Product> }>({
      query: ({ id, data }) => ({ url: `/${id}`, method: "PUT", body: data }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Product", id },
        { type: "Product", id: "LIST" },
      ],
    }),
    deleteProduct: builder.mutation<void, string>({
      query: (id) => ({ url: `/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Product", id: "LIST" }],
    }),
  }),
});

export const {
  useGetProductsQuery, useGetProductQuery, useCreateProductMutation,
  useUpdateProductMutation, useDeleteProductMutation,
} = productApi;
```

### features/orders/orderApi.ts
```typescript
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface OrderItem {
  productId: string; name: string; price: number; quantity: number; image: string;
}

export interface Order {
  _id: string; userId: string; items: OrderItem[]; totalAmount: number;
  status: string; createdAt: string; updatedAt: string;
}

export const orderApi = createApi({
  reducerPath: "orderApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/orders" }),
  tagTypes: ["Order"],
  endpoints: (builder) => ({
    getOrders: builder.query<Order[], void>({
      query: () => "/",
      providesTags: (result) =>
        result
          ? [...result.map(({ _id }) => ({ type: "Order" as const, id: _id })), { type: "Order", id: "LIST" }]
          : [{ type: "Order", id: "LIST" }],
    }),
    getOrder: builder.query<Order, string>({
      query: (id) => `/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Order", id }],
    }),
    createOrder: builder.mutation<Order, { items: OrderItem[]; totalAmount: number }>({
      query: (body) => ({ url: "/", method: "POST", body }),
      invalidatesTags: [{ type: "Order", id: "LIST" }],
    }),
    updateOrderStatus: builder.mutation<Order, { id: string; status: string }>({
      query: ({ id, status }) => ({ url: `/${id}`, method: "PUT", body: { status } }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Order", id },
        { type: "Order", id: "LIST" },
      ],
    }),
  }),
});

export const { useGetOrdersQuery, useGetOrderQuery, useCreateOrderMutation, useUpdateOrderStatusMutation } = orderApi;
```

---

## COMPONENTS

### components/Providers.tsx
```tsx
"use client";

import { Provider } from "react-redux";
import { store } from "@/store/store";
import ThemeRegistry from "@/lib/theme/ThemeRegistry";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeRegistry>{children}</ThemeRegistry>
    </Provider>
  );
}
```

### components/atoms/Button.tsx
```tsx
"use client";

import MuiButton, { ButtonProps as MuiButtonProps } from "@mui/material/Button";

interface ButtonProps extends MuiButtonProps {
  gradient?: boolean;
}

export default function Button({ gradient, sx, ...props }: ButtonProps) {
  return (
    <MuiButton
      sx={{
        ...(gradient && {
          background: "linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)",
          color: "#fff",
          "&:hover": {
            background: "linear-gradient(135deg, #4834D4 0%, #6C5CE7 100%)",
            boxShadow: "0 4px 15px rgba(108, 92, 231, 0.4)",
          },
        }),
        ...sx,
      }}
      {...props}
    />
  );
}
```

### components/atoms/Input.tsx
```tsx
"use client";

import TextField, { TextFieldProps } from "@mui/material/TextField";

export default function Input(props: TextFieldProps) {
  return <TextField fullWidth variant="outlined" {...props} />;
}
```

### components/atoms/AppTypography.tsx
```tsx
"use client";

import MuiTypography, { TypographyProps as MuiTypographyProps } from "@mui/material/Typography";

export default function AppTypography(props: MuiTypographyProps) {
  return <MuiTypography {...props} />;
}
```

> **IMPORTANT**: All remaining component and page files follow below. Each file's complete source code is included.

### components/molecules/AuthForm.tsx
```tsx
"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";

interface AuthFormProps {
  mode: "login" | "register";
  onSubmit: (data: { name?: string; email: string; password: string }) => Promise<void>;
  error?: string;
  isLoading?: boolean;
}

export default function AuthForm({ mode, onSubmit, error, isLoading }: AuthFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ ...(mode === "register" ? { name } : {}), email, password });
  };

  return (
    <Box component="form" onSubmit={handleSubmit}
      sx={{ maxWidth: 440, mx: "auto", p: 4, borderRadius: 3, bgcolor: "background.paper", boxShadow: "0 8px 40px rgba(0,0,0,0.08)" }}>
      <Typography variant="h4" textAlign="center" gutterBottom fontWeight={700}>
        {mode === "login" ? "Welcome Back" : "Create Account"}
      </Typography>
      <Typography variant="body2" textAlign="center" color="text.secondary" sx={{ mb: 3 }}>
        {mode === "login" ? "Sign in to continue shopping" : "Join us and start shopping"}
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        {mode === "register" && (
          <Input label="Full Name" id="auth-name" value={name} onChange={(e) => setName(e.target.value)} required />
        )}
        <Input label="Email Address" type="email" id="auth-email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input label="Password" type="password" id="auth-password" value={password} onChange={(e) => setPassword(e.target.value)} required inputProps={{ minLength: 6 }} />
        <Button type="submit" variant="contained" size="large" gradient disabled={isLoading} sx={{ mt: 1 }}>
          {isLoading ? <CircularProgress size={24} color="inherit" /> : mode === "login" ? "Sign In" : "Create Account"}
        </Button>
      </Box>
    </Box>
  );
}
```

### components/molecules/CartItem.tsx
```tsx
"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAppDispatch } from "@/store/hooks";
import { updateQuantity, removeFromCart } from "@/features/cart/cartSlice";

interface CartItemProps {
  productId: string; name: string; price: number; quantity: number; image: string; stock: number;
}

export default function CartItem({ productId, name, price, quantity, image, stock }: CartItemProps) {
  const dispatch = useAppDispatch();
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 2, px: 2, borderRadius: 2, bgcolor: "background.paper", boxShadow: "0 1px 8px rgba(0,0,0,0.06)", mb: 2 }}>
      <Box component="img" src={image} alt={name} sx={{ width: 80, height: 80, borderRadius: 2, objectFit: "cover" }} />
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography variant="subtitle1" fontWeight={600} noWrap>{name}</Typography>
        <Typography variant="body2" color="text.secondary">${price.toFixed(2)} each</Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton size="small" onClick={() => dispatch(updateQuantity({ productId, quantity: quantity - 1 }))} disabled={quantity <= 1}>
          <RemoveIcon fontSize="small" />
        </IconButton>
        <Typography fontWeight={600} sx={{ minWidth: 24, textAlign: "center" }}>{quantity}</Typography>
        <IconButton size="small" onClick={() => dispatch(updateQuantity({ productId, quantity: quantity + 1 }))} disabled={quantity >= stock}>
          <AddIcon fontSize="small" />
        </IconButton>
      </Box>
      <Typography variant="subtitle1" fontWeight={700} color="primary" sx={{ minWidth: 80, textAlign: "right" }}>
        ${(price * quantity).toFixed(2)}
      </Typography>
      <IconButton color="error" onClick={() => dispatch(removeFromCart(productId))}>
        <DeleteIcon />
      </IconButton>
    </Box>
  );
}
```

### components/molecules/ProductCard.tsx
```tsx
"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import CardActions from "@mui/material/CardActions";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import Button from "@/components/atoms/Button";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LoginIcon from "@mui/icons-material/Login";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToCart } from "@/features/cart/cartSlice";
import { useRouter } from "next/navigation";
import { PERMISSIONS } from "@/lib/permissions";

interface ProductCardProps {
  _id: string; name: string; description: string; price: number; stock: number; image: string; category: string;
}

export default function ProductCard({ _id, name, description, price, stock, image, category }: ProductCardProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const canAddToCart = (user?.permissions ?? []).includes(PERMISSIONS.CART_ADD);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canAddToCart) { router.push("/login"); return; }
    dispatch(addToCart({ productId: _id, name, price, quantity: 1, image, stock }));
  };

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column", cursor: "pointer", position: "relative", overflow: "visible" }}
      onClick={() => router.push(`/products/${_id}`)}>
      <Box sx={{ position: "relative" }}>
        <CardMedia component="img" height="220" image={image} alt={name} sx={{ objectFit: "cover" }} />
        <Chip label={category} size="small" color="secondary" sx={{ position: "absolute", top: 12, right: 12, fontWeight: 600 }} />
      </Box>
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Typography variant="h6" gutterBottom noWrap>{name}</Typography>
        <Typography variant="body2" color="text.secondary"
          sx={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", mb: 1 }}>
          {description}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
          <Typography variant="h5" color="primary" fontWeight={700}>${price.toFixed(2)}</Typography>
          {stock <= 5 && stock > 0 && <Chip label={`Only ${stock} left`} size="small" color="warning" variant="outlined" />}
          {stock === 0 && <Chip label="Out of stock" size="small" color="error" />}
        </Box>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button gradient fullWidth startIcon={canAddToCart ? <ShoppingCartIcon /> : <LoginIcon />} disabled={stock === 0} onClick={handleAddToCart}>
          {stock === 0 ? "Out of Stock" : canAddToCart ? "Add to Cart" : "Login to Buy"}
        </Button>
      </CardActions>
    </Card>
  );
}
```

### components/organisms/Navbar.tsx
```tsx
"use client";

import { useState, useEffect } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import ListItemIcon from "@mui/material/ListItemIcon";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import StorefrontIcon from "@mui/icons-material/Storefront";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import LoginIcon from "@mui/icons-material/Login";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { useGetMeQuery, useLogoutMutation } from "@/features/auth/authApi";
import { setUser, clearUser } from "@/features/auth/authSlice";

export default function Navbar() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { items } = useAppSelector((state) => state.cart);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { data } = useGetMeQuery(undefined);
  const [logout] = useLogoutMutation();

  useEffect(() => {
    if (data?.user) { dispatch(setUser(data.user)); }
  }, [data, dispatch]);

  const handleLogout = async () => {
    setAnchorEl(null);
    await logout(undefined);
    dispatch(clearUser());
    router.push("/");
  };

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <AppBar position="sticky" sx={{ bgcolor: "rgba(255,255,255,0.9)", backdropFilter: "blur(20px)", color: "text.primary" }}>
      <Toolbar sx={{ maxWidth: 1280, width: "100%", mx: "auto" }}>
        <Link href="/" style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: 8 }}>
          <StorefrontIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h5" fontWeight={800}
            sx={{ background: "linear-gradient(135deg, #6C5CE7, #A29BFE)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            ShopVibe
          </Typography>
        </Link>
        <Box sx={{ flexGrow: 1, display: "flex", gap: 3, ml: 4 }}>
          <Link href="/products" style={{ textDecoration: "none", color: "inherit" }}>
            <Typography variant="body1" fontWeight={500} sx={{ "&:hover": { color: "primary.main" }, transition: "color 0.2s" }}>Products</Typography>
          </Link>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton onClick={() => router.push("/cart")} color="inherit" id="cart-button">
            <Badge badgeContent={cartCount} color="primary"><ShoppingCartIcon /></Badge>
          </IconButton>
          {isAuthenticated ? (
            <>
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} id="user-menu-button">
                <Avatar sx={{ width: 36, height: 36, bgcolor: "primary.main", fontSize: 14, fontWeight: 700 }}>
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </Avatar>
              </IconButton>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                slotProps={{ paper: { sx: { minWidth: 200, mt: 1, borderRadius: 2 } } }}>
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="subtitle2" fontWeight={700}>{user?.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
                </Box>
                <Divider />
                <MenuItem onClick={() => { setAnchorEl(null); router.push("/orders"); }}>
                  <ListItemIcon><ReceiptLongIcon fontSize="small" /></ListItemIcon>My Orders
                </MenuItem>
                {user?.role === "admin" && (
                  <MenuItem onClick={() => { setAnchorEl(null); router.push("/admin"); }}>
                    <ListItemIcon><AdminPanelSettingsIcon fontSize="small" /></ListItemIcon>Admin Panel
                  </MenuItem>
                )}
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <IconButton onClick={() => router.push("/login")} color="inherit" id="login-button"><LoginIcon /></IconButton>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
```

### components/organisms/ProductList.tsx
```tsx
"use client";

import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import ProductCard from "@/components/molecules/ProductCard";
import { useGetProductsQuery } from "@/features/products/productApi";

interface ProductListProps {
  category?: string;
}

export default function ProductList({ category }: ProductListProps) {
  const { data, isLoading, error } = useGetProductsQuery({ category }, {
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const products = data?.products;

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (error) return <Alert severity="error">Failed to load products.</Alert>;

  return (
    <Grid container spacing={3}>
      {products?.map((product) => (
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={product._id}>
          <ProductCard {...product} />
        </Grid>
      ))}
    </Grid>
  );
}
```

### components/organisms/CartPanel.tsx
```tsx
"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import CartItemComponent from "@/components/molecules/CartItem";
import Button from "@/components/atoms/Button";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { clearCart } from "@/features/cart/cartSlice";
import { useCreateOrderMutation } from "@/features/orders/orderApi";
import { useRouter } from "next/navigation";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { PERMISSIONS } from "@/lib/permissions";

export default function CartPanel() {
  const { items, totalAmount } = useAppSelector((state) => state.cart);
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [createOrder, { isLoading, error }] = useCreateOrderMutation();
  const router = useRouter();
  const canPlaceOrder = (user?.permissions ?? []).includes(PERMISSIONS.ORDER_CREATE);

  const handleCheckout = async () => {
    try {
      const orderItems = items.map((item) => ({
        productId: item.productId, name: item.name, price: item.price, quantity: item.quantity, image: item.image,
      }));
      await createOrder({ items: orderItems, totalAmount }).unwrap();
      dispatch(clearCart());
      router.push("/orders");
    } catch { /* Error handled by RTK Query */ }
  };

  if (items.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography variant="h5" color="text.secondary" gutterBottom>Your cart is empty</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>Add some products to get started!</Typography>
        <Button variant="contained" gradient onClick={() => router.push("/products")}>Browse Products</Button>
      </Box>
    );
  }

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>Failed to place order. Please login first.</Alert>}
      {items.map((item) => <CartItemComponent key={item.productId} {...item} />)}
      <Divider sx={{ my: 3 }} />
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 3, borderRadius: 3, background: "linear-gradient(135deg, #f8f9fe 0%, #eef0ff 100%)" }}>
        <Box>
          <Typography variant="body2" color="text.secondary">Total ({items.length} items)</Typography>
          <Typography variant="h4" fontWeight={700} color="primary">${totalAmount.toFixed(2)}</Typography>
        </Box>
        <Button variant="contained" size="large" gradient
          startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <ShoppingCartCheckoutIcon />}
          disabled={isLoading || !canPlaceOrder} onClick={handleCheckout}>
          {isLoading ? "Placing Order..." : canPlaceOrder ? "Place Order" : "Login to Order"}
        </Button>
      </Box>
    </Box>
  );
}
```

### components/organisms/AdminProductManager.tsx
> **NOTE**: This is the largest component. It includes server-side pagination, sorting, debounced search, MUI5 Table with URL params as single source of truth, and `refetchOnFocus`.
> Due to its size (~300 lines), reference the file at `components/organisms/AdminProductManager.tsx` in the project. It uses:
> - `useSearchParams()` and `useRouter()` for URL-driven state
> - `useGetProductsQuery` with `refetchOnFocus: true`, `refetchOnReconnect: true`, `pollingInterval: 60000`
> - `useCreateProductMutation`, `useUpdateProductMutation`, `useDeleteProductMutation`
> - MUI `Table`, `TablePagination`, `TableSortLabel`
> - Local state debounce (500ms) for search input → URL param sync
> - Dialog for create/edit product forms

### components/templates/ShopLayout.tsx
```tsx
"use client";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Navbar from "@/components/organisms/Navbar";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: 4 }}>{children}</Container>
    </Box>
  );
}
```

### components/templates/AdminLayout.tsx
```tsx
"use client";

import { useEffect } from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import DashboardIcon from "@mui/icons-material/Dashboard";
import InventoryIcon from "@mui/icons-material/Inventory";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { useGetMeQuery } from "@/features/auth/authApi";

const drawerWidth = 260;
const menuItems = [
  { text: "Dashboard", icon: <DashboardIcon />, href: "/admin" },
  { text: "Products", icon: <InventoryIcon />, href: "/admin/products" },
  { text: "Orders", icon: <ReceiptLongIcon />, href: "/admin/orders" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  useGetMeQuery(undefined);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Drawer variant="permanent"
        sx={{ width: drawerWidth, flexShrink: 0,
          "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box", bgcolor: "#1a1a2e", color: "#fff", borderRight: "none" } }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" fontWeight={800}
            sx={{ background: "linear-gradient(135deg, #A29BFE, #6C5CE7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Admin Panel
          </Typography>
        </Box>
        <List>
          {menuItems.map((item) => (
            <ListItemButton key={item.href} component={Link} href={item.href} selected={pathname === item.href}
              sx={{ mx: 1, borderRadius: 2, mb: 0.5,
                "&.Mui-selected": { bgcolor: "rgba(108, 92, 231, 0.2)", color: "#A29BFE", "& .MuiListItemIcon-root": { color: "#A29BFE" } },
                "&:hover": { bgcolor: "rgba(255,255,255,0.05)" },
                "& .MuiListItemIcon-root": { color: "rgba(255,255,255,0.6)" } }}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          ))}
        </List>
        <Box sx={{ flexGrow: 1 }} />
        <List>
          <ListItemButton component={Link} href="/"
            sx={{ mx: 1, borderRadius: 2, mb: 2, "&:hover": { bgcolor: "rgba(255,255,255,0.05)" },
              "& .MuiListItemIcon-root": { color: "rgba(255,255,255,0.6)" } }}>
            <ListItemIcon><ArrowBackIcon /></ListItemIcon>
            <ListItemText primary="Back to Shop" />
          </ListItemButton>
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, bgcolor: "background.default", p: 4 }}>{children}</Box>
    </Box>
  );
}
```

---

## PAGES

### app/layout.tsx
```tsx
import type { Metadata } from "next";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "ShopVibe — Premium E-Commerce",
  description: "Discover premium products at great prices. Shop the latest trends with ShopVibe.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0 }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### app/page.tsx (Home Page)
> Large file with Hero Section, Feature Cards, and Featured Products grid. Uses ShopLayout, ProductList, MUI Grid, and gradient hero banner. Reference the complete file at `app/page.tsx`.

### app/(auth)/login/page.tsx
```tsx
"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import ShopLayout from "@/components/templates/ShopLayout";
import AuthForm from "@/components/molecules/AuthForm";
import { useLoginMutation } from "@/features/auth/authApi";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/features/auth/authSlice";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [login, { isLoading }] = useLoginMutation();
  const [error, setError] = useState("");
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleSubmit = async (data: { email: string; password: string }) => {
    try {
      setError("");
      const res = await login(data).unwrap();
      dispatch(setUser(res.user));
      router.push("/products");
    } catch (err: unknown) {
      const apiError = err as { data?: { error?: string } };
      setError(apiError?.data?.error || "Login failed");
    }
  };

  return (
    <ShopLayout>
      <Box sx={{ py: 6 }}>
        <AuthForm mode="login" onSubmit={handleSubmit} error={error} isLoading={isLoading} />
        <Typography variant="body2" textAlign="center" sx={{ mt: 3 }} color="text.secondary">
          Don&apos;t have an account?{" "}
          <Link href="/register" style={{ color: "#6C5CE7", fontWeight: 600 }}>Sign Up</Link>
        </Typography>
      </Box>
    </ShopLayout>
  );
}
```

### app/(auth)/register/page.tsx
```tsx
"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import ShopLayout from "@/components/templates/ShopLayout";
import AuthForm from "@/components/molecules/AuthForm";
import { useRegisterMutation } from "@/features/auth/authApi";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/features/auth/authSlice";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [register, { isLoading }] = useRegisterMutation();
  const [error, setError] = useState("");
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleSubmit = async (data: { name?: string; email: string; password: string }) => {
    try {
      setError("");
      const res = await register(data as { name: string; email: string; password: string }).unwrap();
      dispatch(setUser(res.user));
      router.push("/products");
    } catch (err: unknown) {
      const apiError = err as { data?: { error?: string } };
      setError(apiError?.data?.error || "Registration failed");
    }
  };

  return (
    <ShopLayout>
      <Box sx={{ py: 6 }}>
        <AuthForm mode="register" onSubmit={handleSubmit} error={error} isLoading={isLoading} />
        <Typography variant="body2" textAlign="center" sx={{ mt: 3 }} color="text.secondary">
          Already have an account?{" "}
          <Link href="/login" style={{ color: "#6C5CE7", fontWeight: 600 }}>Sign In</Link>
        </Typography>
      </Box>
    </ShopLayout>
  );
}
```

### app/products/page.tsx
```tsx
"use client";

import Typography from "@mui/material/Typography";
import ShopLayout from "@/components/templates/ShopLayout";
import ProductList from "@/components/organisms/ProductList";

export default function ProductsPage() {
  return (
    <ShopLayout>
      <Typography variant="h3" fontWeight={700} gutterBottom>All Products</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>Browse our complete collection</Typography>
      <ProductList />
    </ShopLayout>
  );
}
```

### app/products/[id]/page.tsx
```tsx
"use client";

import { use } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import ShopLayout from "@/components/templates/ShopLayout";
import Button from "@/components/atoms/Button";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useGetProductQuery } from "@/features/products/productApi";
import { useAppDispatch } from "@/store/hooks";
import { addToCart } from "@/features/cart/cartSlice";
import { useRouter } from "next/navigation";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: product, isLoading, error } = useGetProductQuery(id, {
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleAddToCart = () => {
    if (!product) return;
    dispatch(addToCart({ productId: product._id, name: product.name, price: product.price, quantity: 1, image: product.image, stock: product.stock }));
  };

  return (
    <ShopLayout>
      <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()} sx={{ mb: 3 }}>Back</Button>
      {isLoading && (
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}><Skeleton variant="rounded" height={400} sx={{ borderRadius: 4 }} /></Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton variant="text" height={50} /><Skeleton variant="text" height={30} width="60%" /><Skeleton variant="text" height={100} />
          </Grid>
        </Grid>
      )}
      {error && <Alert severity="error">Failed to load product.</Alert>}
      {product && (
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box component="img" src={product.image} alt={product.name}
              sx={{ width: "100%", borderRadius: 4, objectFit: "cover", maxHeight: 500, boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Chip label={product.category} color="secondary" sx={{ mb: 2, fontWeight: 600 }} />
            <Typography variant="h3" fontWeight={700} gutterBottom>{product.name}</Typography>
            <Typography variant="h3" color="primary" fontWeight={800} sx={{ mb: 3 }}>${product.price.toFixed(2)}</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.8 }}>{product.description}</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
              <Chip label={product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                color={product.stock > 5 ? "success" : product.stock > 0 ? "warning" : "error"} variant="outlined" />
            </Box>
            <Button variant="contained" size="large" gradient startIcon={<ShoppingCartIcon />}
              disabled={product.stock === 0} onClick={handleAddToCart} sx={{ px: 5, py: 1.5 }}>
              {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </Button>
          </Grid>
        </Grid>
      )}
    </ShopLayout>
  );
}
```

### app/cart/page.tsx
```tsx
"use client";

import Typography from "@mui/material/Typography";
import ShopLayout from "@/components/templates/ShopLayout";
import CartPanel from "@/components/organisms/CartPanel";

export default function CartPage() {
  return (
    <ShopLayout>
      <Typography variant="h3" fontWeight={700} gutterBottom>Shopping Cart</Typography>
      <CartPanel />
    </ShopLayout>
  );
}
```

### app/orders/page.tsx
> Customer orders listing with MUI Table showing order ID, items, total, status (color-coded Chip), and date. Uses `useGetOrdersQuery()`.

### app/admin/page.tsx
> Admin Dashboard with 4 StatCards (Total Products, Total Orders, Revenue, Customers). Uses `useGetProductsQuery({})` and `useGetOrdersQuery()`.

### app/admin/products/page.tsx
```tsx
"use client";

import AdminLayout from "@/components/templates/AdminLayout";
import AdminProductManager from "@/components/organisms/AdminProductManager";

export default function AdminProductsPage() {
  return (
    <AdminLayout>
      <AdminProductManager />
    </AdminLayout>
  );
}
```

### app/admin/orders/page.tsx
> Admin orders management with status dropdown (Select component) for each order. Uses `useGetOrdersQuery()` and `useUpdateOrderStatusMutation()`.


---

## API ROUTES

### app/api/auth/login/route.ts
```typescript
import dbConnect from "@/lib/db";
import User from "@/lib/models/User";
import { createSession } from "@/lib/session";
import { getPermissionsForRole } from "@/lib/permissions";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return Response.json({ error: "Email and password are required" }, { status: 400 });
    }
    await dbConnect();
    const user = await User.findOne({ email: email.toLowerCase() }).lean();
    if (!user) {
      return Response.json({ error: "Invalid email or password" }, { status: 401 });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return Response.json({ error: "Invalid email or password" }, { status: 401 });
    }
    const permissions = user.permissions?.length ? user.permissions : getPermissionsForRole(user.role);
    await createSession(String(user._id), user.role, permissions);
    return Response.json({
      user: { _id: String(user._id), name: user.name, email: user.email, role: user.role, permissions },
    });
  } catch (error) {
    console.error("Login error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

### app/api/auth/register/route.ts
```typescript
import dbConnect from "@/lib/db";
import User from "@/lib/models/User";
import { createSession } from "@/lib/session";
import { getPermissionsForRole } from "@/lib/permissions";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();
    if (!name || !email || !password) {
      return Response.json({ error: "Name, email, and password are required" }, { status: 400 });
    }
    if (password.length < 6) {
      return Response.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }
    await dbConnect();
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return Response.json({ error: "Email already registered" }, { status: 409 });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const permissions = getPermissionsForRole("customer");
    const user = await User.create({
      name, email: email.toLowerCase(), password: hashedPassword, role: "customer", permissions,
    });
    await createSession(String(user._id), user.role, permissions);
    return Response.json({
      user: { _id: String(user._id), name: user.name, email: user.email, role: user.role, permissions: user.permissions },
    }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

### app/api/auth/me/route.ts
```typescript
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }
    return Response.json({ user });
  } catch (error) {
    console.error("GetMe error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

### app/api/auth/logout/route.ts
```typescript
import { deleteSession } from "@/lib/session";

export async function POST() {
  try {
    await deleteSession();
    return Response.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

### app/api/products/route.ts
```typescript
import dbConnect from "@/lib/db";
import Product from "@/lib/models/Product";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const category = searchParams.get("category");

    const filter: any = {};
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    const sort: any = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const skip = (page - 1) * limit;
    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter).sort(sort).skip(skip).limit(limit).lean();

    return Response.json({
      products: products.map((p) => ({ ...p, _id: String(p._id) })),
      total, page, limit, totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Get products error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const denied = await requirePermission(PERMISSIONS.PRODUCT_CREATE);
    if (denied) return denied;
    const body = await request.json();
    const { name, description, price, stock, image, category } = body;
    if (!name || !description || price == null || stock == null || !image || !category) {
      return Response.json({ error: "All fields are required" }, { status: 400 });
    }
    await dbConnect();
    const product = await Product.create({ name, description, price, stock, image, category });
    return Response.json({ ...product.toObject(), _id: String(product._id) }, { status: 201 });
  } catch (error) {
    console.error("Create product error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

### app/api/products/[id]/route.ts
```typescript
import dbConnect from "@/lib/db";
import Product from "@/lib/models/Product";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import type { NextRequest } from "next/server";

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/products/[id]">) {
  try {
    const { id } = await ctx.params;
    await dbConnect();
    const product = await Product.findById(id).lean();
    if (!product) return Response.json({ error: "Product not found" }, { status: 404 });
    return Response.json({ ...product, _id: String(product._id) });
  } catch (error) {
    console.error("Get product error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, ctx: RouteContext<"/api/products/[id]">) {
  try {
    const denied = await requirePermission(PERMISSIONS.PRODUCT_UPDATE);
    if (denied) return denied;
    const { id } = await ctx.params;
    const body = await request.json();
    await dbConnect();
    const product = await Product.findByIdAndUpdate(id, body, { new: true, runValidators: true }).lean();
    if (!product) return Response.json({ error: "Product not found" }, { status: 404 });
    return Response.json({ ...product, _id: String(product._id) });
  } catch (error) {
    console.error("Update product error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<"/api/products/[id]">) {
  try {
    const denied = await requirePermission(PERMISSIONS.PRODUCT_DELETE);
    if (denied) return denied;
    const { id } = await ctx.params;
    await dbConnect();
    const product = await Product.findByIdAndDelete(id);
    if (!product) return Response.json({ error: "Product not found" }, { status: 404 });
    return Response.json({ message: "Product deleted" });
  } catch (error) {
    console.error("Delete product error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

### app/api/orders/route.ts
```typescript
import dbConnect from "@/lib/db";
import Order from "@/lib/models/Order";
import { getSession } from "@/lib/session";
import { unauthorizedResponse } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();
    await dbConnect();
    const filter = session.role === "admin" ? {} : { userId: session.userId };
    const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();
    return Response.json(orders.map((o) => ({ ...o, _id: String(o._id) })));
  } catch (error) {
    console.error("Get orders error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();
    const { items, totalAmount } = await request.json();
    if (!items || !items.length || !totalAmount) {
      return Response.json({ error: "Items and totalAmount are required" }, { status: 400 });
    }
    await dbConnect();
    const order = await Order.create({ userId: session.userId, items, totalAmount, status: "pending" });
    return Response.json({ ...order.toObject(), _id: String(order._id) }, { status: 201 });
  } catch (error) {
    console.error("Create order error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

### app/api/orders/[id]/route.ts
```typescript
import dbConnect from "@/lib/db";
import Order from "@/lib/models/Order";
import { getSession } from "@/lib/session";
import { unauthorizedResponse, forbiddenResponse, requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import type { NextRequest } from "next/server";

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/orders/[id]">) {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();
    const { id } = await ctx.params;
    await dbConnect();
    const order = await Order.findById(id).lean();
    if (!order) return Response.json({ error: "Order not found" }, { status: 404 });
    if (session.role !== "admin" && order.userId !== session.userId) return forbiddenResponse();
    return Response.json({ ...order, _id: String(order._id) });
  } catch (error) {
    console.error("Get order error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, ctx: RouteContext<"/api/orders/[id]">) {
  try {
    const denied = await requirePermission(PERMISSIONS.ORDER_UPDATE_STATUS);
    if (denied) return denied;
    const { id } = await ctx.params;
    const { status } = await request.json();
    if (!status) return Response.json({ error: "Status is required" }, { status: 400 });
    await dbConnect();
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true, runValidators: true }).lean();
    if (!order) return Response.json({ error: "Order not found" }, { status: 404 });
    return Response.json({ ...order, _id: String(order._id) });
  } catch (error) {
    console.error("Update order error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

---

## SEED DATA

Import these JSON files into MongoDB database `project_db` using:
```bash
mongoimport --db project_db --collection users --file seed/users.json --jsonArray
mongoimport --db project_db --collection products --file seed/products.json --jsonArray
mongoimport --db project_db --collection orders --file seed/orders.json --jsonArray
```

### Test Credentials
| Role     | Email               | Password    |
|----------|---------------------|-------------|
| Admin    | admin@shopvibe.com  | password123 |
| Customer | john@example.com    | password123 |
| Customer | jane@example.com    | password123 |
| Customer | mike@example.com    | password123 |

> All passwords are pre-hashed with bcrypt (12 rounds). The raw password is `password123` for all accounts.

---

## IMPORTANT NOTES FOR REPLICATION

1. **Next.js 16**: Uses App Router with `use(params)` for async route parameters. `RouteContext` is a built-in type.
2. **Mongoose 9**: Uses `.lean()` to get plain objects. The `pre("save")` hook syntax is `function()` (not arrow).
3. **MUI 7.x**: Grid uses `size={{ xs: 12, md: 6 }}` instead of `xs={12} md={6}`.
4. **RTK Query**: Uses `setupListeners(store.dispatch)` for `refetchOnFocus` and `refetchOnReconnect` to work.
5. **Middleware**: Uses the `URLPattern` API (available in Next.js Edge Runtime). Requires a `declare global` type block.
6. **Server Components**: Files importing `server-only` (like `session.ts`, `auth.ts`) can only be used in server-side code.
7. **Debounced Search**: The admin product manager uses a local state + `useEffect` timer for debounced URL updates.

## Run the Project
```bash
npm install
npm run dev
```
Then open `http://localhost:3000` in your browser.
