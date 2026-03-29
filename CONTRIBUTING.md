# Contributing to CIAgent

Thank you for your interest in contributing to **CIAgent**! This guide will walk you through everything you need to know to make a successful contribution.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Reporting Issues](#reporting-issues)
3. [Getting Started (Fork & Clone)](#getting-started-fork--clone)
4. [Branch Naming Conventions](#branch-naming-conventions)
5. [Making Changes](#making-changes)
6. [Commit Message Guidelines](#commit-message-guidelines)
7. [Code Style & Linting](#code-style--linting)
8. [Opening a Pull Request](#opening-a-pull-request)
9. [Review Process](#review-process)

---

## Code of Conduct

By participating in this project you agree to be respectful and constructive. Harassment, discrimination, or abusive behaviour of any kind will not be tolerated.

---

## Reporting Issues

Before opening a new issue, please:

1. **Search existing issues** — [github.com/Surajphirke3/CIAgent/issues](https://github.com/Surajphirke3/CIAgent/issues) — to avoid duplicates.
2. **Use the appropriate template** when one is provided.

A good bug report includes:

- A **clear, descriptive title**
- Steps to **reproduce** the problem
- **Expected** vs **actual** behaviour
- Your **environment** (OS, Node version, Python version, browser)
- Relevant **logs or error messages** (use code blocks)
- A **minimal reproduction** if possible

A good feature request includes:

- The **problem** the feature would solve
- A **proposed solution** or behaviour
- Any **alternatives** you have considered

---

## Getting Started (Fork & Clone)

### 1. Fork the repository

Click **Fork** on [github.com/Surajphirke3/CIAgent](https://github.com/Surajphirke3/CIAgent) to create your own copy.

### 2. Clone your fork

```bash
git clone https://github.com/<your-username>/CIAgent.git
cd CIAgent
```

### 3. Add the upstream remote

```bash
git remote add upstream https://github.com/Surajphirke3/CIAgent.git
```

### 4. Set up the project

Follow the [Installation & Setup](./README.md#-installation--setup) section in the README to install all dependencies and configure your environment variables.

### 5. Keep your fork in sync

Before starting any new work, pull the latest changes from upstream:

```bash
git fetch upstream
git checkout main
git merge upstream/main
```

---

## Branch Naming Conventions

Create a new branch from `main` for every piece of work. Use the following format:

```
<type>/<short-description>
```

| Type | When to use |
|------|-------------|
| `feat/` | A new feature |
| `fix/` | A bug fix |
| `docs/` | Documentation changes only |
| `chore/` | Maintenance tasks (dependencies, config) |
| `refactor/` | Code change that neither fixes a bug nor adds a feature |
| `test/` | Adding or updating tests |
| `style/` | Formatting, whitespace (no logic change) |

**Examples:**

```bash
git checkout -b feat/competitor-comparison-view
git checkout -b fix/signal-feed-pagination
git checkout -b docs/update-api-reference
git checkout -b chore/upgrade-next-16
```

Use **kebab-case**, keep it short, and make it descriptive.

---

## Making Changes

1. Make your changes in small, focused commits.
2. Write or update tests for any changed logic.
3. Run linting and tests locally before pushing.

### Frontend

```bash
cd ci-agent-next

# Run the development server
npm run dev

# Lint
npm run lint

# Build (catch TypeScript errors)
npm run build
```

### Backend

```bash
cd ci-agent-next/backend
source venv/bin/activate  # or .\venv\Scripts\Activate.ps1 on Windows

# Start the server in reload mode
uvicorn app.main:app --reload --port 8000

# Run tests
python -m pytest
```

---

## Commit Message Guidelines

This project follows the **Conventional Commits** specification. Every commit message must have the format:

```
<type>(<scope>): <short summary>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation only changes |
| `style` | Formatting, missing semicolons, etc. (no logic change) |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `test` | Adding or updating tests |
| `chore` | Build process or auxiliary tool changes |
| `perf` | A code change that improves performance |
| `ci` | Changes to CI configuration files |

### Rules

- **Use the imperative mood** in the summary: "add feature" not "added feature"
- **Keep the summary line ≤ 72 characters**
- **Do not end the summary line with a period**
- Reference issues in the footer: `Closes #42` or `Fixes #17`

### Examples

```
feat(signals): add confidence score to signal cards

Display the AI-generated confidence percentage on each signal card
to help analysts prioritise their review queue.

Closes #34
```

```
fix(auth): handle expired JWT tokens gracefully

Return a 401 with a clear error message instead of a 500 when the
JWT secret validation fails due to an expired token.

Fixes #28
```

```
docs(readme): add environment variable table
```

```
chore(deps): upgrade groq sdk to 0.10.0
```

---

## Code Style & Linting

### Frontend (TypeScript / Next.js)

- **Linter:** ESLint with the Next.js recommended config (`eslint-config-next`)
- **Formatter:** Follow the existing code style (2-space indentation, single quotes)
- **TypeScript:** Strict mode is enabled — avoid `any` types
- Run `npm run lint` before committing and fix all reported issues

### Backend (Python / FastAPI)

- **Style guide:** [PEP 8](https://peps.python.org/pep-0008/)
- **Type hints:** Use Python type annotations on all function signatures
- **Pydantic models:** Define all request/response schemas using Pydantic v2
- Keep functions short and focused — extract helpers into `utils/`
- Use `async`/`await` consistently; avoid blocking I/O in async routes

### General

- Delete unused imports and variables
- Do not commit secrets, API keys, or `.env` files
- Keep PRs focused — one logical change per PR

---

## Opening a Pull Request

1. **Push your branch** to your fork:

   ```bash
   git push origin feat/your-feature-name
   ```

2. **Open a PR** against the `main` branch of `Surajphirke3/CIAgent`.

3. **Fill in the PR template** with:
   - A clear **title** following the same `type(scope): summary` format as commits
   - A **description** of what changed and why
   - Steps to **test** the change
   - Screenshots or recordings for any UI changes
   - Reference to the related issue (`Closes #<issue-number>`)

4. **Ensure all checks pass** — linting, build, and any automated tests.

5. **Request a review** from a maintainer if you know who to tag.

### PR Checklist

Before marking your PR ready for review, confirm:

- [ ] My branch is up-to-date with `main`
- [ ] The code lints without errors (`npm run lint` / `python -m pytest`)
- [ ] I have tested my changes locally
- [ ] I have added/updated documentation where necessary
- [ ] Sensitive data (API keys, passwords) is not committed
- [ ] The PR title follows Conventional Commits format

---

## Review Process

- A maintainer will review your PR within a few days.
- Address feedback by pushing additional commits to the same branch — **do not force-push** after a review has started.
- Once approved, a maintainer will squash-merge the PR into `main`.

---

Thank you for helping make CIAgent better! 🎉
