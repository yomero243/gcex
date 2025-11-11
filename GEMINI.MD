# Project Context: GCEX (Gabriel Cerdio Experience)

This document serves as the central context for the Gemini AI Assistant regarding the "GCEX" project. The goal is to maintain a coherent memory of the project, its goals, and its technology stack.

## 📜 Project Summary

**GCEX** is an **interactive 3D web portfolio** designed to showcase the skills of its creator, Jose Gabriel Cerdio Oyarzabal. The project functions as an immersive experience, replacing a traditional website with an explorable virtual environment.

The main inspiration is David Heckhoff's portfolio ([https://2021.david-hckh.com/](https://2021.david-hckh.com/)).

## 🎮 Core Concept and User Experience

The user experience is that of a third-person video game.

1.  **The World:** The user navigates a **futuristic / industrial hallway** with a sci-fi aesthetic.
2.  **The Character:** The user controls an **animated 3D character** (obtained from Mixamo) to walk through the environment.
3.  **Navigation:** The main navigation is done through **interactive doors**. Each door, when activated, opens a portfolio section (CV, Projects, About Me, Contact) which is displayed as a 2D overlay UI.

## 💻 Technology Stack

The project is being built with a modern technology stack focused on 3D web development:

*   **Build Tool:** **Vite**
*   **Main Framework:** **React**
*   **3D Engine:** **Three.js**, implemented through:
    *   `@react-three/fiber` (for declarative rendering in React).
    *   `@react-three/drei` (for helpers and pre-made components).
*   **Styles and UI:** **Tailwind CSS**

## 🏛️ Component Architecture (React)

The project is structured by separating the 3D logic (the "Experience") from the 2D logic (the "User Interface").

*   `App.tsx` (The Brain - Orchestrates global state)
    *   `Experience.tsx` (Contains the Canvas and the entire 3D world)
        *   `World.tsx` (The hallway model, lights, etc.)
        *   `Character.tsx` (The player character and its control logic)
    *   `UI.tsx` (Contains all the overlaid 2D interface)
        *   `LoadingScreen.tsx` (The initial loading screen)
        *   `Header.tsx` (Logo, menu button, etc.)
        *   `PortfolioMenu.tsx` (The sliding side menu)
        *   `ScrollableContent.tsx` (Displays sections: Home, About, Work, Contact)

### Key Responsibilities:

*   **`App.tsx`**: Manages the main state (`isLoading`, `currentSection`, `isMenuOpen`).
*   **`Experience.tsx`**: Renders the 3D scene with R3F and reacts to state changes (e.g., moving the camera).
*   **`UI.tsx`**: Renders the entire 2D interface and reacts to state changes (e.g., showing/hiding the menu or a content section).

## 🎯 Final Goal

The goal is to create a unique and memorable portfolio that practically demonstrates the creator's **dual specialization** as a **3D Artist and Front-End Developer**, highlighting their experience in creating interactive real-time web experiences.

# GCEX (Cerdio Experience): Detailed Technical Design

---

This technical document describes the architecture of the **GCEX** application, an interactive 3D web portfolio. The design focuses on **interoperability** between the 3D environment (Three.js/R3F) and the 2D User Interface (React/Tailwind), and on managing third-person gameplay.

## 1. Technology Stack and Purpose

| Component | Technology | Main Role |
| :--- | :--- | :--- |
| **Build** | **Vite** | Ultra-fast bundler, HMR. |
| **Framework** | **React** | Application logic and 2D UI management. |
| **3D Rendering** | **@react-three/fiber (R3F)** | Declarative integration of Three.js into the React ecosystem. |
| **Physics** | **@react-three/rapier** | Collision and gravity simulation for the character and the world. |
| **Styles/UI** | **Tailwind CSS** | Utility system for rapid styling and CSS optimization. |
| **State** | **Zustand** | Lightweight global *store* for synchronizing 3D and 2D.

---

## 2. State Architecture (Zustand)

The **Global State** is the central bridge. All modules (3D, 2D) subscribe to it to react to key events.

| State Variable | Type | Description | Impacted Components |
| :--- | :--- | :--- | :--- |
| **`isLoading`** | `boolean` | `true` while models/textures are loading. Hides `LoadingScreen.tsx`. | `LoadingScreen.tsx`, `App.tsx` |
| **`currentSection`** | `string` | ID of the open door ("home", "projects", etc.). Controls 2D content. | `ScrollableContent.tsx` |
| **`isContentOpen`** | `boolean` | Indicates if a 2D section is visible. **Blocks** character control. | `Character.tsx`, `UI.tsx` |
| **`isNearDoor`** | `boolean` | The character is within interaction range of a door. | `Character.tsx` |

**Key Actions:**

*   `useStore.getState().triggerDoor(name)`: Called by `Character.tsx` to open the 2D section.
*   `useStore.getState().closeContent()`: Called by the "Close" button of `ScrollableContent.tsx`.

---

## 3. 3D Module: Game Experience (`Experience.tsx`)

### 3.1. `Character.tsx` (The Player)

| Aspect | Technical Implementation | Key Details |
| :--- | :--- | :--- |
| **Movement/Control** | **R3F and React Hooks.** Keyboard control mapped to **Rapier** (character's `RigidBody`). | Movement disabled (`isContentOpen = true`). Only **Rapier** applies movement to ensure collision. |
| **Physics** | **`@react-three/rapier`**. Character capsule as `RigidBody`. | Sweep collision detection and raycasting to prevent penetration and falling errors. |
| **Interaction** | **Rapier Sensors** (or invisible geometry) defined in the door area. | When intersecting with the sensor, `isNearDoor = true` is activated and the 2D interaction prompt is displayed (using `drei`'s **`Html`** component). |
| **Animation** | **`useAnimations`** (from `drei`) for fluid transitions between states (Idle, Walk). | Animations are synchronized with the speed calculated by Rapier. |

### 3.2. `World.tsx` (The Environment)

*   **Base Model:** Loads the hallway GLB. The model should have a **simplified collision geometry** separate for Rapier, if the visual model is too complex.
*   **Interaction Points:** Exact locations of the collision sensors (`Rapier Sensor`) representing the doors. Each sensor has `userData` that maps its position to the section name (`"CV_Door"`).

---

## 4. 2D Module: User Interface (`UI.tsx`)

The UI is purely **React** and **Tailwind**, overlaid on the 3D `Canvas`.

### 4.1. `UIOverlay.tsx` (General Container)

*   **Interaction Blocking:** Uses the `isContentOpen` variable. If `true`, it applies styles (`z-10`, `opacity-100`) to cover the 3D world and absorb mouse events.
*   **Transitions:** Uses **Tailwind** utilities for CSS transitions (e.g., `transition-opacity`, `duration-500`) when opening/closing content.

### 4.2. `ScrollableContent.tsx` (Content View)

*   **Conditional Rendering:** Uses `currentSection` to render the specific content component (e.g., `<CVView />`, `<ProjectsView />`).
*   **Close Button:** Calls the `closeContent()` state function (Zustand) to close the 2D UI and reactivate 3D character control.

---

## Design Dichotomy

*   **The Hybrid Approach (GCEX):** Complexity lies in **state synchronization**, but the result is a unique user experience where 3D and 2D coexist fluidly.
*   **The Traditional Approach:** 3D code and 2D UI are kept completely separate (without R3F/Zustand), resulting in **duplicated workload** and difficulties in coordinating gameplay logic (e.g., blocking movement).
