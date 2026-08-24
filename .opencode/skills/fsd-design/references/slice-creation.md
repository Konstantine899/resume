# Slice Creation Reference

## Entity Slice Structure

```
entities/<EntityName>/
├── index.ts              # Public API (named exports)
├── model/
│   ├── types.ts          # TypeScript types
│   ├── constants.ts      # Constants
│   └── selectors.ts      # Selectors (if stateful)
├── ui/
│   └── <EntityComponent>/    # Component with .tsx + .module.scss + index.ts
├── hooks/
│   └── use<EntityName>.ts
└── api/
    └── <entityName>Api.ts    # API endpoints (if needed)
```

## Feature Slice Structure

```
features/<FeatureName>/
├── index.ts              # Public API (named exports)
├── model/
│   ├── types.ts          # TypeScript types
│   └── constants.ts      # Constants
├── ui/
│   └── <FeatureComponent>/   # Component with .tsx + .module.scss + index.ts
└── hooks/
    └── use<FeatureName>.ts
```

## Checklist

- [ ] model/types.ts with strict types (no any)
- [ ] index.ts with named exports
- [ ] Component uses CSS Modules
- [ ] No FSD layer violations
- [ ] All types exported via public API
- [ ] No files at slice root (only in subdirectories)
