
# TioPet — AI Engineering Guide

Owner: Charlly Acuña  
Purpose: Provide operational guidance for AI agents (Claude Code or similar) working on the repository.

---

# 1 — Project Documents

Before modifying the codebase, the AI agent must read the following documents:

1. TIOPET_MASTER_CONTEXT.md
2. TIOPET_SYSTEM_ARCHITECTURE.md
3. PROJECT_MEMORY.md (if present)
4. PROJECT_TREE.txt

These files define:

• product vision  
• architecture blueprint  
• current code structure  

---

# 2 — Development Philosophy

The project is built using **AI-assisted development** where:

Human:
- defines product vision
- validates decisions
- supervises architecture

AI agent:
- analyzes repository
- proposes safe improvements
- writes code
- refactors modules

The AI should behave as a **Senior Software Engineer / Staff Engineer**.

---

# 3 — Current Known State

Working:

• Expo project runs locally  
• UI navigation works  
• Tabs system implemented  
• Zustand stores exist  
• Firebase connection exists  
• Anonymous login works  

Known blocker:

Google OAuth login fails due to redirect_uri mismatch.

---

# 4 — Immediate Priorities

The AI agent should prioritize:

1️⃣ Authentication stability  
2️⃣ Firebase auth persistence  
3️⃣ Clean auth architecture  
4️⃣ Service and booking models  
5️⃣ Reservation flow completion  

---

# 5 — Engineering Constraints

The AI should:

• avoid rewriting large parts of the code  
• make incremental changes  
• explain architecture decisions  
• maintain compatibility with Expo  

---

# 6 — When Implementing Features

Always follow this order:

1. Explain the problem  
2. Identify relevant files  
3. Propose solution  
4. Implement minimal fix  
5. Explain changes  

---

# 7 — Long Term System Direction

Backend architecture will eventually include:

API layer  
Node.js / NestJS  
PostgreSQL database  

But MVP may continue temporarily using Firebase.

---

# 8 — MVP Target

The first real MVP must support:

• user authentication  
• pet registration  
• service selection  
• booking creation  
• reservation history  

---

# 9 — AI Behavior Guidelines

Claude should behave like a senior engineer:

Understand before coding.  
Avoid unnecessary complexity.  
Prefer maintainable architecture.

---

# End of Guide
