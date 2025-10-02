#!/bin/bash

# Script to check active users on helagovi.lk

echo "======================================"
echo "Active Users Monitoring - helagovi.lk"
echo "======================================"
echo ""

# Check if backend is responding
echo "1. Backend Health Check:"
curl -s https://api.helagovi.lk/api/products | grep -o '"totalProducts":[0-9]*' || echo "Backend not responding"
echo ""

# Check total registered users (requires admin token)
echo "2. Total Users Check:"
echo "To get user count, you need to add an admin endpoint"
echo ""

# Show recent Render.com logs instruction
echo "3. To see REAL-TIME active users:"
echo "   • Visit: https://dashboard.render.com"
echo "   • Select your 'helagovi-lk' service"
echo "   • Click 'Logs' tab"
echo "   • Filter by: 'CORS Request' to see active users"
echo ""

# Alternative: Check MongoDB directly
echo "4. To count registered users in MongoDB:"
echo "   Run this in your MongoDB console:"
echo "   db.users.countDocuments()"
echo ""

echo "======================================"
echo "For LIVE user activity monitoring:"
echo "======================================"
echo "Install an analytics tool like:"
echo "  • Google Analytics"
echo "  • Mixpanel"
echo "  • PostHog (open source)"
echo ""
echo "Or implement a custom Redis-based session tracker"
echo "======================================"
