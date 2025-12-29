# 📖 The Grimar Hermetica: Documentation

Welcome to the official documentation for **The Grimar Hermetica** - a
self-hosted, offline-capable D&D 5e Progressive Web App.

## 🏗️ Architecture Overview

**Grimar** is a monolithic SvelteKit application built on Bun, featuring:

- **Frontend**: Svelte 5 with TypeScript
- **Backend**: Integrated SvelteKit API routes  
- **Database**: SQLite with Drizzle ORM
- **Deployment**: Self-hosted Docker with Traefik + Authentik
- **Design**: "Arcane Aero" glassmorphism theme

## 📋 Documentation Map

### 🎯 **Primary Specifications**

- **[SPECIFICATIONS.md](./SPECIFICATIONS.md)** - Complete feature specifications
and MVP requirements
- **[architecture-doc.md](./architecture-doc.md)** - Technical architecture and
system design

### 🎨 **Design & Style**

- **[STYLE_GUIDE.md](./STYLE_GUIDE.md)** - "Arcane Aero" design system and
visual guidelines
- **[arcane-design-sysem.md](./arcane-design-sysem.md)** - Component tokens and
accessibility rules

### 🧩 **Implementation Guides**

- **[COMPONENTS.md](./COMPONENTS.md)** - Component inventory and design patterns
- **[ROUTES.md](./ROUTES.md)** - Route structure and API endpoints
- **[COMPENDIUM_PAGES.md](./COMPENDIUM_PAGES.md)** - Compendium specifications
and interactions

---

## 🚀 Getting Started

### For Developers

1. **Review Architecture**: Start with `architecture-doc.md` to understand
system design
2. **Understand Design**: Read `STYLE_GUIDE.md` for aesthetic requirements
3. **Component Reference**: Use `COMPONENTS.md` for UI component guidance
4. **API Structure**: Consult `ROUTES.md` for endpoint specifications

### For Designers

1. **Design System**: `STYLE_GUIDE.md` provides complete aesthetic guidelines
2. **Component Library**: `COMPONENTS.md` shows available UI elements
3. **Color & Motion**: Reference design tokens in `arcane-design-sysem.md`

### For System Administrators

1. **Deployment**: See Docker configuration in `SPECIFICATIONS.md`
2. **Architecture**: Review system context in `architecture-doc.md`
3. **Requirements**: Technical stack and infrastructure needs

---

## 📊 Project Status

**Current Implementation**: 85% Complete

- **✅ Architecture**: Fully implemented and production-ready
- **✅ Design System**: Beautifully realized "Arcane Aero" theme
- **✅ Core Features**: Compendium, authentication, PWA working
- **⚠️ Character Management**: Basic framework, needs D&D mechanics
- **⚠️ Advanced Features**: Dice roller, export system pending

**Next Priorities**:

1. Character sheet mechanics implementation
2. Export functionality (JSON/PDF)
3. Character creator with templates
4. Dice roller with visual effects

---

## 🗂️ File Structure

```sh
docs/
├── SPECIFICATIONS.md      # Complete MVP specifications
├── architecture-doc.md   # Technical architecture
├── STYLE_GUIDE.md        # Visual design guidelines
├── COMPONENTS.md         # UI component inventory
├── ROUTES.md            # Route and API structure
├── COMPENDIUM_PAGES.md  # Compendium specifications
├── arcane-design-sysem.md # Design tokens & accessibility
└── README.md             # This file
```

---

## 💡 Key Concepts

### **"Arcane Aero" Design**

- Glassmorphism with depth and bevel effects
- Rich, saturated colors with gemstone accents
- Tactile, three-dimensional UI elements
- Modern interpretation of Frutiger Aero

### **"Local-First" Philosophy**

- Offline-capable PWA with smart caching
- Self-hosted deployment for data privacy
- Open5e SRD content cached locally
- Homebrew content shared server-wide

### **"Digital Grimoire" Approach**

- Reference tool for spells, monsters, items
- Character sheet management system
- Export and portability features
- Tabletop integration support

---

## 🔗 Related Resources

- **Codebase**: `/src` directory for implementation
- **AGENTS.md**: Development guide for AI agents and contributors
- **Package Configuration**: `../package.json` for dependencies
- **Docker Configuration**: `../Dockerfile` for deployment

---

## 📝 Contributing to Documentation

When updating documentation:

1. **Keep Consistency**: Maintain established formatting and terminology
2. **Cross-Reference**: Update related docs when making changes
3. **Version Control**: Document version changes in file headers
4. **Implementation Alignment**: Ensure docs match actual code implementation

---

**Last Updated**: v1.0.0  
**Maintainer**: The Grimar Development Team
