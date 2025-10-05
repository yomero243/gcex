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