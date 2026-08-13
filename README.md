# Orthos

Orthos is a focused 2D/3D room-planning portfolio project built with React, TypeScript, React Three Fiber and Three.js.

The editor is intentionally small and product-oriented: users can create and reshape polygonal rooms, add doors and windows, place and transform floor furniture, switch between a precise 2D plan and a 3D preview, inspect geometric clearance around rotated objects, undo/redo edits, and import or export the local project.

The codebase separates editor use-cases, persisted scene data, geometry rules and WebGL rendering. Room geometry and collision logic are framework-independent TypeScript, while React owns UI composition and React Three Fiber owns rendering and pointer interaction. Visual decisions are centralized in design-system tokens so the interface and scene palette can evolve without scattered styling changes.

The project is designed as a compact demonstration of frontend engineering for interactive spatial tools: typed state, immutable scene updates, polygon geometry, oriented-box collision checks, WebGL resource ownership, responsive controls and accessible editor UI.
