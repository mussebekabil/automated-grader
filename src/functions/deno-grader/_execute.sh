#!/bin/sh

code="$1"  ## TODO: keep \n as \n

printf "%s" "$code" > code.ts

NO_COLOR=true deno run code.ts