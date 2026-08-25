# Bank Service Configuration API — Frontend Integration Guide

## Purpose

Use this API to load a bank-specific configuration using the combination of `bankCode` and `serviceName`.

Example: `BANK001` + `top-nav` returns the logo and theme configuration for that bank's top navigation.

## Base URL

Development:

```text
http://localhost:3000
```

All configuration endpoints are versioned under:

```text
/api/v1
```

## Supported services

| Service name | Frontend use |
| --- | --- |
| `login` | Login page branding and options |
| `dashboard` | Dashboard theme |
| `top-nav` | Header/logo/theme |
| `left-nav` | Sidebar theme |
| `device-delivery-status` | Device order-status display |
| `device-mapping` | Device-mapping UI configuration |

## 1. Get one service configuration

```http
GET /api/v1/configurations/:bankCode/:serviceName
```

Example:

```text
GET /api/v1/configurations/BANK001/top-nav
```

Success response (`200`):

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

Use `data.config` directly to render the requested service. `meta.version` can be retained by the frontend for debugging or cache refresh decisions.

## 2. Get every configuration for a bank

```http
GET /api/v1/configurations/:bankCode
```

Example:

```text
GET /api/v1/configurations/BANK001
```

Success response (`200`):

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

Use this endpoint when the application needs multiple configurations during startup. Use the single-service endpoint when a page only needs one configuration.

## Configuration shapes

Configuration is intentionally extensible. New fields may be added without changing the endpoint or database design. Frontends should tolerate additional fields.

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

### Top navigation

```json
{
  "imageUrl": "https://example.com/bank-logo.png",
  "theme": {
    "primary": "#123456",
    "secondary": "#FFFFFF",
    "background": "#123456",
    "text": "#FFFFFF"
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
    { "code": "DELIVERED", "label": "Delivered", "displayOrder": 3 },
    { "code": "FAILED", "label": "Failed", "displayOrder": 4 }
  ]
}
```

Render statuses in ascending `displayOrder`.

### Device mapping

```json
{
  "enabled": true,
  "mappingFields": ["deviceId", "customerId", "accountNumber", "branchCode"]
}
```

## Error response format

All errors use this structure:

```json
{
  "success": false,
  "error": {
    "code": "CONFIGURATION_NOT_FOUND",
    "message": "Configuration not found"
  }
}
```

Common frontend cases:

| HTTP status | Error code | Frontend action |
| --- | --- | --- |
| `404` | `BANK_NOT_FOUND` | Use the application fallback branding or show an unsupported-bank message. |
| `404` | `CONFIGURATION_NOT_FOUND` | Use the page's default configuration. |
| `400` | `INVALID_SERVICE` | Fix the service name in the frontend integration. |
| `500` | `INTERNAL_SERVER_ERROR` | Show a generic error state and retry if appropriate. |

## Frontend example

```ts
type ConfigurationResponse = {
  success: true;
  data: {
    bankCode: string;
    serviceName: string;
    config: Record<string, unknown>;
  };
  meta: { version: number; updatedAt: string };
};

export async function getTopNavConfig(bankCode: string) {
  const response = await fetch(
    `http://localhost:3000/api/v1/configurations/${encodeURIComponent(bankCode)}/top-nav`,
  );

  if (!response.ok) throw new Error('Unable to load top navigation configuration');
  const result = (await response.json()) as ConfigurationResponse;
  return result.data.config;
}
```

## Notes

- Bank codes are case-insensitive; use uppercase such as `BANK001`.
- Service names are lowercase and hyphenated, such as `top-nav`.
- The API returns configuration JSON only; image URLs point to externally hosted images.
- GET endpoints are intended for frontend configuration retrieval.
