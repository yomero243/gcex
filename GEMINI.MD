# Contexto del Proyecto: GCEX (Gabriel Cerdio Experience)

Este documento sirve como contexto central para el Asistente de IA Gemini sobre el proyecto "GCEX". El objetivo es mantener una memoria coherente del proyecto, sus metas y su stack tecnológico.

## 📜 Resumen del Proyecto

**GCEX** es un **portafolio web interactivo y en 3D** diseñado para mostrar las habilidades de su creador, Jose Gabriel Cerdio Oyarzabal. El proyecto funciona como una experiencia inmersiva, reemplazando un sitio web tradicional por un entorno virtual explorable.

La inspiración principal es el portafolio de David Heckhoff ([https://2021.david-hckh.com/](https://2021.david-hckh.com/)).

## 🎮 Concepto Core y Experiencia de Usuario

La experiencia de usuario es la de un videojuego en tercera persona.

1.  **El Mundo:** El usuario navega por un **pasillo futurista / industrial** con una estética sci-fi.
2.  **El Personaje:** El usuario controla un **personaje 3D animado** (obtenido de Mixamo) para caminar por el entorno.
3.  **La Navegación:** La navegación principal se realiza a través de **puertas interactivas**. Cada puerta, al ser activada, abre una sección del portafolio (CV, Proyectos, Sobre Mí, Contacto) que se muestra como una interfaz de usuario 2D superpuesta.

## 💻 Stack Tecnológico

El proyecto se está construyendo con un stack de tecnologías moderno enfocado en el desarrollo 3D en la web:

* **Build Tool:** **Vite**
* **Framework Principal:** **React**
* **Motor 3D:** **Three.js**, implementado a través de:
    * `@react-three/fiber` (para el renderizado declarativo en React).
    * `@react-three/drei` (para ayudantes y componentes pre-hechos).
* **Estilos y UI:** **Tailwind CSS**

## 🏛️ Arquitectura de Componentes (React)

El proyecto se estructura separando la lógica 3D (la "Experiencia") de la lógica 2D (la "Interfaz de Usuario").

* `App.jsx` (El Cerebro - Orquesta el estado global)
    * `Experience.jsx` (Contiene el Canvas y todo el mundo 3D)
        * `World.jsx` (El modelo del pasillo, luces, etc.)
        * `Character.jsx` (El personaje del jugador y su lógica de control)
    * `UI.jsx` (Contiene toda la interfaz 2D superpuesta)
        * `Loader.jsx` (La pantalla de carga inicial)
        * `Header.jsx` (Logo, botón de menú, etc.)
        * `PortfolioMenu.jsx` (El menú lateral deslizable)
        * `ContentContainer.jsx` (Muestra las secciones: Home, About, Work, Contact)

### Responsabilidades clave:
* **`App.jsx`**: Maneja el estado principal (`isLoading`, `currentSection`, `isMenuOpen`).
* **`Experience.jsx`**: Renderiza la escena 3D con R3F y reacciona a los cambios de estado (ej. mover la cámara).
* **`UI.jsx`**: Renderiza toda la interfaz 2D y reacciona a los cambios de estado (ej. mostrar/ocultar el menú o una sección de contenido).

## 🎯 Objetivo Final

El objetivo es crear un portafolio único y memorable que demuestre de manera práctica la **doble especialidad** del creador como **Artista 3D y Desarrollador Front-End**, destacando su experiencia en la creación de experiencias interactivas en tiempo real para la web.

# GCEX (Cerdio Experience): Diseño Técnico Detallado

---

Este documento técnico describe la arquitectura de la aplicación **GCEX**, un portafolio web interactivo 3D. El diseño se enfoca en la **interoperabilidad** entre el entorno 3D (Three.js/R3F) y la Interfaz de Usuario 2D (React/Tailwind), y en la gestión del *gameplay* en tercera persona.

## 1. Stack Tecnológico y Propósito

| Componente | Tecnología | Rol Principal |
| :--- | :--- | :--- |
| **Build** | **Vite** | Empaquetador ultra rápido, HMR. |
| **Framework** | **React** | Lógica de la aplicación y gestión de la UI 2D. |
| **3D Rendering** | **@react-three/fiber (R3F)** | Integración declarativa de Three.js en el ecosistema React. |
| **Físicas** | **@react-three/rapier** | Simulación de colisiones y gravedad para el personaje y el mundo. |
| **Estilos/UI** | **Tailwind CSS** | Sistema de utilidad para estilos rápidos y optimización de CSS. |
| **Estado** | **Zustand** | *Store* global ligero para sincronizar 3D y 2D. |

---

## 2. Arquitectura de Estado (Zustand)

El **Estado Global** es el puente central. Todos los módulos (3D, 2D) se suscriben a él para reaccionar a los eventos clave.

| Variable de Estado | Tipo | Descripción | Componentes Impactados |
| :--- | :--- | :--- | :--- |
| **`isLoading`** | `boolean` | `true` mientras se cargan modelos/texturas. Oculta el `Loader.jsx`. | `Loader.jsx`, `App.jsx` |
| **`currentSection`** | `string` | ID de la puerta abierta ("CV", "Proyectos", etc.). Controla el contenido 2D. | `ContentContainer.jsx` |
| **`isContentOpen`** | `boolean` | Indica si una sección 2D está visible. **Bloquea** el control del personaje. | `Character.jsx`, `UI.jsx` |
| **`isNearDoor`** | `boolean` | El personaje está en rango de interacción con una puerta. | `Character.jsx` |

**Acciones Clave:**

* `useStore.getState().triggerDoor(name)`: Llamado por `Character.jsx` para abrir la sección 2D.
* `useStore.getState().closeContent()`: Llamado por el botón "Cerrar" del `ContentContainer.jsx`.

---

## 3. Módulo 3D: Experiencia de Juego (`Experience.jsx`)

### 3.1. `Character.jsx` (El Player)

| Aspecto | Implementación Técnica | Detalles Clave |
| :--- | :--- | :--- |
| **Movimiento/Control** | **Hooks de R3F y React.** Control de teclado mapeado a **Rapier** (`RigidBody` del personaje). | Movimiento desactivado (`isContentOpen = true`). Solo **Rapier** aplica el movimiento para garantizar la colisión. |
| **Físicas** | **`@react-three/rapier`**. Cápsula del personaje como `RigidBody`. | Detección de colisiones *sweep* y *raycasting* para evitar errores de penetración y caída. |
| **Interacción** | **Sensores de Rapier** (o geometría invisible) definidos en el área de la puerta. | Al intersectar con el sensor, se activa `isNearDoor = true` y se muestra el *prompt* de interacción 2D (usando el componente **`Html` de `drei`**). |
| **Animación** | **`useAnimations`** (de `drei`) para transiciones fluidas entre estados (Idle, Walk). | Las animaciones se sincronizan con la velocidad calculada por Rapier. |

### 3.2. `World.jsx` (El Entorno)

* **Modelo Base:** Carga el GLB del pasillo. El modelo debe tener una **geometría de colisión simplificada** separada para Rapier, si el modelo visual es demasiado complejo.
* **Puntos de Interacción:** Ubicaciones exactas de los sensores de colisión (`Rapier Sensor`) que representan las puertas. Cada sensor tiene una `userData` que mapea su posición al nombre de la sección (`"CV_Door"`).

---

## 4. Módulo 2D: Interfaz de Usuario (`UI.jsx`)

La UI es puramente **React** y **Tailwind**, superpuesta al `Canvas` 3D.

### 4.1. `UIOverlay.jsx` (Contenedor General)

* **Bloqueo de Interacción:** Usa la variable `isContentOpen`. Si es `true`, aplica estilos (`z-10`, `opacity-100`) para cubrir el mundo 3D y absorber los eventos del mouse.
* **Transiciones:** Usa las utilidades de **Tailwind** para las transiciones CSS (e.g., `transition-opacity`, `duration-500`) al abrir/cerrar el contenido.

### 4.2. `ContentContainer.jsx` (Vista de Contenido)

* **Renderizado Condicional:** Usa `currentSection` para renderizar el componente de contenido específico (e.g., `<CVView />`, `<ProjectsView />`).
* **Botón de Cierre:** Llama a la función de estado `closeContent()` (Zustand) para cerrar la UI 2D y reactivar el control del personaje 3D.

---

## Dicotomía del Diseño

* **El Enfoque Híbrido (GCEX):** La complejidad recae en la **sincronización del estado**, pero el resultado es una experiencia de usuario única donde el 3D y el 2D coexisten de manera fluida.
* **El Enfoque Tradicional:** El código 3D y la UI 2D se mantienen completamente separados (sin R3F/Zustand), resultando en una **carga de trabajo duplicada** y dificultades para coordinar la lógica de *gameplay* (p. ej., bloquear el movimiento).