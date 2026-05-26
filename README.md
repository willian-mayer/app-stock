# app-stock — Inventory Dashboard

A full-stack inventory management dashboard built with the **MEAN stack**.

**Stack:** MongoDB Atlas · Express · Angular 17 · Node.js · TypeScript · Docker · AWS EC2

---

## Project Structure

```
app-stock/           ← Angular frontend
app-stock-api/       ← Express + Node.js backend
docker-compose.yml   ← Run everything together
```

---

## Quick Start (Local)

### 1. MongoDB Atlas Setup

1. Go to [mongodb.com/atlas](https://mongodb.com/atlas) and create a free cluster
2. Create a database user (username + password)
3. Whitelist your IP (or `0.0.0.0/0` for development)
4. Copy the connection string

### 2. Configure the API

```bash
cd app-stock-api
cp .env.example .env
# Edit .env and fill in your MONGODB_URI and JWT_SECRET
```

### 3. Run with Docker Compose

```bash
# From project root
docker-compose up --build
```

- Frontend: http://localhost
- API:      http://localhost:3000
- Health:   http://localhost:3000/health

### 4. Run without Docker (development)

```bash
# Terminal 1 — API
cd app-stock-api
npm install
npm run dev

# Terminal 2 — Frontend
cd app-stock
npm install
ng serve
```

Frontend: http://localhost:4200

### 5. Create your first user

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@test.com","password":"123456","role":"admin"}'
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET  | /api/auth/me | Current user |
| GET  | /api/products | List products (pagination, search, filter) |
| POST | /api/products | Create product |
| PUT  | /api/products/:id | Update product |
| DELETE | /api/products/:id | Soft delete product |
| PATCH | /api/products/:id/stock | Update stock |
| GET  | /api/categories | List categories |
| POST | /api/categories | Create category |
| PUT  | /api/categories/:id | Update category |
| DELETE | /api/categories/:id | Delete category |
| GET  | /api/dashboard/stats | Dashboard stats |
| GET  | /api/dashboard/alerts | Low stock alerts |

---

## AWS EC2 Deploy

### 1. Launch EC2 Instance

1. Go to AWS Console → EC2 → Launch Instance
2. Choose **Amazon Linux 2023** (free tier eligible)
3. Instance type: `t2.micro` (free tier)
4. Security Group — open ports:
   - 22 (SSH)
   - 80 (HTTP — frontend)
   - 3000 (API)
5. Create and download a key pair (.pem)

### 2. Connect and install Docker

```bash
ssh -i your-key.pem ec2-user@YOUR_EC2_PUBLIC_IP

# Install Docker
sudo yum update -y
sudo yum install docker -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Log out and back in for group changes
exit
```

### 3. Deploy the app

```bash
# Re-connect after logout
ssh -i your-key.pem ec2-user@YOUR_EC2_PUBLIC_IP

# Clone your repo or upload files
git clone https://github.com/YOUR_USER/app-stock.git
cd app-stock

# Set up .env
cd app-stock-api && cp .env.example .env
nano .env  # Fill in your MongoDB Atlas URI and JWT_SECRET

# Update frontend API URL
# Edit app-stock/src/environments/environment.prod.ts
# Set apiUrl to: http://YOUR_EC2_PUBLIC_IP:3000/api

# Build and run
cd ..
docker-compose up --build -d

# Check logs
docker-compose logs -f
```

### 4. Access the app

- Frontend: `http://YOUR_EC2_PUBLIC_IP`
- API:      `http://YOUR_EC2_PUBLIC_IP:3000/health`

---

## Features

- **Authentication** — JWT login/register with role-based access (admin / viewer)
- **Dashboard** — Inventory stats, stock by category breakdown, low stock alerts, recent products
- **Products** — Full CRUD with search, category filter, low-stock filter, and pagination
- **Categories** — Manage product categories with custom colors
- **Stock alerts** — Automatic detection of products below minimum threshold
- **Dark theme** — Clean, professional dark UI

---

## Tech Decisions

- **Soft delete** on products (`isActive: false`) preserves data integrity
- **Text indexes** on products for full-text search
- **Aggregation pipeline** for dashboard stats (efficient, single query)
- **Virtual field** `isLowStock` computed at model level
- **Lazy loading** on all Angular feature modules for performance
- **JWT in localStorage** with HTTP interceptor for automatic auth headers
- **Docker multi-stage builds** to keep image sizes small
