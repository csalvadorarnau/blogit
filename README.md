# Blogit

Web app mobile-first para bloguear por temáticas (moda, fotografía, comida, superhéroes, viajes). React + Supabase (auth, base de datos, fotos) + Vercel.

## 1. Configurar Supabase

1. Entra en tu proyecto de Supabase → **SQL Editor** → pega el contenido de `supabase/schema.sql` → **Run**. Esto crea las tablas (`profiles`, `posts`, `comments`, `likes`, `follows`), las políticas de seguridad (RLS) y el bucket de fotos `post-images`.
2. Ve a **Project Settings → API** y copia:
   - **Project URL**
   - **anon public key**
3. Copia `.env.example` a `.env` y pega ahí esos dos valores.
4. Por defecto Supabase pide confirmar el email al registrarse. Para las pruebas iniciales puedes desactivarlo en **Authentication → Providers → Email → "Confirm email"** (desactívalo) para que las cuentas de prueba entren al instante.

## 2. Desarrollo local

```bash
npm install
npm run dev
```

## 3. Desplegar en Vercel

1. Sube este proyecto a un repositorio de GitHub.
2. En [vercel.com](https://vercel.com) → **Add New Project** → importa el repositorio.
3. En **Environment Variables** añade `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` con los mismos valores de tu `.env`.
4. Deploy. Vercel detecta Vite automáticamente (build command `vite build`, output `dist`).

## Estructura

- `src/lib` — cliente de Supabase y funciones de acceso a datos.
- `src/context` — sesión de usuario (`AuthContext`) y notificaciones (`ToastContext`).
- `src/components` — piezas reutilizables (chips, avatar, nav inferior, tarjeta de post).
- `src/screens` — las 5 pantallas: Descubrir, Siguiendo, Escribir, Perfil, Detalle de post, y el login.
- `supabase/schema.sql` — esquema completo de base de datos con RLS.
