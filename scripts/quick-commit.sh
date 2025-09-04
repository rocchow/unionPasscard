#!/bin/bash

# Quick commit workflow script without pre-commit checks
# Usage: ./scripts/quick-commit.sh "your commit message"

set -e

# Check if message provided
if [ $# -eq 0 ]; then
    echo "Usage: ./scripts/quick-commit.sh 'your commit message'"
    exit 1
fi

COMMIT_MSG="$1"

echo "🔍 Adding files..."
git add -A

echo "📝 Committing with message: $COMMIT_MSG"
git commit -m "$COMMIT_MSG" --no-verify

echo "🚀 Pushing to origin main..."
git push origin main

echo "✅ Done!"
