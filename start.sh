#!/bin/bash
# start.sh — start both servers with fast .next cache
PROJ="/home/olamide/Desktop/ZENITH BANK"
mkdir -p /tmp/zenith-bank-next
ln -sfn /tmp/zenith-bank-next "$PROJ/frontend/.next"
echo "✓ .next symlinked to /tmp"
echo "Start backend: cd backend && python3 -m uvicorn main:app --reload"
echo "Start frontend: cd frontend && npm run dev"
