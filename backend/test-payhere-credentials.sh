#!/bin/bash

# PayHere Sandbox Credentials Test Script
# This script tests if your PayHere sandbox credentials are valid

echo "🔍 Testing PayHere Sandbox Credentials..."
echo ""

# Load credentials from .env file
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "❌ .env file not found!"
    exit 1
fi

echo "📋 Using credentials:"
echo "   Merchant ID: $PAYHERE_MERCHANT_ID"
echo "   App ID: $PAYHERE_APP_ID"
echo ""

# Create Basic Auth token
AUTH=$(echo -n "$PAYHERE_APP_ID:$PAYHERE_APP_SECRET" | base64)

echo "🔑 Requesting access token from PayHere sandbox..."
echo ""

# Make the OAuth request
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST \
  https://sandbox.payhere.lk/merchant/v1/oauth/token \
  -H "Authorization: Basic $AUTH" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials")

# Extract HTTP code
HTTP_CODE=$(echo "$RESPONSE" | grep -o "HTTP_CODE:[0-9]*" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE:/d')

echo "📥 Response (HTTP $HTTP_CODE):"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""

# Check if successful
if [ "$HTTP_CODE" = "200" ]; then
    SCOPE=$(echo "$BODY" | jq -r '.scope' 2>/dev/null)
    if [ "$SCOPE" = "SANDBOX" ]; then
        echo "✅ SUCCESS! Your PayHere sandbox credentials are valid!"
        echo ""
        echo "📊 Token Details:"
        echo "$BODY" | jq '{access_token: .access_token[0:20] + "...", token_type, expires_in, scope}' 2>/dev/null
    else
        echo "⚠️  Token received but scope is not SANDBOX: $SCOPE"
    fi
elif [ "$HTTP_CODE" = "401" ]; then
    echo "❌ AUTHENTICATION FAILED!"
    echo ""
    echo "Possible reasons:"
    echo "  1. APP_ID is incorrect"
    echo "  2. APP_SECRET is incorrect"
    echo "  3. Business App is not approved in PayHere sandbox dashboard"
    echo ""
    echo "👉 Please verify your credentials at: https://sandbox.payhere.lk/"
elif [ "$HTTP_CODE" = "403" ]; then
    echo "❌ ACCESS DENIED!"
    echo ""
    echo "Possible reasons:"
    echo "  1. Business App is disabled or not approved"
    echo "  2. Using live credentials with sandbox endpoint"
    echo ""
    echo "👉 Check your Business App status at: https://sandbox.payhere.lk/"
else
    echo "❌ UNEXPECTED ERROR (HTTP $HTTP_CODE)"
    echo ""
    echo "👉 Contact PayHere support: support@payhere.lk"
fi

echo ""
echo "---"
echo "🔗 PayHere Sandbox Dashboard: https://sandbox.payhere.lk/"
echo "📧 Support: support@payhere.lk"
