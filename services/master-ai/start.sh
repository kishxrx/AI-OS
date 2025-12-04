#!/bin/bash
set -euo pipefail

OPA_POLICY_DIR="/app/policy"
OPA_BINARY="/usr/local/bin/opa"
OPA_RULE="${OPA_POLICY_DIR}/property_lifecycle.rego"

if [ ! -x "$OPA_BINARY" ]; then
  echo "ERROR: OPA binary not found at $OPA_BINARY"
  exit 1
fi

if [ ! -f "$OPA_RULE" ]; then
  echo "ERROR: Policy file not found at $OPA_RULE"
  exit 1
fi

opa run --server \
  --addr 0.0.0.0:8181 \
  --watch \
  --set=decision_logs.console=true \
  "$OPA_RULE" &

OPA_PID=$!

trap 'kill "$OPA_PID"' INT TERM EXIT

node dist/services/master-ai/main.js
