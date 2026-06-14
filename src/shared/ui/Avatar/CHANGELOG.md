# Avatar Component — Changelog

## [2026-06-14] — Skeleton Integration with Ripple Animation

### ✨ Added

#### `hooks/useAvatar.ts`

- **New state**: `isLoading` (boolean, default: `true`)
- **Updated methods**:
  - `handleError()` → sets `isLoading: false`
  - `handleLoad()` → sets `isLoading: false`
  - `reset()` → sets `isLoading: true`
- **Return value**: Now includes `isLoading` alongside `hasError`

#### `model/types.ts`

- **New prop**: `showSkeleton?: boolean` (default: `true`)
- Added to `AvatarProps` interface

#### `ui/Avatar/Avatar.tsx`

- **Import**: Added `Skeleton` component from `@/shared/ui/Skeleton`
- **Import**: Added `classNames` utility
- **New utility**: `sizeMap` — maps AvatarSize to pixel dimensions
  ```typescript
  const sizeMap = {
    sm: '32px',
    md: '48px',
    lg: '64px',
    xl: '96px',
  };
  ```
- **Updated logic**:
  - Destructured `isLoading` from `useAvatar()`
  - New computed state: `showSkeletonState = showSkeleton && isLoading && !hasError`
  - Conditional rendering: Skeleton → Fallback → Image
- **Data attributes**: Added `data-loading` and `data-error` for debugging
- **Class names**: Fixed from template string to `classNames()` utility

#### `ui/Avatar/Avatar.module.scss`

- **New classes**:
  - `.skeletonWrapper` — absolute positioning wrapper
  - `.skeleton` — base skeleton styles with ripple pseudo-elements
- **New animation**: `ripple` — "круги на воде" эффект
  - Duration: `2s`
  - Easing: `ease-out`
  - Two ripples with `0.5s` delay between them
  - Scale: `0.8` → `1.5`
  - Opacity: `0.8` → `0`
- **Pseudo-elements**:
  - `::before` — inner ripple (2px border, -4px inset)
  - `::after` — outer ripple (1px border, -8px inset, 0.5s delay)

### 🎨 Animation Details

**Ripple Effect:**

```scss
@keyframes ripple {
  0% {
    opacity: 0.8;
    transform: scale(0.8);
  }
  100% {
    opacity: 0;
    transform: scale(1.5);
  }
}
```

**Visual result:**

- Two concentric circles expand from the Avatar center
- Inner circle starts immediately
- Outer circle starts with 0.5s delay
- Both fade out as they expand
- Creates "water ripple" effect during loading

### 📦 Component Flow

```
Avatar mounts
    ↓
isLoading = true (default)
    ↓
showSkeletonState = true
    ↓
Renders: <Skeleton variant="circular" />
    ↓
[AvatarImage onLoad fires]
    ↓
handleLoad() → isLoading = false
    ↓
showSkeletonState = false
    ↓
Renders: <AvatarImage />
```

### ✅ Quality Checks

| Check            | Status                                |
| ---------------- | ------------------------------------- |
| TypeScript       | ✅ Pass                               |
| ESLint           | ✅ Pass (existing warnings unrelated) |
| Stylelint        | ✅ Pass                               |
| FSD Architecture | ✅ No violations                      |

### 🎯 Usage Examples

#### Basic (with Skeleton)

```tsx
<Avatar src="/photo.jpg" alt="John Doe" size="lg" />
```

#### Without Skeleton

```tsx
<Avatar src="/photo.jpg" alt="John Doe" showSkeleton={false} />
```

#### With custom fallback

```tsx
<Avatar src="/photo.jpg" alt="John Doe" fallback={<AvatarFallback name="JD" />} />
```

### 📝 Notes

1. **isLoading по умолчанию `true`** — Skeleton показывается при первом рендере, даже если `src` есть
2. **Автоматическое скрытие** — Skeleton исчезает после `onLoad` или `onError`
3. **CSS-only анимация** — никаких JS timers, только CSS keyframes
4. **Производительность** — Skeleton рендерится только когда `showSkeleton && isLoading && !hasError`

### 🔧 Future Improvements

- [ ] Add `loading` variant to Skeleton (shimmer vs ripple)
- [ ] Add `onLoadingChange` callback prop
- [ ] Support for `AvatarGroup` skeleton (staggered loading)
- [ ] Add Storybook story for loading state
- [ ] Add Vitest tests for loading flow

