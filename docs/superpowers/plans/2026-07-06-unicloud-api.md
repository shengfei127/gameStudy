# uniCloud API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move study pet state behind an API service boundary so the app can use uniCloud instead of page-local storage.

**Architecture:** The Vue pages call Pinia, Pinia calls `src/services/pet-api.ts`, and the service can switch between a local development adapter and a uniCloud adapter. The backend skeleton lives in `uniCloud-alipay/cloudfunctions/study-pet` for the current Alipay Cloud service space and uses a single progress collection.

**Tech Stack:** uni-app, Vue 3, Pinia, TypeScript, Vitest, uniCloud cloud functions.

---

### Task 1: Service Contract

**Files:**
- Create: `src/services/pet-api.test.ts`
- Create: `src/services/pet-api.ts`

- [ ] **Step 1: Write tests for local adapter behavior**

Test choosing an egg, recording a photo-backed check-in, enforcing the daily subject limit, and feeding.

- [ ] **Step 2: Implement the service adapters**

Add local adapter, cloud adapter, client id helpers, and photo upload helper.

### Task 2: Store Integration

**Files:**
- Modify: `src/stores/pet.ts`
- Modify: `src/pages/home/index.vue`
- Modify: `src/pages/tools/index.vue`
- Modify: `src/pages/profile/index.vue`

- [ ] **Step 1: Make store actions async**

Move persistence responsibility out of the store and into `pet-api`.

- [ ] **Step 2: Update page event handlers**

Await choose, check-in, feed, reset, and upload operations with loading state where useful.

### Task 3: Cloud Backend Skeleton

**Files:**
- Create: `uniCloud-alipay/cloudfunctions/study-pet/index.js`
- Create: `uniCloud-alipay/database/study_pet_progress.schema.json`
- Modify: `README.md`
- Modify: `.env.example`

- [ ] **Step 1: Add cloud function actions**

Implement `getProgress`, `chooseEgg`, `checkIn`, `feed`, and `resetProgress`.

- [ ] **Step 2: Document deployment**

Explain the free uniCloud path and the `VITE_USE_UNICLOUD=true` switch.

### Task 4: Verification

- [ ] **Step 1: Run focused tests**

Run `npm.cmd test -- src/services/pet-api.test.ts`.

- [ ] **Step 2: Run project verification**

Run `npm.cmd run type-check`, `npm.cmd test`, and `npm.cmd run build:h5`.
