#!/usr/bin/env bash
set -e

# Start backend API
uvicorn api.app:app --reload --host 127.0.0.1 --port 8000 &
backend_pid=$!

# Start frontend web app
npm --prefix web run dev &
frontend_pid=$!

# Ensure both processes are cleaned up on exit
trap "kill $backend_pid $frontend_pid" EXIT

# Wait for both processes
wait
