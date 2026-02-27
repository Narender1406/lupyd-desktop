# Lupyd Desktop

A Tauri-based desktop application built with React, TypeScript, and Vite.

## Prerequisites

### All Platforms

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [Yarn](https://yarnpkg.com/) (package manager)
- [Rust](https://www.rust-lang.org/) (required for Tauri)

### Linux

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file libxdo-dev libssl-dev libudev-dev pkg-config

# Fedora
sudo dnf install webkit2gtk4.1-devel gcc-c++ pkgconfig configtool libxdo openssl-devel udev-devel

# Arch Linux
sudo pacman -S webkit2gtk base-devel libxdo openssl udev
```

### macOS

```bash
# Install Xcode Command Line Tools
xcode-select --install

# Or install via Homebrew
brew install rust
```

### Windows

1. Install [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) with the following workloads:
   - "Desktop development with C++"
   - "Linux and embedded tools with C++" (optional, for WSL)
2. Install [Rust](https://www.rust-lang.org/) via rustup
3. Install [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) (usually pre-installed on Windows 10/11)

## Initial Setup

1. **Clone the repository**

2. **Install Node.js dependencies**
   ```bash
   yarn install
   ```

3. **Verify Rust installation**
   ```bash
   rustc --version
   cargo --version
   ```

## Running the Application

### Development Mode

```bash
# Using Tauri CLI (recommended)
yarn tauri dev

# Or manually
yarn dev
```

The development server will start at `http://127.0.0.1:8080`. The Tauri app window will open automatically.

### Building for Production

```bash
# Build the Tauri application
yarn tauri build
```

The built application will be located in:
- **Linux**: `src-tauri/target/release/lupyd`
- **macOS**: `src-tauri/target/release/bundle/dmg/Lupyd_x.x.x_x64.dmg`
- **Windows**: `src-tauri/target/release/bundle/nsis/Lupyd_0.0.2_x64-setup.exe`

## Available Scripts

| Command | Description |
|---------|-------------|
| `yarn dev` | Start Vite dev server |
| `yarn build` | Build frontend for production |
| `yarn tauri dev` | Run Tauri in development mode |
| `yarn tauri build` | Build Tauri application |
| `yarn lint` | Run ESLint |

## Troubleshooting

### Linux: Missing webkit2gtk
If you encounter errors about missing `webkit2gtk`, install the required development libraries:
```bash
sudo apt install libwebkit2gtk-4.1-dev
```

### Windows: WebView2 not found
Download and install [WebView2 Runtime](https://developer.microsoft.com/en-us/microsoft-edge/webview2/).

### Rust permission errors
If you encounter permission errors with Cargo, you may need to add the Rust binaries to your PATH or fix the Cargo home directory permissions.