---

## [2026-06-14] — Storybook Stories + AvatarHero/AvatarAbout Updates

### ✨ Added

#### Storybook Stories

**`ui/Avatar/Avatar.stories.tsx`**

- **New story**: `Loading` — single avatar with skeleton (lg size)
- **New story**: `LoadingAllSizes` — all sizes (sm, md, lg, xl) with skeleton
- **New story**: `LoadingHeroStyle` — hero style with skeleton + glow + ring
- **New story**: `WithoutSkeleton` — demonstrates `showSkeleton={false}` prop

**`ui/AvatarHero/AvatarHero.stories.tsx`**

- **New story**: `Loading` — hero with skeleton + effects
- **New story**: `LoadingAllSizes` — all hero sizes with skeleton
- **New story**: `WithoutSkeleton` — hero without skeleton

**`ui/AvatarAbout/AvatarAbout.stories.tsx`**

- **New story**: `Loading` — about avatar with skeleton
- **New story**: `LoadingAllSizes` — all about sizes with skeleton
- **New story**: `WithoutSkeleton` — about without skeleton

### 🔧 Updated

#### `ui/AvatarHero/AvatarHero.tsx`

- **Import**: Added `Skeleton` component
- **Import**: Added `classNames` utility
- **New prop**: `showSkeleton?: boolean` (default: `true`)
- **New utility**: `sizeMap` for hero sizes (sm: 3rem, md: 5rem, lg: 8rem, xl: 14rem)
- **Updated logic**: Integrated `isLoading` state from `useAvatar()`
- **Added**: `handleImageLoad` callback
- **Added**: `data-loading` and `data-error` attributes
- **Rendering**: Skeleton → Fallback → Image

#### `ui/AvatarHero/AvatarHero.module.scss`

- **New class**: `.skeleton` with ripple pseudo-elements
- **New animation**: `ripple` keyframes (matching main Avatar)
- **Reduced motion**: Added `@media (prefers-reduced-motion)` support

#### `ui/AvatarAbout/AvatarAbout.tsx`

- **Import**: Added `Skeleton` component
- **Import**: Added `classNames` utility
- **New prop**: `showSkeleton?: boolean` (default: `true`)
- **New utility**: `sizeMap` for about sizes (sm: 32px, md: 48px, lg: 64px)
- **Updated logic**: Integrated `isLoading` state from `useAvatar()`
- **Added**: `handleImageLoad` callback
- **Added**: `data-loading` and `data-error` attributes
- **Rendering**: Skeleton → Fallback → Image

#### `ui/AvatarAbout/AvatarAbout.module.scss`

- **New class**: `.skeleton` with ripple pseudo-elements
- **New animation**: `ripple` keyframes (matching main Avatar)
- **Reduced motion**: Added `@media (prefers-reduced-motion)` support

### 📊 Storybook Coverage

| Component   | Stories | Loading Stories | Total |
| ----------- | ------- | --------------- | ----- |
| Avatar      | 6       | 4               | 10    |
| AvatarHero  | 8       | 3               | 11    |
| AvatarAbout | 9       | 3               | 12    |

### ✅ Quality Checks

| Check            | Status           |
| ---------------- | ---------------- |
| TypeScript       | ✅ Pass          |
| ESLint           | ✅ Pass          |
| Stylelint        | ✅ Pass          |
| FSD Architecture | ✅ No violations |

### 🎯 Usage Examples

#### Avatar with loading state

```tsx
<Avatar src="/photo.jpg" alt="John" size="lg" showSkeleton />
```

#### AvatarHero with loading state

```tsx
<AvatarHero src="/photo.jpg" alt="John" size="xl" showGlow showRing showSkeleton />
```

#### AvatarAbout with loading state

```tsx
<AvatarAbout src="/photo.jpg" alt="John" size="lg" showSkeleton />
```

### 📝 Notes

1. **Consistent animation** — All three components use identical ripple animation
2. **Responsive sizes** — Each component has appropriate size mappings
3. **Accessibility** — `data-loading` and `data-error` attributes for debugging
4. **Reduced motion** — Respects user's `prefers-reduced-motion` preference

### 🔧 Next Steps

- [ ] Add interaction tests for loading state (Storybook test-runner)
- [ ] Add Vitest unit tests for useAvatar hook
- [ ] Update AvatarGroup with staggered loading
- [ ] Add loading state to AvatarBadge/AvatarStatus
