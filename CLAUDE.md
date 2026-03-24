@AGENTS.md
# PLAN.md — Antigravity-Grade E-Commerce (Next.js)

## 1. Vision

Build a production-grade E-Commerce platform using Next.js App Router, MUI5 Design System, Redux Toolkit, RTK Query, MongoDB, and RBAC.

---

## 2. Architecture

### Layers

1. UI Layer (Atomic Design)
2. State Layer (Redux Toolkit + RTK Query)
3. API Layer (Next.js Route Handlers)
4. Service Layer
5. Database (MongoDB)

---

## 3. Tech Stack

* Next.js (App Router)
* React 18
* MUI v5
* Redux Toolkit
* RTK Query
* MongoDB + Mongoose
* JWT Auth (HttpOnly cookies)

---

## 4. Folder Structure

```
src/
  app/
    (auth)/login
    products/
    cart/
    orders/
    admin/
    api/
      auth/
      products/
      orders/

  features/
    auth/
    products/
    cart/
    orders/

  components/
    atoms/
    molecules/
    organisms/
    templates/

  store/
  lib/
```

---

## 5. Atomic Design

### Atoms (3+)

* Button
* Input
* Typography

### Molecules

* ProductCard
* CartItem
* AuthForm

### Organisms

* ProductList
* CartPanel
* AdminProductManager

### Templates

* ShopLayout
* AdminLayout
* DashboardLayout

### Pages

* /products
* /cart
* /orders
* /admin

---

## 6. State Management

### Redux Store

* authSlice
* cartSlice
* productSlice
* orderSlice
* api (RTK Query)

### RTK Query

* authApi
* productApi
* orderApi

---

## 7. Authentication & RBAC

### Roles

* Guest
* Customer
* Admin

### Rules

* Guest → browse only
* Customer → cart + orders
* Admin → product CRUD

### Middleware

* Protect routes (/cart, /orders, /admin)

---

## 8. API Design

### Auth

* POST /api/auth/login
* POST /api/auth/register

### Products

* GET /api/products
* POST /api/products (admin)

### Orders

* POST /api/orders
* GET /api/orders

---

## 9. Database (MongoDB)

### Users

* email, password, role

### Products

* name, price, stock, image

### Orders

* userId, items[], totalAmount

---

## 10. UI/UX Flow

### Customer Flow

1. Browse products
2. Login
3. Add to cart
4. Checkout
5. View orders

### Admin Flow

1. Login
2. Add/Edit/Delete products

---

## 11. MUI Design System

### Theme

* createTheme()
* palette, typography, spacing

### Tokens

* Colors
* Typography
* Spacing

---

## 12. Performance

* RTK Query caching
* Code splitting
* Image optimization

---

## 13. Testing

* Unit: Vitest
* Integration: RTL

---

## 14. Deployment

* Vercel (frontend)
* MongoDB Atlas

---

## 15. Future Scope

* Payments (Stripe)
* AI (Gemini Flash)
* Recommendations

---

## 16. Execution Plan

### Phase 1

* Setup project
* Theme + Design system
* Redux + RTK Query

### Phase 2

* Auth + RBAC

### Phase 3

* Products + Cart

### Phase 4

* Orders + Admin

### Phase 5

* Optimization + AI

---

## 17. Summary

This plan defines a scalable, production-ready E-Commerce system aligned with Antigravity-level engineering practices.
