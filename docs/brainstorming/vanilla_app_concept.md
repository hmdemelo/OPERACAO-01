# Vanilla App Brainstorming Log

## Understanding Summary
- **What is being built**: A complete, 1:1 replica of the current Next.js administrative/student dashboard application, but built entirely using raw HTML, CSS, and Vanilla JavaScript.
- **Why it exists**: To eliminate framework overhead, guarantee high performance on older devices/slow networks, reduce hosting costs to near zero, and provide absolute 100% control over every line of code without "black box" abstractions.
- **Who it is for**: The current users (Admins and Students) using the existing Operation/Study tracking dashboard.
- **Key constraints**: Must reach feature parity with the existing app (a "Big Bang" release approach). Must maintain the current premium visual aesthetic (rebuilding Shadcn/Tailwind-like components by hand in raw CSS).
- **Explicit non-goals**: We are not using React, Next.js, jQuery, or any large frontend framework. We are not storing data locally via IndexedDB as the primary source of truth (we need synchronization). We are not doing a gradual rollout (it will be fully rebuilt before replacing).

## Assumptions
- **Backend/API**: The data persistence will be handled by a lightweight, serverless/microservice external API (e.g., Cloudflare Workers + Supabase/Prisma) that serving JSON to the vanilla frontend.
- **Performance**: The vanilla implementation aims to be significantly faster in Time-to-Interactive (TTI) and First Contentful Paint (FCP) than the current SSR/Hydration model.
- **Authentication**: JWT or secure HTTP-only cookies will be handled between the Vanilla JS client and the microservice API.
- **Routing**: Since it's vanilla, routing will either be MPA (Multi-Page Application with real `.html` files) or a lightweight custom SPA hash/history router built in JS. Currently assuming an MPA approach for maximum simplicity and zero JS overhead on initial render.
- **Styling**: All CSS will be written by hand, likely utilizing CSS Variables (Custom Properties) heavily to achieve the dark mode and premium look without Tailwind.

## Open Questions
- None at this stage.

