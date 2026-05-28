# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Current State

This repository is a fresh scaffold. As of this writing it contains only `README.md`
(holding the project title `Solar-Reporter-App`) and no application code, build
configuration, dependencies, or tests.

There is therefore no established build, lint, test, or run workflow yet, and no
architecture to describe. **Do not invent commands or structure that do not exist.**

## When Adding Code

As the project takes shape, keep this file current. The first substantive change
should establish — and document here — the following:

- **Stack & tooling**: language, framework, and package manager. Once a manifest
  exists (e.g. `package.json`, `pyproject.toml`, `Cargo.toml`), record the exact
  build / lint / test / run commands, including how to run a single test.
- **Architecture**: the big-picture design that spans multiple files (data flow,
  module boundaries, where reporting logic lives, external data sources for solar
  data, etc.) — the kind of context that is hard to reconstruct by reading one file.
- **Conventions**: any project-specific patterns a contributor must follow that
  aren't obvious from the code itself.

## Git Workflow

- Default branch: `main`.
- Feature work happens on dedicated branches; push with `git push -u origin <branch-name>`.
- Do not open pull requests unless explicitly requested.
