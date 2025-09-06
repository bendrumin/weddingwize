#!/bin/bash

# Setup script for automated venue scraping
# This script sets up a cron job to run the scraper every 6 hours

echo "🕐 Setting up automated venue scraping..."

# Get the current directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Create the cron job command
CRON_COMMAND="cd $PROJECT_DIR && node scripts/scheduled-scraper.mjs >> logs/scraping.log 2>&1"

# Add to crontab (every 6 hours)
(crontab -l 2>/dev/null; echo "0 */6 * * * $CRON_COMMAND") | crontab -

echo "✅ Cron job added successfully!"
echo "📅 Scraper will run every 6 hours"
echo "📝 Logs will be saved to: logs/scraping.log"

# Create logs directory if it doesn't exist
mkdir -p "$PROJECT_DIR/logs"

echo ""
echo "🔧 To manage the cron job:"
echo "   View: crontab -l"
echo "   Edit: crontab -e"
echo "   Remove: crontab -r"
echo ""
echo "🧪 To test the scraper manually:"
echo "   cd $PROJECT_DIR && node scripts/scheduled-scraper.mjs"
