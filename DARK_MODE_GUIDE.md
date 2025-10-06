# Dark Mode Implementation Guide

## Overview

The Quemiai web application now supports dark mode with system preference detection and manual theme switching.

## Features

- 🌙 Dark mode support
- ☀️ Light mode support
- 💻 System preference detection
- 🔄 Seamless theme switching
- 💾 Persistent theme preference (localStorage)

## Implementation

### Theme Provider

The theme system is built using React Context and hooks:

```typescript
// components/ThemeProvider.tsx
import { ThemeProvider } from '@/components/ThemeProvider';

// Wrap your app with ThemeProvider
<ThemeProvider>
  {children}
</ThemeProvider>
```

### Using the Theme Hook

```typescript
import { useTheme } from '@/components/ThemeProvider';

function MyComponent() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  
  // theme: 'light' | 'dark' | 'system'
  // resolvedTheme: 'light' | 'dark' (actual theme after system detection)
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <p>Resolved theme: {resolvedTheme}</p>
      <button onClick={() => setTheme('dark')}>Dark Mode</button>
      <button onClick={() => setTheme('light')}>Light Mode</button>
      <button onClick={() => setTheme('system')}>System</button>
    </div>
  );
}
```

### Theme Toggle Component

A pre-built theme toggle component is available:

```typescript
import ThemeToggle from '@/components/ThemeToggle';

function Navbar() {
  return (
    <nav>
      <ThemeToggle />
    </nav>
  );
}
```

## Styling with Dark Mode

### Tailwind CSS

Use Tailwind's `dark:` prefix for dark mode styles:

```tsx
<div className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
  <h1 className="text-blue-600 dark:text-blue-400">Hello World</h1>
  <p className="text-gray-600 dark:text-gray-300">Lorem ipsum...</p>
</div>
```

### Common Dark Mode Patterns

#### Backgrounds

```tsx
// Light background in light mode, dark in dark mode
className="bg-white dark:bg-gray-900"
className="bg-gray-100 dark:bg-gray-800"
className="bg-gray-50 dark:bg-gray-900"
```

#### Text Colors

```tsx
// Primary text
className="text-gray-900 dark:text-white"
className="text-gray-800 dark:text-gray-100"

// Secondary text
className="text-gray-600 dark:text-gray-400"
className="text-gray-500 dark:text-gray-500"

// Accent colors
className="text-blue-600 dark:text-blue-400"
className="text-purple-600 dark:text-purple-400"
```

#### Borders

```tsx
className="border-gray-200 dark:border-gray-700"
className="border-gray-300 dark:border-gray-600"
```

#### Hover States

```tsx
className="hover:bg-gray-100 dark:hover:bg-gray-800"
className="hover:text-gray-900 dark:hover:text-white"
```

### Custom CSS

For custom CSS, use the `dark` class selector:

```css
.my-component {
  background-color: white;
  color: #000;
}

.dark .my-component {
  background-color: #1a1a1a;
  color: #fff;
}
```

## System Preference Detection

The theme provider automatically detects the user's system preference:

```typescript
// Detects system preference
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

// Listens for changes
mediaQuery.addEventListener('change', handleChange);
```

When theme is set to 'system', it will:
1. Check the current system preference
2. Apply the appropriate theme
3. Listen for system preference changes
4. Update automatically when system preference changes

## Persistence

Theme preferences are saved to localStorage:

```typescript
// Saved when user changes theme
localStorage.setItem('theme', newTheme);

// Loaded on app initialization
const savedTheme = localStorage.getItem('theme');
```

## Integration with Layout

The root layout includes the ThemeProvider:

```tsx
// app/layout.tsx
import { ThemeProvider } from '@/components/ThemeProvider';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

The `suppressHydrationWarning` prop prevents warnings when the theme class is added to `<html>`.

## Testing Dark Mode

### Manual Testing

1. Click the theme toggle component
2. Select "Light", "Dark", or "System"
3. Verify the theme changes correctly
4. Refresh the page - theme should persist
5. Change system preference - verify "System" mode responds

### Browser Developer Tools

Test system preference in Chrome DevTools:
1. Open DevTools (F12)
2. Press Cmd+Shift+P (Mac) or Ctrl+Shift+P (Windows)
3. Type "Rendering"
4. Select "Emulate CSS media feature prefers-color-scheme"
5. Choose "dark" or "light"

## Accessibility

The dark mode implementation follows accessibility best practices:

1. **Sufficient Contrast**: All color combinations meet WCAG AA standards
2. **No Flash**: Smooth transitions between themes
3. **Keyboard Accessible**: Theme toggle is keyboard-navigable
4. **ARIA Labels**: Theme buttons include descriptive labels

```tsx
<button
  aria-label="Switch to Dark theme"
  title="Dark"
>
  <Moon />
</button>
```

## Performance

The theme system is optimized for performance:

1. **No Flash on Load**: Theme is applied immediately on hydration
2. **Efficient Re-renders**: Only affected components re-render on theme change
3. **Lazy Detection**: System preference is only checked when needed

## Migration Guide

### Existing Components

To add dark mode support to existing components:

1. **Add dark: variants to Tailwind classes:**

```diff
- <div className="bg-white text-black">
+ <div className="bg-white text-black dark:bg-gray-900 dark:text-white">
```

2. **Update custom styles:**

```diff
  .my-card {
    background: white;
    color: black;
  }
  
+ .dark .my-card {
+   background: #1a1a1a;
+   color: white;
+ }
```

3. **Test thoroughly:**
- Test in light mode
- Test in dark mode
- Test theme switching
- Check all interactive states

## Best Practices

1. **Use Semantic Colors**: Use Tailwind's semantic color names instead of specific shades
2. **Test Contrast**: Use tools like WebAIM's contrast checker
3. **Avoid Pure Black/White**: Use slightly off colors for better readability
4. **Consistent Patterns**: Use the same color patterns throughout the app
5. **Consider Images**: Provide dark mode versions of images when needed

## Troubleshooting

### Theme Not Persisting

- Check localStorage is enabled
- Verify no errors in console
- Check browser's localStorage quota

### Flash on Load

- Ensure `suppressHydrationWarning` is set on `<html>`
- Verify ThemeProvider is at the root level

### System Preference Not Working

- Check browser supports `prefers-color-scheme`
- Verify "System" mode is selected
- Test system preference detection

## Future Enhancements

Potential future improvements:

- [ ] Custom theme colors
- [ ] Multiple theme presets
- [ ] Transition animations
- [ ] Per-component theme overrides
- [ ] Color palette customization
- [ ] High contrast mode

## Resources

- [Tailwind CSS Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [MDN: prefers-color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)
- [WCAG Color Contrast](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
