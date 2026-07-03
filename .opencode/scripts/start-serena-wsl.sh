#!/bin/bash
# Serena MCP Server launcher for WSL

source $HOME/.local/bin/env

uvx --from git+https://github.com/oraios/serena \
    serena start-mcp-server \
    --context ide-assistant \
    --project "$(pwd)"
