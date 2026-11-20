#!/usr/bin/env bash
# Usage: budget.sh <seconds> <command...>
# Runs the command and fails the step when it exceeds its time budget, so CI
# stays fast: a slow check is a bug to fix, not a timeout to widen.
set -uo pipefail
budget=$1
shift
start=$(date +%s%N)
timeout --kill-after=5 "$budget" "$@"
status=$?
elapsed_ms=$(( ($(date +%s%N) - start) / 1000000 ))
if [ "$status" -eq 124 ] || [ "$status" -eq 137 ]; then
  echo "::error::Over budget: '$*' took more than ${budget}s. Make it faster, do not raise the budget."
  exit 1
fi
echo "Took ${elapsed_ms}ms (budget ${budget}s)"
exit "$status"
