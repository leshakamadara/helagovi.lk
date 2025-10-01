# Tests and Utility Scripts

This directory contains test scripts, migration scripts, and utility scripts for the HelaGovi backend.

## Test Scripts

### `testApiEndpoint.js`
Tests the `/products` API endpoint to verify it returns product data with review statistics.
```bash
node tests/testApiEndpoint.js
```

### `testProductReviewStats.js`
Tests the product review statistics by directly querying the database to verify review data is properly stored.
```bash
node tests/testProductReviewStats.js
```

### `testAPI.js`
General API testing script for various endpoints.
```bash
node tests/testAPI.js
```

## Migration Scripts

### `migrateProductReviewStats.js`
One-time migration script to populate `averageRating` and `totalReviews` fields for all existing products based on their reviews.
```bash
node tests/migrateProductReviewStats.js
```

## Utility Scripts

### `checkProduct.js`
Utility script to check and verify product data integrity.
```bash
node tests/checkProduct.js
```

### `fixProduct.js`
Utility script to fix common product data issues.
```bash
node tests/fixProduct.js
```

### `verify-user.js`
Utility script to verify user account data and permissions.
```bash
node tests/verify-user.js
```

### `test-orders.sh`
Shell script for testing order-related functionality.
```bash
bash tests/test-orders.sh
```

## Notes

- All scripts should be run from the backend root directory
- Make sure the MongoDB connection is active before running database-related scripts
- Environment variables should be properly configured in `.env` file
- Migration scripts are designed to be run safely multiple times

## Running Tests

To run all tests (if you add a test runner later):
```bash
# From backend directory
npm test
```

Or run individual scripts:
```bash
# From backend directory
node tests/scriptName.js
```