# TIOPET_DEV_PLAYBOOK.md

TioPet — Development Playbook

Author: Charlly Acuña  
Purpose: Define the development workflow for building TioPet using AI-assisted engineering tools.

---

# 1. Development Philosophy

TioPet is built using **AI-assisted development**.

Human role:

• product vision  
• architecture decisions  
• quality control  

AI role:

• code generation  
• debugging assistance  
• documentation generation  
• architecture suggestions

The human remains the **system architect**.

---

# 2. Core Development Tools

Primary tools used in the project.

### Cursor

Main development environment.

Used for:

• editing code  
• AI-assisted coding  
• repository analysis

---

### GitHub

Used for:

• version control  
• code history  
• collaboration

---

### Expo

Used for:

• React Native development  
• mobile testing  
• QR testing

---

### Node.js

Future backend runtime.

---

# 3. AI Tools Strategy

Multiple AI tools may assist development.

Possible tools:

• ChatGPT  
• Claude  
• Codex  
• Cursor AI

Each tool can assist different tasks.

---

# 4. Recommended Workflow

Step 1

Define the feature clearly.

Step 2

Write or update documentation.

Step 3

Ask AI to analyze repository context.

Step 4

Generate implementation proposal.

Step 5

Review code manually.

Step 6

Run local tests.

Step 7

Commit changes.

---

# 5. Repository Documentation Rules

Every major system should have a document.

Examples:

SYSTEM_ARCHITECTURE  
DATABASE_SCHEMA  
BACKEND_API  
ADMIN_PANEL_ARCHITECTURE  
CARE_GIVER_APP_ARCHITECTURE  
AI_SYSTEM

Documentation should evolve with the system.

---

# 6. Commit Philosophy

Commits should be clear and descriptive.

Examples:
feat: add booking QR system
fix: stabilize booking store hydration
docs: add TioPet AI system architecture


---

# 7. Safe Development Practices

Always:

• review AI-generated code
• test edge cases
• avoid large unverified changes

AI suggestions must be validated.

---

# 8. Feature Development Cycle

Each feature follows this cycle:

Idea → Design → Documentation → Implementation → Testing → Deployment

---

# 9. Testing Strategy

Minimum testing includes:

• booking flow
• pet creation
• QR validation
• store purchases
• notifications

Future expansion may include automated tests.

---

# 10. AI Collaboration Model

The AI acts as:

• technical assistant
• code reviewer
• architecture advisor

The human acts as:

• product owner
• system architect
• final decision maker

---

# 11. Scaling the Codebase

As the project grows:

Separate modules:

Mobile App  
Backend API  
Admin Panel  
AI Systems

Each module should remain loosely coupled.

---

# 12. Learning Philosophy

Every development step should increase knowledge.

Goals:

• improve engineering skills
• understand system architecture
• learn AI-assisted development

---

# 13. Long-Term Vision

The objective is to build:

• a scalable platform
• a trusted pet care ecosystem
• a modern AI-assisted product

---

# End of Document