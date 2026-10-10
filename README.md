# 🎨 LuminaWall — Procedural Minimalist Wallpaper Studio

> **"Wallpapers that feel *designed*, not generated."**
> 
> *A 100% client-side, client-rendered procedural wallpaper generator powered by mathematical chaos theory, physics simulations, and generative art.*

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Canvas API](https://img.shields.io/badge/HTML5-Canvas_API-E34F26?style=for-the-badge&logo=html5)](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
[![License](https://img.shields.io/badge/License-MIT-green.style=for-the-badge)](LICENSE)

---

## 💥 Why LuminaWall? (The Hard Sell)

Stop downloading generic stock wallpapers compressed to oblivion. **LuminaWall** gives you ultra-crisp, mathematical art rendered in real-time right inside your browser.

- **Client-side rendering**: Artwork is processed in the browser without an image-generation API. Rendering time and export limits depend on the device.
- 📱 **True Multi-Device Resolution**: Direct export in native **Desktop 4K** (3840×2160), **iPhone Retina** (1320×2868), **MacBook Liquid Retina** (3024×1964), and **iPad** (2064×2752).
- 🎯 **Curated Aesthetics**: No random ugly color clashes. Hand-crafted color palettes (*Obsidian Gold*, *Royal Velvet*, *Sage & Platinum*, *Monaco Midnight*) engineered for modern dark/light desk setups.
- 📐 **Device Frame Mockup**: SVG device preview inside device bezels (Dynamic Island for iPhone, Notch for MacBook) so you see exact alignment before exporting.

---

## 🧮 Fun Facts & Mathematical / Physics Foundations

Behind LuminaWall's minimal aesthetic lies complex mathematics and physical simulations. Here is the science powering each wallpaper generator:

### 1. 🌀 Strange Attractors (Chaos Theory & Dynamic Systems)
Used in **Attractor Lab (`/attractor`)** and **Lorenz / Cosmic** generators.
* **The Math**: Iteratively solves system of non-linear differential equations:
  $$\text{Clifford: } x_{n+1} = \sin(a y_n) + c \cos(a x_n), \quad y_{n+1} = \sin(b x_n) + d \cos(b y_n)$$
  $$\text{de Jong: } x_{n+1} = \sin(a y_n) - \cos(b x_n), \quad y_{n+1} = \sin(c x_n) - \cos(d y_n)$$
* **Fun Fact**: Attractors plot millions of points moving through phase space. Small tweaks in parameters ($a, b, c, d$) trigger the **Butterfly Effect**—completely reshaping the visual geometry from delicate silk ribbons to cosmic black holes!

### 2. 🎵 Chladni Nodal Resonance (Acoustics & Wave Physics)
Used in the **Chladni** generator.
* **The Physics**: Simulates Ernst Chladni's 1787 physical experiment where sand particles settle along static nodal lines on a vibrating metal plate subjected to sound frequencies:
  $$f(x, y) = a \cdot \cos\left(\frac{n \pi x}{L}\right) \cos\left(\frac{m \pi y}{L}\right) - b \cdot \cos\left(\frac{m \pi x}{L}\right) \cos\left(\frac{n \pi y}{L}\right) = 0$$
* **Fun Fact**: Higher modal integers ($m, n$) simulate higher sound frequencies (pitches). Particles naturally dance away from high-vibration zones and collect in zero-displacement lines, creating sacred geometry!

### 3. 🌊 Simplex Vector Flow Fields (Fluid Dynamics)
Used in **Flow** and **Waves** generators.
* **The Physics**: Simulates 2D particle advection through a velocity field driven by Fractional Brownian Motion (fBm) Simplex Noise (inspired by the Navier-Stokes equations for fluid mechanics).
* **Fun Fact**: Rather than drawing static lines, LuminaWall spawns thousands of virtual particles floating through noise turbulence fields, creating organic ribbon effects resembling smoke or liquid silk.

### 4. 🌿 Lindenmayer Systems (L-Systems & Fractal Botany)
Used in **L-System Lab (`/lsystem`)**.
* **The Math**: String rewriting formal grammar introduced by Aristid Lindenmayer in 1968 to model plant development:
  $$\text{Dragon Curve: } X \to X + Y F +, \quad Y \to - F X - Y$$
* **Fun Fact**: A simple 3-rule grammar repeated 12 times generates thousands of self-similar geometric segments, producing natural structures like ferns, trees, and space-filling space curves (Hilbert Curve).

### 5. 🔮 Julia & Mandelbrot Complex Dynamics
Used in **Julia** generator.
* **The Math**: Iterates complex function quadratic polynomials:
  $$z_{n+1} = z_n^2 + c \quad (z, c \in \mathbb{C})$$
* **Fun Fact**: Points are colored based on how quickly the orbit escapes to infinity. The boundary between escape and convergence forms infinite fractal self-similarity!

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Turbopack)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Graphics Engine**: HTML5 2D Canvas API
- **Icons & UI**: [Lucide React](https://lucide.dev/) and CSS/SVG motion

---

## 💻 Getting Started Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/loxleyftsck/LuminaWall.git
   cd LuminaWall
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📄 License

Distributed under the **MIT License**. Free for personal and commercial wallpaper generation!

---

<p center>
  Crafted with ❤️ by <b>loxleyftsck</b> • Powered by Mathematics & Code
</p>

## Production release checks

Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm audit --audit-level=high` before releasing.

Set `NEXT_PUBLIC_SITE_URL` to the actual HTTPS public origin, with no path, query, credentials or fragment. Then run `npm run build:production`. This command validates the public origin before compiling and rejects localhost, IP addresses, insecure HTTP and placeholder domains. Vercel production can derive its origin from `VERCEL_PROJECT_PRODUCTION_URL` when the explicit variable is absent. On other hosting providers, use `REQUIRE_PRODUCTION_URL=true` in the production environment as well. Keep the environment value consistent between build and runtime.

For local development, the default is `http://localhost:3000`. A local build is not production-domain verification. After starting the built server, run `npm run smoke:metadata`; `SMOKE_BASE_URL` selects the server being inspected, while `NEXT_PUBLIC_SITE_URL` selects the expected canonical origin. Checks cover canonical URLs on all four routes and the generated robots/sitemap URLs.

The GitHub workflow runs the quality checks and starts the built server for metadata smoke checks using an explicitly marked CI fixture domain. CI does not deploy. Configure the real domain in the deployment environment, and verify staging/production before exposing the release.

Lightfold logo/motion assets are under `public/brand`, `public/animations`, `components/LogoMark.tsx`, `components/LoadingIndicator.tsx` and `app/lightfold-motion.css`. The ring loading path is adapted from SVG Spinners, with its MIT notice retained at `public/animations/SVG-SPINNERS-LICENSE.txt`. Animations respect reduced motion. PNG exports contain the artwork only.

Rollback: retain the previous deployment/build and its environment configuration. Revert the release if preview/export fails, metadata points to the wrong origin, or a target browser cannot complete the main workflow.
