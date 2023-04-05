#!/bin/sh

code="$1"

printf '%s' "$code" | deno fmt -