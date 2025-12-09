# CLAUDE.md - FaceIQ Project Guide

## Project Overview

**FaceIQ** (package name: `clav`) is an advanced AI-powered facial aesthetics analysis and looksmaxxing coach application. The app uses Google's Gemini AI to analyze facial features, provide personalized improvement advice, compare faces, and offer coaching on aesthetics and self-improvement.

**Key Features:**
- **Face Analysis**: AI-powered facial feature scoring and tier classification
- **Mog Checker**: Compare two faces to determine aesthetic superiority
- **AI Coach**: Conversational AI for personalized advice on fitness, skincare, and aesthetics
- **Daily Tasks**: Guided improvement tasks for users
- **Radar Charts**: Visual representation of facial feature scores

**AI Studio App URL**: https://ai.studio/apps/drive/1wn6BXZh0M0LRzfS8diLdoRJHnqxMC-Bg

---

## Tech Stack

### Core Dependencies
- **React**: 19.2.1 - UI framework
- **TypeScript**: ~5.8.2 - Type safety
- **Vite**: ^6.2.0 - Build tool and dev server
- **Firebase**: ^12.6.0 - Backend services
- **@google/genai**: ^1.31.0 - Google Gemini AI integration
- **lucide-react**: ^0.556.0 - Icon library

### Development Tools
- **@vitejs/plugin-react**: ^5.0.0 - Vite React plugin
- **@types/node**: ^22.14.0 - Node.js type definitions
- **Vitest**: Testing framework (configured in commits)

---

## Project Structure

```
FaceiQ/
├── components/          # React components
│   ├── Auth.tsx        # Authentication component
│   ├── RadarChart.tsx  # SVG-based radar chart visualization
│   └── ScoreCard.tsx   # Score display card component
├── services/           # Business logic and API integrations
│   └── geminiService.ts # Gemini AI API wrapper
├── App.tsx             # Main application component
├── index.tsx           # React entry point
├── types.ts            # TypeScript type definitions
├── index.html          # HTML entry point
├── vite.config.ts      # Vite configuration
├── tsconfig.json       # TypeScript configuration
├── package.json        # Dependencies and scripts
├── metadata.json       # App metadata (name, description, permissions)
├── .gitignore          # Git ignore patterns
└── README.md           # User-facing documentation
```

### File Structure Notes
- **Flat structure**: Source files are in the root directory, NOT in a `src/` folder
- **Path aliases**: Use `@/` to reference root directory (configured in vite.config.ts and tsconfig.json)
- **Components**: Organized in `/components` directory
- **Services**: API integrations and business logic in `/services`

---

## Key Files and Their Responsibilities

### App.tsx (Root Component)
**Lines**: ~1400+ lines (large monolithic component)

**State Management:**
- Tab navigation (scan, extras, daily, coach, rating)
- Analysis state (image, progress, results)
- Camera state (stream, facing mode)
- Chat history and AI coach interactions
- Mog checker state (two images, comparison results)
- Daily tasks completion tracking

**Key Features:**
- File upload and camera capture
- Real-time facial analysis
- AI coach chat interface
- Face comparison ("mog checker")
- Daily task management
- Swipe gestures for mobile navigation

**Important Constants:**
- `HERO_IMAGE_URL` (line 11): Default hero image URL

### types.ts (Type Definitions)
**Core Interfaces:**
- `AnalysisResult`: Face analysis scores and feedback structure
- `MogResult`: Face comparison results
- `ChatMessage`: Chat message structure
- `AppTab`: Application tab enumeration

**Important Constants:**
- `TIER_MAP`: Score ranges to aesthetic tier mapping
- `DAILY_TASKS`: Predefined daily improvement tasks
- `COACH_TOPICS`: AI coach conversation starters

### services/geminiService.ts (AI Integration)
**Functions:**
- `analyzeFace(imageBase64: string)`: Analyzes facial features using Gemini AI
- `compareFaces(image1: string, image2: string)`: Compares two faces
- `getCoachResponse(history: ChatMessage[], userMessage: string)`: AI coach chat

**Schemas:**
- `ANALYSIS_SCHEMA`: Structured output schema for face analysis
- `MOG_SCHEMA`: Structured output schema for face comparison

