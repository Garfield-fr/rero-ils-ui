# Angular Rules

Framework version: Angular 21

## Migration rules

This project is migrating incrementally to Angular 21 patterns:

- New components must be standalone.
- Existing NgModules are not removed unless explicitly refactored.
- New code must not introduce new NgModules.

## Core rules

- New components must be standalone.
- Prefer Angular Signals for local state in new components.
- Avoid RxJS when Signals are sufficient for new code.
- Use strict TypeScript typing.
- Use `inject()` instead of constructor-based dependency injection.

## Component design

- Components must remain small and focused on UI.
- Business logic should not live inside components.
- Move reusable logic to services or pure functions.

## Change detection

- Use OnPush change detection by default.

Example:

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})

## Dependency injection

- Use `inject()` function — avoid constructor injection for new code.
- Avoid unnecessary services.
- Prefer simple utility functions when Angular DI is not needed.

## Template syntax

- Use new control flow syntax: `@if`, `@for`, `@switch`.
- Do not introduce new `*ngIf`, `*ngFor`, `*ngSwitch` directives.

## Inputs and outputs

- Use the new `input()` and `output()` APIs for new components.
- Use `model()` for two-way binding.

## State management

State management rules:

1. Local component state → Angular Signals
2. Application state → NgRx Signal Store

Use:

- @ngrx/signals
- signalStore
- withState
- withMethods
- withComputed
- signalStoreFeature

Do not introduce:

- New NgRx Store reducers/effects
- New BehaviorSubject stores
- New custom RxJS state services

## Code quality

- Avoid the use of `any`.
- Prefer explicit types.
- Keep functions small and testable.
