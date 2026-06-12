# Project Context

## Project Overview
This project is a system for creating RPG characters, initially focused on Dungeons & Dragons, with plans to support multiple systems and community-generated content.

The core idea is to build a flexible and scalable architecture based on reusable **modifiers**, which can later be applied to:
- Player characters
- NPCs
- Enemies
- Community-created content

---

## Current Goal
Build a solid **character creation system** based on **reusable modifiers**, ensuring that stats are resolved through a predictable and extensible pipeline.

---

## Core Architectural Concept

### Modifiers System
Modifiers are the central abstraction of the system.

They are responsible for:
- Changing character stats
- Being composable and reusable
- Supporting future extensibility (items, buffs, abilities, etc.)

Important note:
- The logic currently in `modifier.operation` is likely redundant and should be reviewed.
- The system should rely primarily on `modifier.resolver`.

---

## Current Progress

### In Progress

#### Modifiers
- Refactor `/modifiers` directory
- Resolve responsibilities of each file
- Investigate redundancy between:
  - `modifier.operation`
  - `modifier.resolver`

---

### Ready (Next Tasks)

#### 1. Refactor `resolveStats` to use Modifiers
- Review function signature
- Ensure it receives a list of modifiers
- Apply modifiers in a predictable order
- Ensure the function is **pure** (no side effects)

---

#### 2. Character Structure
- Design Character model to properly interact with modifiers

---

#### 3. Connect Character → Modifiers → resolveStats
- Add modifiers list to Character
- Ensure resolved stats are computed via resolver
- Remove duplicated or scattered stat calculations

---

## Backend Design (Planned - Not Implemented Yet)

### Folder Structure