**API Configuration:**
- Uses `process.env.API_KEY` for Gemini API authentication

### components/RadarChart.tsx (Visualization)
**Props:**
- `data`: Array of `{label: string, value: number}` objects (0-100 scale)
- `size`: Chart dimensions in pixels (default: 300)

**Implementation:**
- Pure SVG rendering
- Responsive design with centered layout
- Glow effects using SVG filters
- Background web grid at 20% intervals

### vite.config.ts (Build Configuration)
**Key Settings:**
- Server port: 3000
- Host: 0.0.0.0 (accessible externally)
- Path alias: `@` → project root
- Environment variables: `GEMINI_API_KEY` exposed as `process.env.API_KEY`

---

## Development Workflow

### Environment Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file in the root directory:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```
   Server runs at: http://localhost:3000

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Preview production build:**
   ```bash
   npm preview
   ```

### Git Workflow

**Current Branch**: `claude/claude-md-miy5t48v5wdlz3u7-014WAtaTPsuN1WNMrhYXoDaS`

**Commit Message Conventions** (from git history):
- `feat:` - New features
- `refactor:` - Code refactoring
- `chore:` - Maintenance tasks
- `fix:` - Bug fixes

**Example commits:**
- `feat: Add ShareCard component for Instagram Stories sharing`
- `refactor: Rename project and clean up dependencies`
- `chore: Add package-lock.json from npm install`

---

## Code Conventions and Patterns

### TypeScript
- **Strict mode enabled**: All code must be type-safe
- **No implicit any**: Always define types explicitly
- **Interface over Type**: Use `interface` for object shapes
- **Enums for constants**: Use `enum` for fixed sets of values (e.g., `AppTab`)

### React Patterns
- **Functional Components**: Use `React.FC` pattern with TypeScript
- **Hooks**: Modern React hooks (useState, useRef, useEffect)
- **Props typing**: Always type component props with interfaces
- **Naming**: Component files use PascalCase (e.g., `RadarChart.tsx`)

### State Management
- **Local state**: Currently uses React useState (no Redux/Context)
- **Refs**: useRef for DOM manipulation and gesture tracking
- **Side effects**: useEffect for camera streams, auto-scrolling

### Styling
- **Utility-first CSS**: Tailwind CSS classes inline in JSX
- **Responsive design**: Mobile-first approach
- **Color schemes**: Gradients and neon effects for modern aesthetic
- **Dark theme**: Primary color scheme is dark mode

### File Organization
- **Imports order**: React → Icons → Types → Services → Components
- **Path aliases**: Use `@/` for root imports (e.g., `@/types`, `@/services/geminiService`)
- **Relative imports**: For same-directory files

### API Integration
- **Environment variables**: Access via `process.env.API_KEY`
- **Error handling**: Try-catch blocks with user-friendly alerts
- **Structured output**: Use Gemini schemas for consistent AI responses
- **Base64 encoding**: Images sent to API as base64 strings

---

## Testing

**Framework**: Vitest (configured but test files not yet present)

**Testing Conventions** (to follow):
- Test files: `*.test.tsx` or `*.spec.tsx`
- Location: Co-located with source files or in `__tests__` directories
- Coverage: Aim for critical business logic in services

---

## Common Tasks for AI Assistants

### Adding a New Component

1. Create file in `/components` directory with PascalCase name
2. Use React.FC pattern with typed props interface
3. Import types from `@/types`
4. Use Tailwind CSS for styling
5. Export as default

**Example:**
```typescript
import React from 'react';

interface MyComponentProps {
  title: string;
  value: number;
}

const MyComponent: React.FC<MyComponentProps> = ({ title, value }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h2 className="text-xl font-bold">{title}</h2>
      <p>{value}</p>
    </div>
  );
};

export default MyComponent;
```

### Adding a New Type

1. Add to `types.ts` file
2. Use `interface` for object shapes
3. Use `export` to make available throughout app
4. Add JSDoc comments for complex types

### Adding a New Service Function

1. Add to appropriate service file in `/services`
2. Handle errors gracefully
3. Use TypeScript for parameters and return types
4. Import and use defined interfaces from `@/types`

