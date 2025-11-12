# 🐍 Snake Game - Control por Gestos

Juego de la serpiente controlado por gestos detectados con la cámara web usando Teachable Machine.

## 🚀 Cómo ejecutar

### Opción 1: Con Node.js (Recomendado)
```bash
node server.js
```
Luego abre tu navegador en: http://localhost:3000

### Opción 2: Con Python
```bash
python -m http.server 3000
```
Luego abre tu navegador en: http://localhost:3000

### Opción 3: Con Live Server (VS Code)
1. Instala la extensión "Live Server" en VS Code
2. Click derecho en index.html
3. Selecciona "Open with Live Server"

## 🎮 Cómo jugar

1. Permite el acceso a la cámara cuando te lo pida el navegador
2. Haz clic en "Iniciar Juego"
3. Muestra flechas (↑ ↓ ← →) a la cámara para controlar la serpiente
4. También puedes usar las flechas del teclado

## ⚠️ Importante

El juego DEBE ejecutarse desde un servidor local (no abrir el archivo HTML directamente) porque los navegadores requieren HTTPS o localhost para acceder a la cámara por razones de seguridad.
