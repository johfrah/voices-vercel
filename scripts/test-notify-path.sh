#!/usr/bin/env bash
# Test that /api/admin/notify accepts body.path and returns 200 (no 400/500).
# Run with dev server up: npm run dev, then: ./scripts/test-notify-path.sh

set -e
BASE="${1:-http://localhost:3000}"

echo "Testing POST $BASE/api/admin/notify with body.path ..."

RES=$(curl -s -L -w "\n%{http_code}" -X POST "$BASE/api/admin/notify" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "donation_received",
    "path": "/artist",
    "data": {
      "orderId": 1,
      "email": "test@test.com",
      "amount": 10,
      "artistName": "Youssef Zaki",
      "message": "test",
      "customer": { "first_name": "Test" }
    }
  }')

HTTP_CODE=$(echo "$RES" | tail -n1)
BODY=$(echo "$RES" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
  echo "OK: HTTP 200 - path in body accepted"
  echo "$BODY" | head -c 200
  echo ""
  exit 0
else
  echo "FAIL: HTTP $HTTP_CODE"
  echo "$BODY"
  exit 1
fi
