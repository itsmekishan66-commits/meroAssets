# Check if MongoDB is running
if ! command -v mongod &> /dev/null && ! pgrep -x mongod &> /dev/null; then
  echo "  ⚠️  MongoDB not detected. Make sure MongoDB is running."
  echo "  Run: mongod --dbpath /data/db"
  echo ""
fi

# Start server in background
echo "  🚀 Starting Express server on port 5000..."
cd "$(dirname "$0")/server" && node index.js &
SERVER_PID=$!

# Give server a moment to start
sleep 1

# Start client dev server
echo "  🎨 Starting React client on port 5173..."
cd "$(dirname "$0")/client" && npm run dev

# Cleanup on exit
trap "kill $SERVER_PID 2>/dev/null" EXIT
