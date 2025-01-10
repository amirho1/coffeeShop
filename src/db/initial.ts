import pg from "pg";

const { Client } = pg;

const client = new Client();

try {
  await client.connect();

  const userRes = await client.query(`CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255), -- Nullable for guests
    password VARCHAR(255), -- Nullable for guests
    email VARCHAR(255), -- Nullable
    phone VARCHAR(15), -- Nullable for guests
    phoneVerified BOOLEAN DEFAULT FALSE,
    profileAvatar TEXT, -- URL of the avatar
    isAdmin BOOLEAN DEFAULT FALSE,
    guest BOOLEAN DEFAULT FALSE, -- TRUE for guest users
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT NULL
);`);

  if (userRes.command.toLowerCase() === "create")
    console.log("User Table was created successfully");

  const tableRes = await client.query(`CREATE TABLE tables (
    id SERIAL PRIMARY KEY,
    description TEXT,
    images TEXT[], -- Array of image URLs
    status VARCHAR(50) DEFAULT 'available', -- 'available', 'reserved', 'in-use'
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT NULL
  );`);

  if (tableRes.command.toLowerCase() === "create")
    console.log("Tables Table was created successfully");

  const ordersRes = await client.query(`CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    userId INT REFERENCES users(id), -- Nullable for guest orders
    guestDetails JSONB, -- JSON field for guest information
    finalPrice DECIMAL(10, 2),
    discount DECIMAL(10, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid'
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT NULL
);`);

  if (ordersRes.command.toLowerCase() === "create")
    console.log("Orders Table was created successfully");

  const InvoicesRes = await client.query(`CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    userId INT REFERENCES users(id), -- Nullable for guest invoices
    orderId INT NOT NULL REFERENCES orders(id),
    guestDetails JSONB, -- JSON field for guest information
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid'
    paymentDate TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT NULL
);`);

  if (InvoicesRes.command.toLowerCase() === "create")
    console.log("Invoices Table was created successfully");

  const vouchersRes = await client.query(`CREATE TABLE vouchers (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL, -- Voucher code
    discountValue DECIMAL(10, 2) NOT NULL, -- Discount amount or percentage
    discountType VARCHAR(50) NOT NULL CHECK (discountType IN ('fixed', 'percentage')), -- 'fixed', 'percentage'
    minOrderValue DECIMAL(10, 2) DEFAULT 0, -- Minimum order value
    expirationDate TIMESTAMP NOT NULL,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT NULL
);`);

  if (vouchersRes.command.toLowerCase() === "create")
    console.log("vouchers Table was created successfully");

  const menuRes = await client.query(`CREATE TABLE menus (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    images TEXT[], -- Array of image URLs
    availabilityStatus BOOLEAN DEFAULT TRUE, -- TRUE = Available
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    category VARCHAR(255), -- e.g., coffee, snack
    isFeatured BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT NULL
);`);

  if (menuRes.command.toLowerCase() === "create")
    console.log("menu Table was created successfully");

  const orderItems = await client.query(`CREATE TABLE orderItems (
  id SERIAL PRIMARY KEY,
  orderId INT NOT NULL REFERENCES orders(id),
  menuId INT NOT NULL REFERENCES menus(id),
  quantity INT DEFAULT 1,
  price DECIMAL(10, 2) NOT NULL, -- Price at the time of order
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT NULL
);`);

  if (orderItems.command.toLowerCase() === "create")
    console.log("orderItems Table was created successfully");
} catch (error) {
  console.error(error);
}

await client.end();
