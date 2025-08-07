# Window Key Switcher

A GNOME Shell extension for intelligent hotkey-based window switching and application launching.

> **⚠️ Alpha Status**: This extension is currently in alpha phase and not yet available through the official GNOME Extensions website. Manual installation is required.

## Features

- **Smart Window Switching**: Press `Super+1` through `Super+0` to switch between applications
- **Intelligent Cycling**: Quickly press the same hotkey multiple times to cycle through all windows of an application
- **Force Launch**: Use `Super+Alt+1` through `Super+Alt+0` to always launch a new instance
- **Workspace Aware**: Only manages windows on the current workspace
- **10 Configurable Slots**: Assign your most-used applications to number keys 1-9 and 0

### Window Cycling Behavior

When you have multiple windows of the same application:
- **Quick successive presses** (within 2 seconds): Cycles through all windows
- **Delayed press** (after 2 seconds): Returns to the most recently used window
- This mimics the Alt+Tab behavior for individual applications

## Requirements

- GNOME Shell 48
- Node.js and npm (for building from source)

## Configuration

Create a configuration file at `~/.config/window-key-switcher/config.json`:

```json
{
  "slots": {
    "1": {
      "name": "Terminal",
      "wmClass": "gnome-terminal-server",
      "launcher": "org.gnome.Terminal.desktop"
    },
    "2": {
      "name": "Firefox",
      "wmClass": "firefox",
      "launcher": "firefox.desktop"
    },
    "3": {
      "name": "VS Code",
      "wmClass": "Code",
      "launcher": "code.desktop"
    },
    "4": {
      "name": "Files",
      "wmClass": "org.gnome.Nautilus",
      "launcher": "org.gnome.Nautilus.desktop"
    }
  },
  "settings": {
    "visualIndicator": {
      "duration": 150,
      "opacity": 0.15,
      "color": "30, 64, 175"
    },
    "quickSwitchTimeout": 2000
  }
}
```

### Configuration Fields

- **slots**: Define up to 10 slots (keys "1" through "9" and "0")
  - **name**: Display name for the application
  - **wmClass**: Window class name (find using `xprop WM_CLASS` command)
  - **launcher**: Desktop file name (usually found in `/usr/share/applications/`)
- **settings**: Optional settings for customizing behavior
  - **visualIndicator**: Visual feedback configuration (set to `false` to disable, or an object to customize)
    - **duration**: How long the overlay displays in milliseconds (default: `150`)
    - **opacity**: Transparency of the overlay, 0-1 range (default: `0.15`)
    - **color**: RGB color values as a string (default: `"30, 64, 175"` - dark blue)
  - **quickSwitchTimeout**: Time window for quick successive presses in milliseconds (default: `2000`)

### Configuration Examples

To completely disable the visual indicator:
```json
{
  "settings": {
    "visualIndicator": false
  }
}
```

To customize only the color and opacity:
```json
{
  "settings": {
    "visualIndicator": {
      "color": "255, 0, 0",
      "opacity": 0.3
    }
  }
}
```

### Finding Window Class Names

To find an application's window class:
1. Open the application
2. Run in terminal: `xprop WM_CLASS`
3. Click on the application window
4. Use the second value shown (e.g., "firefox", "Code", "gnome-terminal-server")

## Usage

### Default Hotkeys

- **`Super+1` to `Super+0`**: Switch to or launch application in slot 1-10
  - If no window exists: launches the application
  - If windows exist: focuses the most recent or cycles through them
  
- **`Super+Alt+1` to `Super+Alt+0`**: Force launch new instance of application

### Window Cycling

When multiple windows of the same application are open:
1. First press: Focus the application
2. Quick successive presses: Cycle through all windows
3. After 2-second pause: Next press returns to the most recently used window

## Troubleshooting

### Extension Not Working

1. Check if the extension is enabled:
```bash
gnome-extensions info window-key-switcher@hsablonniere.com
```

2. Check logs for errors:
```bash
journalctl -f -o cat | grep "window-key-switcher"
```

3. Ensure your config file is valid JSON:
```bash
cat ~/.config/window-key-switcher/config.json | jq .
```

### Hotkeys Not Working

- Check if another extension or application is using the same hotkeys
- Go to Settings → Keyboard → View and Customize Shortcuts to check for conflicts

### Application Not Launching

- Verify the `.desktop` file exists:
```bash
ls /usr/share/applications/ | grep your-app
```

- Check if the application can be launched manually:
```bash
gtk-launch your-app.desktop
```

## Known Limitations

- Only works with applications on the current workspace
- Window cycling order is based on window creation time, not usage order
- Some Electron apps may have inconsistent window class names

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

## License

MIT License - see [LICENSE](LICENSE) file for details.
