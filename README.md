> [!CAUTION]
> The majority of the content in this repository are AI generated. Only parts of the specification are verified to be correct. Allways test your code and verify the results. If you need to change anything, feel free to open a pull request.


# Strike API OpenAPI 3.1 Specification

This repository contains a complete OpenAPI 3.1 specification for the [Strike API](https://docs.strike.me/api/).

## Overview

The Strike API provides integration with Strike for accessing your Strike account. This specification covers all available endpoints including:

- **Accounts** - Account profile and information
- **Balances** - Account balance management
- **Currency Exchange** - Currency exchange quotes and execution
- **Deposits** - Deposit management
- **Events** - Webhook event management
- **Invoices** - Invoice creation and management
- **Payment Methods** - Bank payment method management
- **Payments** - Payment quotes and execution (Lightning, LNURL, Onchain)
- **Payout Originators** - Payout originator management
- **Payouts** - Payout creation and management
- **Rates** - Currency exchange rate tickers
- **Receive Requests** - Receive request management
- **Subscriptions** - Webhook subscription management

## Authentication

The Strike API uses Bearer token authentication. You can authenticate using either:

1. **API Key** - For accessing your own Strike account
   - Never expires
   - Generate at [Strike Dashboard](https://dashboard.strike.me)

2. **OAuth Access Token** - For delegated access
   - Obtained via OAuth flow
   - Can be refreshed using refresh token
   - OAuth configuration: https://auth.strike.me/.well-known/openid-configuration

Add the token to the `Authorization` header:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

## Error Handling

The API returns standard HTTP status codes:

- **2xx** - Success
- **4xx** - Client errors (invalid request, insufficient balance, etc.)
- **5xx** - Server errors

Error responses include:
- `traceId` - Unique identifier for the request
- `code` - Error code
- `message` - Error description
- `validationErrors` - Field-specific validation errors (when applicable)

## Rate Limiting

The API implements rate limiting. Exceeding limits returns HTTP 429 (Too Many Requests).

## Versioning

API versions are declared in the route path with the `/v1` prefix (e.g., `/v1/invoices`, `/v1/payments/{paymentId}`).

Breaking changes will result in a new version. Non-breaking changes are additive and rolled out to the current version.

## Usage

### With OpenAPI Generators

Generate client SDKs in various languages:

```bash
# Generate TypeScript client
openapi-generator-cli generate -i openapi.yaml -g typescript-axios -o ./generated/typescript

# Generate Python client
openapi-generator-cli generate -i openapi.yaml -g python -o ./generated/python

# Generate Java client
openapi-generator-cli generate -i openapi.yaml -g java -o ./generated/java
```

### With API Documentation Tools

View interactive documentation:

```bash
# Using Swagger UI
docker run -p 8080:8080 -e SWAGGER_JSON=/openapi.yaml -v $(pwd):/usr/share/nginx/html swaggerapi/swagger-ui

# Using Redoc
docker run -p 8080:80 -e SPEC_URL=openapi.yaml -v $(pwd):/usr/share/nginx/html redocly/redoc
```

### With API Testing Tools

Import into Postman, Insomnia, or other API testing tools to explore and test the API.

## Specification Details

- **OpenAPI Version**: 3.1.0
- **API Version**: v1
- **Format**: YAML
- **File**: `openapi.yaml`

## Resources

- [Strike API Documentation](https://docs.strike.me/api/)
- [Strike Dashboard](https://dashboard.strike.me)
- [Strike Support](mailto:support@strike.me)
- [API Terms](https://developer.strike.me/terms)
- [Privacy Policy](https://developer.strike.me/privacy)

## Contributing

This specification is based on the official Strike API documentation. If you find any discrepancies or have suggestions for improvements, please open an issue or submit a pull request.

## License

This OpenAPI specification is provided for integration purposes. Please refer to Strike's [API Terms](https://developer.strike.me/terms) for usage terms and conditions.

## Changelog

### 2025-01-12
- Initial complete OpenAPI 3.1 specification
- All v1 endpoints documented
- Comprehensive schema definitions
- Full authentication and error handling documentation
