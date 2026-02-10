# Linksh API Documentation

## Base URL

http://localhost:8080/api/v1

---

## 1. URLs

### Shorten URL

Create a endpoint URL from a long url

- **Endpoint:** `POST /shorten`

**Request Body**

- `longUrl` (required, must be a valid URL)
- `expiresAt` (optional, link expiration time)

**Response:**

- **201 Created**
- Returns the created link with generated short code

**Notes**

- Short codes are generated using Base62 encoding
- Click counter initialized to 0

### Redirect to Original URL

Redirect from a short code to the original long URL

- **Endpoint:** GET /:short
- **Access:** Public

**URL Parameters**

- short (required, string)

**Response**

- **302 Found**
- Redirects to the original long URL
- Increments click counter asynchronously

**Notes**

- Click tracking happens asynchronously and won't block the redirect
- Failed click tracking is logged but doesn't affect the redirect

### Get QR Code

Generate a QR code for a shortened URL

- **Endpoint:** GET /:short/qr
- **Access:** Public

**URL Parameters**

- short (required, string)

**Response**

- **200 OK**
- Returns a PNG image of the QR code

**Error Responses**

- **404 Not Found**
    - Link not found

**Notes**

- QR code encodes the full short URL
- Image format: PNG
- Color: Black on white background
- Scale: 10x for high resolution

### Get Analytics

Generate a QR code for a shortened URL.

- **Endpoint:** GET /:short/qr
- **Access:** Public

**URL Parameters**

- short (required, string)

**Response**

- **200 OK**
- Returns a PNG image of the QR code

**Error Responses**

- **404 Not Found**
    - Link not found

**Notes**

- QR code encodes the full short URL
- Image format: PNG
- Color: Black on white background
- Scale: 10x for high resolution
