# Сборка .exe (Windows)

## На Windows-машине

### Один раз — установить toolchain

1. **Node.js LTS** — https://nodejs.org/
2. **Rust** — https://rustup.rs/ → запустить `rustup-init.exe`
3. **Microsoft Visual Studio Build Tools** (C++ workload):
   https://visualstudio.microsoft.com/visual-cpp-build-tools/
4. **WebView2 Runtime** — обычно уже стоит в Win10/11, иначе:
   https://developer.microsoft.com/microsoft-edge/webview2/

### Каждая сборка

```powershell
cd np-calculator
npm install
npm run tauri:build
```

Готовые артефакты:
- `src-tauri/target/release/np-calculator.exe` — голый бинарник (~8 МБ)
- `src-tauri/target/release/bundle/msi/*.msi` — установщик MSI
- `src-tauri/target/release/bundle/nsis/*.exe` — установщик NSIS (можно запускать как `.exe`)

## Перенос проекта

Перенесите всю папку `np-calculator/` (кроме `node_modules` и `src-tauri/target`) на Windows.

## Проблемы

- **Путь с кириллицей или пробелами в имени директории** — бандлер NSIS может ругаться. Положите проект в `C:\projects\np-calculator\` или похожее.
- **Долгая первая сборка** (~5–10 минут) — Rust компилирует ~400 зависимостей. Следующие сборки — секунды.