### Modifying Gemini AI Integration

**Important**:
- Schema modifications require updating both the schema definition and the corresponding TypeScript interface
- Always validate schema matches the expected interface
- Test with various inputs to ensure consistent responses

### Working with Camera/Media

- Camera streams must be properly cleaned up in useEffect return
- Handle permission denials gracefully
- Support both front and rear cameras (facingMode)
- Stop all tracks when closing camera

### State Updates

- Use functional updates for state that depends on previous state
- Avoid direct state mutations
- Keep state updates atomic and predictable

---

## Environment Variables

**Required:**
- `GEMINI_API_KEY`: Google Gemini API key for AI features

**Configuration:**
- Store in `.env.local` file (not committed to git)
- Accessed via `process.env.API_KEY` in code
- Defined in `vite.config.ts` for build-time injection

---

## Known Issues and Considerations

### Architecture
- **Monolithic App.tsx**: Main component is very large (~1400+ lines). Consider breaking into smaller components for maintainability.
- **No state management library**: Currently uses local state. Consider Redux/Zustand if complexity grows.
- **No routing**: Single-page app with tab navigation. Consider React Router if multiple pages needed.

### Security
- **API Key exposure**: API key is bundled in client code. Consider backend proxy for production.
- **Input validation**: Ensure image uploads are validated before processing

### Performance
- **Large component re-renders**: App.tsx re-renders may be expensive. Consider React.memo for child components.
- **Image processing**: Base64 encoding large images can be memory-intensive

---

## Best Practices for AI Assistants

### When Making Changes

1. **Read before modifying**: Always read the full file before making edits
2. **Preserve formatting**: Maintain existing indentation and style
3. **Type safety**: Ensure all changes are type-safe
4. **Test integration**: Verify changes work with Gemini API schemas
5. **Update types**: If adding new data structures, update `types.ts`

### When Adding Features

1. **Check existing patterns**: Follow established code style
2. **Avoid over-engineering**: Keep solutions simple and focused
3. **Mobile-first**: Ensure UI works on mobile devices
4. **Accessibility**: Consider keyboard navigation and screen readers
5. **Error handling**: Always handle API failures gracefully

### When Refactoring

1. **Incremental changes**: Make small, testable changes
2. **Preserve functionality**: Ensure existing features continue working
3. **Update imports**: Fix all import paths if moving files
4. **Update documentation**: Keep this file in sync with codebase

### When Debugging

1. **Check environment**: Verify `GEMINI_API_KEY` is set
2. **Console errors**: Look for browser console errors
3. **Network tab**: Check API requests/responses
4. **Camera permissions**: Verify browser has camera access
5. **TypeScript errors**: Run `npx tsc --noEmit` to check types

---

## Project Context

### Origin
- Generated from AI Studio (Google)
- Originally named "clav", renamed to "FaceIQ"
- Designed for mobile-first aesthetic analysis

### Target Audience
- Users interested in self-improvement and aesthetics
- "Looksmaxxing" community members
- Individuals seeking objective facial analysis

### Aesthetic Philosophy
- Brutally honest feedback
- Data-driven analysis
- Gamified improvement tracking
- Modern, neon-accented dark UI

---

## Quick Reference

### Important File Paths
- Main app: `/App.tsx`
- Types: `/types.ts`
- AI service: `/services/geminiService.ts`
- Config: `/vite.config.ts`
- Entry: `/index.tsx`

### Key Constants Locations
- Tier mappings: `types.ts:42-50`
- Daily tasks: `types.ts:52-58`
- Coach topics: `types.ts:60-66`
- Hero image URL: `App.tsx:11`

### Port and URLs
- Dev server: `http://localhost:3000`
- Host: `0.0.0.0` (externally accessible)
- AI Studio: https://ai.studio/apps/drive/1wn6BXZh0M0LRzfS8diLdoRJHnqxMC-Bg

---

## Changelog

### 2025-12-09
- Initial CLAUDE.md creation
- Documented current codebase structure (as of commit 1c427a1)
- Established conventions and best practices for AI assistants

---

**Last Updated**: 2025-12-09
**Codebase Version**: Commit 1c427a1 (refactor: Rename project and clean up dependencies)
