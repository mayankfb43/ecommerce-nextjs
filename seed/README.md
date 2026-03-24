# MongoDB Seed Data — Import Guide

## Prerequisites
- MongoDB running locally on `mongodb://localhost:27017`
- MongoDB Compass installed

## Import via MongoDB Compass

1. Open **MongoDB Compass** and connect to `mongodb://localhost:27017`
2. Create a new database called **`project_db`**
3. Import each collection:

### Users Collection
- Click on `project_db` database → **Create Collection** → name it `users`
- Click **Add Data** → **Import JSON or CSV File**
- Select `seed/users.json`
- Click **Import**

### Products Collection
- Create collection named `products`
- Import `seed/products.json`

### Orders Collection
- Create collection named `orders`
- Import `seed/orders.json`

## Import via CLI (Alternative)

```bash
mongoimport --db project_db --collection users --file seed/users.json --jsonArray
mongoimport --db project_db --collection products --file seed/products.json --jsonArray
mongoimport --db project_db --collection orders --file seed/orders.json --jsonArray
```

## Test Credentials

| Role     | Email               | Password      |
|----------|---------------------|---------------|
| Admin    | admin@shopvibe.com  | password123   |
| Customer | john@example.com    | password123   |
| Customer | jane@example.com    | password123   |
| Customer | mike@example.com    | password123   |

> **Note:** All passwords are pre-hashed with bcrypt (12 rounds). The raw password is `password123` for all accounts.
