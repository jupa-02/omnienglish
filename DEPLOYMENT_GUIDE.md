# 🚀 Guía de Despliegue y Empaquetado — OmniEnglish Frontier

Esta guía describe cómo desplegar la plataforma **100% gratis, rápido y lista para producción** para que **Sandra** y cualquier usuario final puedan acceder a ella desde cualquier dispositivo (computadora, tablet o celular).

---

## 🏗️ Arquitectura de Alojamiento Recomendada (100% Gratuita)

| Componente | Plataforma Recomendada | Plan | Beneficios |
| :--- | :--- | :--- | :--- |
| **Frontend (Next.js 14)** | **[Vercel](https://vercel.com)** | **Hobby (Gratis)** | Despliegue global en Edge, SSL/HTTPS automático, carga ultra-rápida (<50ms). |
| **Backend (FastAPI Python)** | **[Render](https://render.com)** o **[Koyeb](https://koyeb.com)** | **Free Web Service** | Soporte nativo para Python/FastAPI, HTTPS automático, despliegue continuo desde GitHub. |
| **Inteligencia Artificial** | **Google AI Studio (Gemini)** | **Free Tier** | Modelos `gemini-3.6-flash` y `gemini-3.1-pro-preview` con cuota gratuita de 15 RPM / 1M tokens/min. |
| **Voz Neuronal Nativa** | **Microsoft Edge TTS** | **Gratis / Ilimitado** | Voces neuronales británicas, americanas y australianas de alta fidelidad sin requerir suscripciones. |

---

## 📋 Variables de Entorno Requeridas

### 1. Backend (`backend/.env` o Variables en Render / Koyeb)
```ini
# Clave de Google AI Studio (Free Tier)
GEMINI_API_KEY=tu_api_key_de_google_ai_studio

# Configuración de Seguridad
SECRET_KEY=clave_secreta_jwt_minimo_32_caracteres_aleatorios
ENVIRONMENT=production

# Base de datos SQLite ligera y autónoma
DATABASE_URL=sqlite+aiosqlite:///./omnienglish.db
SYNC_DATABASE_URL=sqlite:///./omnienglish.db
```

### 2. Frontend (`frontend/.env.production` o Variables en Vercel)
```ini
# URL pública del Backend desplegado en Render (ej: https://omnienglish-backend.onrender.com/api/v1)
NEXT_PUBLIC_API_URL=https://omnienglish-backend.onrender.com/api/v1
```

---

## 🚀 Paso a Paso de Despliegue (5 Minutos)

### Paso 1: Subir el Código a GitHub
1. Crea un repositorio privado o público en tu cuenta de GitHub (ej: `omnienglish-platform`).
2. Sube los archivos del proyecto:
```bash
git init
git add .
git commit -m "feat: complete omnienglish frontier platform"
git branch -M main
git remote add origin https://github.com/tu-usuario/omnienglish-platform.git
git push -u origin main
```

---

### Paso 2: Desplegar el Backend en Render (Gratis)
1. Ve a [Render.com](https://render.com) e inicia sesión con GitHub.
2. Haz clic en **New +** $\rightarrow$ **Web Service**.
3. Selecciona tu repositorio de GitHub.
4. Configura los parámetros:
   - **Name**: `omnienglish-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free`
5. En la sección **Environment Variables**, agrega:
   - `GEMINI_API_KEY`: *(Tu clave de Google AI Studio)*
   - `SECRET_KEY`: `omnienglish_prod_secret_key_9823748234`
   - `ENVIRONMENT`: `production`
6. Haz clic en **Create Web Service**.
7. *Copia la URL asignada* (por ejemplo: `https://omnienglish-backend.onrender.com`).

---

### Paso 3: Desplegar el Frontend en Vercel (Gratis)
1. Ve a [Vercel.com](https://vercel.com) e inicia sesión con GitHub.
2. Haz clic en **Add New...** $\rightarrow$ **Project**.
3. Importa tu repositorio `omnienglish-platform`.
4. Configura los parámetros:
   - **Root Directory**: Selecciona la carpeta `frontend`.
   - **Framework Preset**: `Next.js` (detectado automáticamente).
5. En la sección **Environment Variables**, agrega:
   - `NEXT_PUBLIC_API_URL`: `https://omnienglish-backend.onrender.com/api/v1` *(la URL de tu backend)*
6. Haz clic en **Deploy**.
7. En ~60 segundos, Vercel te entregará una URL lista para compartir (ej: `https://omnienglish.vercel.app`).

---

## 💻 Ejecución Local en 1 Clic

Si Sandra o tú desean ejecutarlo localmente en su máquina:

### Opción A: Script Automático
```bash
./start.sh
```
Abre tu navegador en:
- **Frontend**: [http://localhost:3001](http://localhost:3001)
- **Backend API**: [http://localhost:8000/docs](http://localhost:8000/docs)

### Opción B: Docker Compose
```bash
docker-compose up --build
```

---

## ✨ Resumen para Sandra (Usuario Final)
- **Acceso Inmediato**: Solo necesita abrir la URL pública en Chrome, Safari o Edge.
- **Permisos**: Al entrar a `/avatar-immersion`, `/speak-gym` o `/phoneme-lab`, el navegador solicitará permiso de micrófono para la práctica oral interactiva.
- **Sin Costo**: La plataforma opera 100% sobre la capa gratuita de Google AI Studio y Microsoft Neural TTS.
