<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Shared prompt placement protocol

When handing a prompt/instruction to the user for another AI agent, session, Goal, CLI, or UI surface, follow the canonical A-Wiki protocol at `aase7en/A-Wiki:docs/protocols/prompt-placement-protocol.md`. State exact `PLACEMENT`, `MODE`, `PURPOSE`, whether it replaces/appends/interrupts/queues, and `WHEN TO SEND` before the prompt. This does not override this repo's framework or safety rules.
