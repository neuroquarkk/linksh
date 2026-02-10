# linksh

A URL shortener API with analytics tracking and QR code generation. This application allows users to shorten long URLs, track clicks, generate QR codes and view detailed analytics

---

## Tech Stack

- **Runtime:** Bun
- **Backend:** Express, TypeScript
- **Database:** PostgreSQL, Prisma
- **Validation:** Zod
- **QR Code:** qrcode
- **Analytics:** ua-parser-js, geoip-lite

---

## Prerequisites

- **Bun**
- **PostgreSQL**

## Getting Started

### 1. Clone the Repo

```bash
git clone https://github.com/neuroquarkk/linksh.git
cd papyr
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Environment Configuration

```bash
cp .env.example .env
```

### 4. Run Pirsma Migration

```bash
bun prisma migrate dev --name init
```

### 5. Start Server

```bash
bun run dev
```

---

## Documentation

- [API Documentation](docs/api.md)
