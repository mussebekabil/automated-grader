#!/bin/sh
# export PGPORT="$POSTGRES_PORT"
# export PGHOST="$POSTGRES_HOST"
# export PGDATABASE="$POSTGRES_DB"
# export PGUSER="$POSTGRES_USER"
# export PGPASSWORD="$POSTGRES_PASSWORD"
# export TEST_ENVIRONMENT="true"

#(deno test --cached-only --allow-all --fail-fast --unstable tests --allow-env | tee results.out) 3>&1 1>&2 2>&3 | tee results.err
timeout 60 deno test --cached-only --no-check --allow-all --allow-env --fail-fast --unstable /tmp/ > /tmp/results.out 2> /tmp/results.err

deno run --allow-read deno-test-results-to-json.ts > /tmp/results.json
