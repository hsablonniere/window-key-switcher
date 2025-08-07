# Contributing to Window Key Switcher

Thank you for your interest in contributing to Window Key Switcher! This guide will help you get started with development.

## Development Setup

### Prerequisites

- GNOME Shell 48 running on your system
- Node.js 22+ and npm
- Git

### Getting Started

1. Fork and clone the repository:
```bash
git clone https://github.com/hsablonniere/window-key-switcher.git
cd window-key-switcher
```

2. Install dependencies:
```bash
npm install
```

3. Create your test configuration:
```bash
mkdir -p ~/.config/window-key-switcher
cp config.example.json ~/.config/window-key-switcher/config.json
# Edit the config file with your preferred applications
```

## Project Structure

```
window-key-switcher/
├── src/                            # Source code
│   ├── extension.js                # Main extension entry point
│   ├── window-manager.js           # Window focusing and cycling logic
│   ├── application-launcher.js     # Application launching
│   ├── hotkey-manager.js           # Hotkey registration and handling
│   ├── config-manager.js           # Configuration loading and validation
│   ├── config-schema.js            # Zod schema for config validation
│   ├── config-schema.types.d.ts    # TypeScript types from schema
│   ├── logger.js                   # Logging utilities
│   ├── metadata.json               # GNOME extension metadata
│   └── schemas/                    # GSettings schemas
│       └── *.gschema.xml           # Hotkey definitions
├── tasks/                          # Build and development scripts
│   ├── build-extension.js          # Build with esbuild
│   ├── package-extension.js        # Create .zip for distribution
│   ├── install-extension.js        # Install to GNOME Shell
│   ├── enable-extension.js         # Enable the extension
│   └── logs.js                     # Monitor extension logs
├── dist/                           # Built extension (git-ignored)
└── package.json                    # NPM scripts and dependencies
```

## Development Workflow

### Available NPM Scripts

- **`npm run ext:build`** - Build the extension with esbuild
- **`npm run ext:package`** - Create distributable .zip file
- **`npm run ext:install`** - Install extension to GNOME Shell
- **`npm run ext:enable`** - Enable the installed extension
- **`npm run ext:reload`** - One-command rebuild + reinstall (most useful!)
- **`npm run ext:logs`** - Monitor real-time extension logs
- **`npm run typecheck`** - Run TypeScript type checking
- **`npm run format`** - Format code with Prettier
- **`npm run format:check`** - Check code formatting

### Typical Development Cycle

1. Make your changes to the source code

2. Reload the extension:
```bash
npm run ext:reload
```

3. Restart GNOME Shell to load changes:
   - Press `Alt+F2`, type `r`, press Enter
   - Or logout and login

4. Monitor logs in a separate terminal:
```bash
npm run ext:logs
```

5. Enable the extention:
```bash
npm run ext:enable
```

6. Test your changes thoroughly

### Quick Iteration Tips

- Keep `npm run ext:logs` running in a terminal to see real-time debug output
- Add debug logging using `logger.log()` and `logger.error()`
- Use multiple terminal windows/workspaces to test window cycling

## Code Style and Conventions

### JavaScript/TypeScript

- Use ES6+ features (arrow functions, destructuring, etc.)
- Prefer `const` over `let`, avoid `var`
- Use private fields (`#fieldName`) for class members
- Add JSDoc comments for public methods and complex logic
- Type imports using JSDoc: `/** @type {import('./types').Type} */`

### File Organization

- One class/module per file
- Export as named exports when possible
- Keep related functionality together

### Formatting

The project uses Prettier for automatic formatting:
```bash
# Format all files
npm run format

# Check formatting without changing files
npm run format:check
```

### Type Checking

TypeScript is used for type checking only (not compilation):
```bash
npm run typecheck
```

Add type annotations using JSDoc comments to improve type safety.

## Testing

### Manual Testing Checklist

Before submitting a PR, please test:

- [ ] Single window focus for each configured slot
- [ ] Multiple window cycling (2-3 windows per app)
- [ ] Quick switching (within 2 seconds) cycles correctly
- [ ] Slow switching returns to last focused
- [ ] Force launch creates new window
- [ ] Extension enables/disables cleanly
- [ ] Configuration validation works
- [ ] Logs show no errors

### Testing Window Cycling

1. Open 3 windows of the same application (e.g., terminals)
2. Focus a different application
3. Press the hotkey for the test app rapidly - should cycle A→B→C→A
4. Wait 3 seconds, press hotkey - should return to last focused
5. Test switching between different slots maintains separate cycling state

## Debugging

### Finding Window Class Names

```bash
# Click on any window to get its class
xprop WM_CLASS
```

### Viewing Extension Errors

```bash
# Full GNOME Shell logs
journalctl -f /usr/bin/gnome-shell

# Just this extension's logs
npm run ext:logs

# Check extension state
gnome-extensions info window-key-switcher@hsablonniere.com
```

### Common Issues

1. **Extension not loading**: Check `metadata.json` for syntax errors
2. **Hotkeys not working**: Check for conflicts in GNOME Settings → Keyboard
3. **Windows not focusing**: Verify correct `wmClass` in config
4. **Build errors**: Ensure all dependencies are installed

## Submitting Changes

### Pull Request Process

1. Create a feature branch:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and commit with clear messages:
```bash
git commit -m "feat: add window minimize support"
```

3. Ensure code passes all checks:
```bash
npm run format:check
npm run typecheck
```

4. Push to your fork and create a PR

### Commit Message Convention

Use conventional commits format:
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `chore:` Build process/dependency updates

### PR Guidelines

- Describe what changes you've made and why
- Include screenshots/GIFs for UI changes
- Reference any related issues
- Ensure all tests pass
- Keep PRs focused on a single feature/fix

## Architecture Decisions

### Key Design Principles

1. **Separation of Concerns**: Each class has a single responsibility
2. **Configuration-Driven**: Behavior controlled via JSON config
3. **Fail-Safe**: Extension should never crash GNOME Shell
4. **User-Friendly**: Clear error messages and logging

### Window Cycling Algorithm

The window cycling uses a time-based approach:
- Track last hotkey press timestamp globally
- If pressed within `QUICK_SWITCH_TIMEOUT_MS` (2 seconds), cycle forward
- Otherwise, return to the last focused window
- Maintain separate state per slot for independent cycling

## Getting Help

- Open an issue for bugs or feature requests
- Ask questions in discussions
- Check existing issues before creating new ones

## Resources

- [GNOME Shell Extension Documentation](https://gjs.guide/extensions/)
- [GJS Documentation](https://gjs-docs.gnome.org/)
- [GNOME TypeScript Types](https://www.npmjs.com/org/girs)

Thank you for contributing!
