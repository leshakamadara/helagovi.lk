# API Documentation Standards

## Overview
This document outlines the standards for documenting APIs in our MERN project using Swagger/OpenAPI 3.0.

## Team Responsibilities

| Member | Features | Route Files |
|--------|----------|-------------|
| **Member A** | Users & Authentication | `userRoutes.js` |
| **Member B** | Products & Categories | `productRoutes.js` |
| **Member C** | Orders & Cart | `orderRoutes.js` |
| **Member D** | Payments & Support | `paymentRoutes.js`, `supportRoutes.js` |

## Documentation Requirements

### ✅ Required for EVERY Endpoint:
1. **Summary** - Brief description of what endpoint does
2. **Tags** - Organize by feature (Users, Products, Orders, Payments, Support)
3. **Request Schema** - Define request body structure
4. **Response Schemas** - Success and error responses
5. **Authentication** - Specify if auth required
6. **Examples** - Realistic data examples
7. **Error Codes** - Document all possible HTTP status codes

### ✅ Swagger Tags to Use:
- **Users** - Registration, login, profile management
- **Products** - Product CRUD, categories, search
- **Orders** - Cart, checkout, order history
- **Payments** - Payment processing, refunds
- **Support** - Help tickets, FAQ

## Schema Standards

### ✅ Naming Conventions:
```javascript
// Schema names should be descriptive
User, Product, Order, Payment, SupportTicket

// Request/Response schemas
LoginRequest, AuthResponse, CreateProductRequest
```

### ✅ Error Response Format:
```javascript
{
  "success": false,
  "message": "Error description",
  "errors": [...] // Optional detailed validation errors
}
```

### ✅ Success Response Format:
```javascript
{
  "success": true,
  "message": "Success message",
  "data": { ... }, // Response data
  "pagination": { ... } // If applicable
}
```

## Required Fields Documentation

### ✅ For Each Schema Property:
- **Type** (string, number, boolean, array, object)
- **Format** (email, date-time, uri, etc.)
- **Validation** (minLength, maxLength, minimum, maximum)
- **Required** (mark required fields)
- **Examples** (realistic sample data)
- **Description** (clear explanation)

## Authentication Documentation

### ✅ Protected Endpoints:
```javascript
/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     security:
 *       - bearerAuth: []
 */
```

### ✅ Auth Responses:
Always document 401 Unauthorized for protected routes.

## HTTP Status Codes

### ✅ Standard Codes to Use:
- **200** - OK (successful GET, PUT)
- **201** - Created (successful POST)
- **400** - Bad Request (validation errors)
- **401** - Unauthorized (authentication required)
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found (resource doesn't exist)
- **409** - Conflict (duplicate resource)
- **429** - Too Many Requests (rate limit exceeded)
- **500** - Internal Server Error (server errors)

## Example Template

```javascript
/**
 * @swagger
 * /api/endpoint:
 *   post:
 *     summary: Brief description of what this does
 *     tags: [FeatureName]
 *     security:                    # If authentication required
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - field1
 *               - field2
 *             properties:
 *               field1:
 *                 type: string
 *                 minLength: 2
 *                 example: "Sample value"
 *               field2:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *     responses:
 *       201:
 *         description: Success message
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResponseSchema'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
```

## Quality Checklist

Before committing route documentation, ensure:

- [ ] All endpoints have complete documentation
- [ ] Request/response examples are realistic
- [ ] All error codes are documented
- [ ] Authentication requirements are specified
- [ ] Schema properties have proper validation rules
- [ ] Examples match actual API behavior
- [ ] Tags are consistent across related endpoints

## Testing Documentation

### ✅ Verify Documentation:
1. Start server: `npm run dev`
2. Visit: `http://localhost:5001/api-docs`
3. Test endpoints using Swagger UI
4. Verify examples work correctly
5. Check error responses

## Git Workflow

1. **Create feature branch** for your routes
2. **Document as you code** - don't leave it for later
3. **Test documentation** before committing
4. **Request code review** including documentation
5. **Update documentation** when changing endpoints

## Resources

- **Swagger/OpenAPI 3.0**: https://swagger.io/specification/
- **Swagger UI**: http://localhost:5001/api-docs
- **Team Docs**: Check this file regularly for updates

---

**Remember**: Good documentation is as important as good code! 📚