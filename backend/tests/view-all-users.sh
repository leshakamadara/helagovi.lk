#!/bin/bash

# View All Registered Users Script
# Usage: ./view-all-users.sh [OPTIONS]

API_URL="https://api.helagovi.lk/api/auth/users"

echo "🔍 Fetching all registered users..."
echo ""

# Default: Get all users (first 20)
if [ -z "$1" ]; then
  curl -s "$API_URL" | jq .
else
  # Parse command arguments
  PARAMS=""
  
  while [[ $# -gt 0 ]]; do
    case $1 in
      --role)
        PARAMS="${PARAMS}&role=$2"
        shift 2
        ;;
      --verified)
        PARAMS="${PARAMS}&isVerified=$2"
        shift 2
        ;;
      --search)
        PARAMS="${PARAMS}&search=$2"
        shift 2
        ;;
      --page)
        PARAMS="${PARAMS}&page=$2"
        shift 2
        ;;
      --limit)
        PARAMS="${PARAMS}&limit=$2"
        shift 2
        ;;
      *)
        echo "Unknown option: $1"
        echo "Usage: $0 [--role buyer|farmer|admin] [--verified true|false] [--search query] [--page N] [--limit N]"
        exit 1
        ;;
    esac
  done
  
  # Remove leading &
  PARAMS="${PARAMS:1}"
  
  curl -s "$API_URL?$PARAMS" | jq .
fi

echo ""
echo "✅ Done!"
