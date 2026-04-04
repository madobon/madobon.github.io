#!/usr/bin/env bash

set -euo pipefail

filtered=()

for path in "$@"; do
  case "$path" in
    talks/*/slides.md)
      ;;
    *)
      filtered+=("$path")
      ;;
  esac
done

if [ ${#filtered[@]} -eq 0 ]; then
  exit 0
fi

vp check --fix "${filtered[@]}"
