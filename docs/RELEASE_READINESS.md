# LuminaWall — Release readiness update

## Completed in this revision

- Fixed aurora, waves and landscape noise initialization to use the seeded PRNG. Same seed remains stable across intervening renders. Added light/dark regression coverage; compared hashes to keep failures readable.
- Integrated approved Lightfold into header/footer via Logo and LogoMark. Entrance/hover and brand/ring loading animations are used by studio and labs and honor reduced motion. Generated new favicon, app icons and Open Graph artwork. SVG Spinners MIT license remains distributed with assets.
- Added resolveSiteURL validation, production config check and build:production. The release build rejects localhost, IPs, HTTP and placeholders. Vercel production enforces this automatically; other production hosts should set REQUIRE_PRODUCTION_URL=true.
- Added metadata smoke checks to CI, with read-only repository permissions and a 15-minute timeout. CI uses an explicitly labeled fixture origin; it does not deploy.
- Updated documentation and environment template.

## Verified locally

- npm test: 45 passing, 0 failing.
- npm run lint and npm run typecheck: pass.
- npm audit --audit-level=high: 0 vulnerabilities.
- npm run build: success. Existing Windows webpack cache snapshot warning and Next ESLint-plugin warning remain; standalone lint/type checking passed.
- npm run smoke:metadata: pass for the current local origin. All four canonical routes and robots/sitemap checked against that origin.
- Browser: Lightfold SVG present with lightfold-unfold animation. Studio iPhone preview and PNG download succeeded after integration; no captured browser errors.
- Source access restored to D:\LuminaWall.
- GitHub Actions query returned no recorded workflow runs. Local checks are verified; remote CI success is not claimed.

## Still required for production sign-off

The real public domain has not been supplied. Set NEXT_PUBLIC_SITE_URL (or Vercel's production URL), run npm run build:production and check generated metadata against the intended domain. Verify the deployed staging/production environment, HTTPS and target browsers; retain the previous deployment for rollback. No deployment or push performed in this revision.

Local server: http://127.0.0.1:3000. A local build does not establish that the public deployment is ready.
