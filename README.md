# SteamJek — Digital Game Distribution Platform

> A Steam-like digital game distribution platform built for third-party and indie game developers. Built with Node.js, Express, and PostgreSQL.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Testing](#testing)

---

## Overview

SteamJek is a digital game distribution platform that allows:
- **Users** to browse, purchase, and play games, manage wishlists, rate games, and trade in-game items
- **Game Creators** to upload and configure game listings
- **Administrators** to manage game approvals, users, and platform settings

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js v22 |
| Framework | Express.js |
| Database | PostgreSQL 16 |
| Authentication | JWT (jsonwebtoken) |
| Password Hashing | bcryptjs |
| Environment Config | dotenv |
| Dev Server | nodemon |
| API Testing | Postman |

---

## Project Structure

```
steamjek-backend/
├── controllers/
│   ├── authController.js        # Register & Login logic
│   ├── gamesController.js       # Game CRUD & search
│   ├── cartController.js        # Shopping cart
│   ├── purchasesController.js   # Checkout & order history
│   ├── wishlistController.js    # Wishlist management
│   ├── ratingsController.js     # Game ratings & reviews
│   ├── marketController.js      # In-game item marketplace
│   └── adminController.js       # Admin management
├── middleware/
│   ├── auth.js                  # JWT authentication middleware
│   └── isAdmin.js               # Admin role guard
├── routes/
│   ├── auth.js                  # /api/auth
│   ├── games.js                 # /api/games
│   ├── cart.js                  # /api/cart
│   ├── purchases.js             # /api/purchases
│   ├── wishlist.js              # /api/wishlist
│   ├── ratings.js               # /api/ratings
│   ├── market.js                # /api/market
│   └── admin.js                 # /api/admin
├── db/
│   └── index.js                 # PostgreSQL connection pool
├── .env                         # Environment variables (not committed)
├── .gitignore
├── server.js                    # Entry point
└── package.json
```

---

## Database Schema

### Users
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  address TEXT,
  credit_card_token VARCHAR(255),
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Games
```sql
CREATE TABLE games (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  genre VARCHAR(100),
  price DECIMAL(10,2) NOT NULL,
  age_rating VARCHAR(20),
  creator_id INTEGER REFERENCES users(id),
  file_url VARCHAR(255),
  cover_image VARCHAR(255),
  system_requirements TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Cart
```sql
CREATE TABLE cart (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, game_id)
);
```

### Purchases
```sql
CREATE TABLE purchases (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Wishlist
```sql
CREATE TABLE wishlist (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, game_id)
);
```

### Ratings
```sql
CREATE TABLE ratings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, game_id)
);
```

### Item Types
```sql
CREATE TABLE item_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
  image_url VARCHAR(255),
  rarity VARCHAR(50) DEFAULT 'common',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### User Items (Inventory)
```sql
CREATE TABLE user_items (
  id SERIAL PRIMARY KEY,
  owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  item_type_id INTEGER REFERENCES item_types(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1 CHECK (quantity >= 0),
  acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(owner_id, item_type_id)
);
```

### Market Listings
```sql
CREATE TABLE market_listings (
  id SERIAL PRIMARY KEY,
  item_type_id INTEGER REFERENCES item_types(id) ON DELETE CASCADE,
  seller_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1 CHECK (quantity >= 1),
  price DECIMAL(10,2) NOT NULL,
  is_sold BOOLEAN DEFAULT false,
  listed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Market Transactions
```sql
CREATE TABLE market_transactions (
  id SERIAL PRIMARY KEY,
  listing_id INTEGER REFERENCES market_listings(id),
  buyer_id INTEGER REFERENCES users(id),
  seller_id INTEGER REFERENCES users(id),
  item_type_id INTEGER REFERENCES item_types(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  sold_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## API Endpoints

### 🔐 Auth — `/api/auth`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | ❌ | Register new user |
| POST | `/login` | ❌ | Login and get JWT token |

### 🎮 Games — `/api/games`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | ❌ | Get all approved games |
| GET | `/:id` | ❌ | Get single game |
| GET | `/search?query=&genre=` | ❌ | Search and filter games |
| POST | `/` | ✅ | Create new game (creator) |

### 🛒 Cart — `/api/cart`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | ✅ | Get user cart |
| POST | `/` | ✅ | Add game to cart |
| DELETE | `/:gameId` | ✅ | Remove game from cart |

### 💳 Purchases — `/api/purchases`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | ✅ | Get purchase history |
| POST | `/` | ✅ | Checkout cart |

### ❤️ Wishlist — `/api/wishlist`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | ✅ | Get wishlist |
| POST | `/` | ✅ | Add game to wishlist |
| DELETE | `/:gameId` | ✅ | Remove from wishlist |

### ⭐ Ratings — `/api/ratings`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/:gameId` | ❌ | Get ratings for a game |
| POST | `/:gameId` | ✅ | Rate a game (must own it) |

### ⚔️ Market — `/api/market`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/listings` | ❌ | Get all active listings |
| GET | `/my-items` | ✅ | Get user inventory |
| GET | `/my-listings` | ✅ | Get user's active listings |
| POST | `/listings` | ✅ | List item for sale |
| POST | `/buy/:listingId` | ✅ | Buy a listed item |

### 🔧 Admin — `/api/admin`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/users` | ✅ Admin | Get all users |
| DELETE | `/users/:id` | ✅ Admin | Delete a user |
| GET | `/games/pending` | ✅ Admin | Get pending games |
| PUT | `/games/:id/approve` | ✅ Admin | Approve a game |
| DELETE | `/games/:id/reject` | ✅ Admin | Reject a game |
| GET | `/purchases` | ✅ Admin | Get all purchases |

---

## Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL 16
- pgAdmin 4 (optional, for DB management)

### Installation

**1 — Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/2025-ITCS383-Motrakor.git
cd Implementations/steamjek-backend
```

**2 — Install dependencies**
```bash
npm install
```

**3 — Set up environment variables**

Create a `.env` file in the root:
```
PORT=3000
JWT_SECRET=your_secret_key_here
DB_HOST=localhost
DB_PORT=5432
DB_NAME=steamjek
DB_USER=postgres
DB_PASSWORD=your_password_here
```

**4 — Set up the database**

Open pgAdmin and create a database called `steamjek`, then run all the SQL from the [Database Schema](#database-schema) section above.

**5 — Run the development server**
```bash
npm run dev
```

Server will start at `http://localhost:3000` ✅

---

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Server port (default 3000) |
| `JWT_SECRET` | Secret key for JWT signing |
| `DB_HOST` | PostgreSQL host |
| `DB_PORT` | PostgreSQL port (default 5432) |
| `DB_NAME` | Database name |
| `DB_USER` | Database user |
| `DB_PASSWORD` | Database password |

---

## Testing

All endpoints were tested using **Postman**.

### Authentication
Include JWT token in request headers for protected routes:
```
Authorization: Bearer <your_token>
```

### Getting a Token
```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

---

## Non-Functional Requirements

| Requirement | Target |
|---|---|
| Concurrent Users | 10,000 |
| Uptime | 99.999% |
| Response Time | < 1 second |
| Security | JWT + bcrypt + AES-256 |
| Scalability | Horizontal scaling ready |

---

## Branch Strategy

```
master   → stable, production-ready code
develop  → active development branch
```

---

*Built as part of ITCS383 Software Engineering Project — 2025*
