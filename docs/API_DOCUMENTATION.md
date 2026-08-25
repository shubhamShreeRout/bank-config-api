# Bank Service Configuration API

## Overview

This API centrally provides configurable UI/service data for banks. A configuration is identified by:

```text
bankCode + serviceName
```

Example:

```text
BANK001 + top-nav
```

## Base URLs

Local development:

```text
http://localhost:3000
```

Production:

```text
https://YOUR-RENDER-SERVICE.onrender.com
```

Swagger UI:

```text
/api/docs
```

## Standard response formats

### Success

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

### Error

```json
{
  "success": false,
  "error": {
    "code": "CONFIGURATION_NOT_FOUND",
    "message": "Configuration not found"
  }
}
```

## Supported services

| Service name | Purpose |
| --- | --- |
| `login` | Login-page branding and authentication options |
| `dashboard` | Dashboard colours and visual theme |
| `top-nav` | Top navigation logo and theme |
| `left-nav` | Side navigation theme |
| `device-delivery-status` | Device-order status display settings |
| `device-mapping` | Configurable device mapping fields |

## Health check

```http
GET /health
```

Request body: none.

Response (`200`):

```json
{
  "success": true,
  "data": {
    "api": "up",
    "postgres": "up",
    "redis": "unavailable"
  }
}
```

`redis: "unavailable"` is valid. The API continues to use PostgreSQL when Redis is not configured.

---

## Get one configuration

```http
GET /api/v1/configurations/:bankCode/:serviceName
```

Example:

```http
GET /api/v1/configurations/BANK001/top-nav
```

Response (`200`):

```json
{
  "success": true,
  "data": {
    "bankCode": "BANK001",
    "serviceName": "top-nav",
    "config": {
      "imageUrl": "https://example.com/logo.png",
      "theme": {
        "primary": "#123456",
        "secondary": "#FFFFFF",
        "background": "#123456",
        "text": "#FFFFFF"
      }
    }
  },
  "meta": {
    "version": 1,
    "updatedAt": "2026-08-25T00:00:00.000Z"
  }
}
```

Errors:

| Status | Code | Meaning |
| --- | --- | --- |
| `404` | `BANK_NOT_FOUND` | The bank code does not exist. |
| `404` | `CONFIGURATION_NOT_FOUND` | No active configuration exists for the requested service. |

---

## Get all configurations for a bank

```http
GET /api/v1/configurations/:bankCode
```

Example:

```http
GET /api/v1/configurations/BANK001
```

Response (`200`):

```json
{
  "success": true,
  "data": {
    "bankCode": "BANK001",
    "services": {
      "login": {},
      "dashboard": {},
      "top-nav": {},
      "left-nav": {},
      "device-delivery-status": {},
      "device-mapping": {}
    }
  }
}
```

---

## Create or update configuration

```http
POST /api/v1/configurations
Content-Type: application/json
```

The same endpoint creates a configuration when it does not exist and updates it when it already exists. Every update increments `meta.version`.

Example request:

```json
{
  "bankCode": "BANK001",
  "serviceName": "top-nav",
  "config": {
    "imageUrl": "https://example.com/new-logo.png",
    "theme": {
      "primary": "#0066CC",
      "secondary": "#FFFFFF",
      "background": "#0066CC",
      "text": "#FFFFFF"
    }
  }
}
```

Response (`201`):

```json
{
  "success": true,
  "data": {
    "bankCode": "BANK001",
    "serviceName": "top-nav",
    "config": {
      "imageUrl": "https://example.com/new-logo.png",
      "theme": {
        "primary": "#0066CC",
        "secondary": "#FFFFFF",
        "background": "#0066CC",
        "text": "#FFFFFF"
      }
    }
  },
  "meta": {
    "version": 2,
    "updatedAt": "2026-08-25T00:00:00.000Z"
  }
}
```

---

## Delete configuration

```http
DELETE /api/v1/configurations/:bankCode/:serviceName
```

Example:

```http
DELETE /api/v1/configurations/BANK001/top-nav
```

Response (`200`):

```json
{
  "success": true,
  "data": {
    "bankCode": "BANK001",
    "serviceName": "top-nav",
    "version": 3
  }
}
```

Deletion is a soft delete. The configuration is no longer returned by GET APIs, but its history remains stored for auditing.

---

## Create a bank

```http
POST /api/v1/banks
Content-Type: application/json
```

Request:

```json
{
  "bankCode": "BANK003",
  "bankName": "Example Bank Three",
  "status": "ACTIVE"
}
```

Response (`201`):

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "bankCode": "BANK003",
    "bankName": "Example Bank Three",
    "status": "ACTIVE",
    "createdAt": "2026-08-25T00:00:00.000Z",
    "updatedAt": "2026-08-25T00:00:00.000Z"
  }
}
```

---

## Configuration JSON examples

### Login

```json
{
  "logoUrl": "https://example.com/logo.png",
  "backgroundImageUrl": "https://example.com/login-background.jpg",
  "authenticationType": "PASSWORD",
  "showForgotPassword": true,
  "theme": {
    "primary": "#123456",
    "secondary": "#FFFFFF",
    "text": "#000000"
  }
}
```

### Dashboard

```json
{
  "theme": {
    "primary": "#123456",
    "secondary": "#FFFFFF",
    "background": "#F5F5F5",
    "text": "#000000",
    "cardBackground": "#FFFFFF"
  }
}
```

### Left navigation

```json
{
  "theme": {
    "background": "#FFFFFF",
    "text": "#000000",
    "activeBackground": "#123456",
    "activeText": "#FFFFFF",
    "hoverBackground": "#EEEEEE"
  }
}
```

### Device delivery status

```json
{
  "enabled": true,
  "statuses": [
    { "code": "ORDERED", "label": "Ordered", "displayOrder": 1 },
    { "code": "DISPATCHED", "label": "Dispatched", "displayOrder": 2 },
    { "code": "DELIVERED", "label": "Delivered", "displayOrder": 3 }
  ]
}
```

### Device mapping

```json
{
  "enabled": true,
  "mappingFields": ["deviceId", "customerId", "accountNumber", "branchCode"]
}
```

---

## Frontend TypeScript example

```ts
const API_URL = 'https://YOUR-RENDER-SERVICE.onrender.com';

export async function getConfiguration(bankCode: string, serviceName: string) {
  const response = await fetch(
    `${API_URL}/api/v1/configurations/${encodeURIComponent(bankCode)}/${encodeURIComponent(serviceName)}`,
  );

  if (!response.ok) {
    throw new Error('Configuration could not be loaded');
  }

  const result = await response.json();
  return result.data.config;
}
```

## Common error codes

| Code | Meaning |
| --- | --- |
| `BANK_NOT_FOUND` | The provided bank code does not exist. |
| `CONFIGURATION_NOT_FOUND` | The requested service configuration does not exist or was deleted. |
| `INVALID_SERVICE` | `serviceName` is not supported. |
| `INVALID_CONFIGURATION` | The `config` object does not match service requirements. |
| `VALIDATION_ERROR` | Required input is missing or invalid. |
| `INTERNAL_SERVER_ERROR` | Unexpected server error. |
