# Kill all node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Wait a moment
Start-Sleep -Seconds 2

# Try to delete .next
Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue

# Run dev server
npm run dev
