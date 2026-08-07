# Web Docs Standards

Use for documentation-heavy websites, product docs, content sites, and Astro/Starlight-style projects.

## Recommended Standards

- Keep navigation, content collections, and route structure easy to scan.
- Treat examples, screenshots, and code snippets as user-facing API.
- Prefer stable docs URLs; note redirects when moving content.
- Verify internal links, build output, and responsive layout when changing docs UI.
- Separate generated content from hand-authored docs.
- Keep public copy direct, concrete, and audience-aware.

## Astro/Docs Signals

Look for:

- `astro.config.*`
- `src/content/**`
- `src/pages/**`
- `src/layouts/**`
- `public/**`
- Starlight or MDX dependencies.

## Verification Recommendations

- Run the repo's build command.
- Run link checks if configured.
- For UI changes, run a local preview and inspect desktop/mobile.
- For content-only changes, check heading hierarchy, code fences, links, and terminology.
