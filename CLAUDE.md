# CLAUDE.md - AI Assistant Guide for FaceiQ

## Project Overview

**FaceiQ** is an AI-powered facial aesthetics analysis and looksmaxxing coach application built with React, TypeScript, and Vite. The app uses Google's Gemini AI (gemini-2.5-flash model) to analyze facial features, compare faces, and provide personalized coaching advice.

**Key Features:**
- Facial aesthetics analysis with detailed scoring
- Face comparison ("Mog Checker")
- AI coaching chat interface
- Daily tasks and improvement tracking
- Mock authentication system

## Codebase Structure

```
/
├── components/           # React UI components
│   ├── Auth.tsx         # Authentication UI component
│   └── ScoreCard.tsx    # Score display card component
├── services/            # Business logic and external integrations
│   ├── geminiService.ts # Google Gemini AI integration
│   └── firebase.ts      # Mock authentication service
├── App.tsx              # Main application component
├── index.tsx            # React app entry point
├── types.ts             # TypeScript type definitions
├── index.html           # HTML entry point
├── vite.config.ts       # Vite build configuration
├── tsconfig.json        # TypeScript configuration
├── package.json         # Dependencies and scripts
└── metadata.json        # App metadata
```

## Technology Stack

### Core Technologies
- **React 19.2.1** - UI library
- **TypeScript 5.8.2** - Type-safe JavaScript
- **Vite 6.2.0** - Build tool and dev server

### Key Dependencies
- **@google/genai ^1.31.0** - Google Gemini AI SDK
- **lucide-react ^0.556.0** - Icon library
- **firebase ^12.6.0** - Authentication (currently mocked)

### Development Tools
- **@vitejs/plugin-react** - React plugin for Vite
- **@types/node** - Node.js type definitions

## Key Components and Services

### Components

#### `App.tsx` (Main Component)
- **Location:** `/App.tsx`
- **Purpose:** Root component managing all app state and tabs
- **Key State:**
  - `activeTab`: Current tab (SCAN, EXTRAS, DAILY, COACH)
  - `selectedImage`: Image for analysis
  - `result`: Analysis results from Gemini
  - `chatHistory`: AI coach conversation history
  - `mogImage1/mogImage2`: Images for face comparison
- **Tabs:** SCAN (analysis), EXTRAS (mog checker), DAILY (tasks), COACH (chat)

#### `components/ScoreCard.tsx`
- **Purpose:** Displays individual score metrics with color-coded progress bars
- **Props:** `label`, `score`, `color?`, `fullWidth?`
- **Color Logic:**
  - 80+: Green (accent)
  - 60-79: Purple (primary)
  - 40-59: Orange (warning)
  - <40: Red (danger)

#### `components/Auth.tsx`
- **Purpose:** Login/signup UI component
- **Features:** Email/password authentication, error handling, profile updates

### Services

#### `services/geminiService.ts`
**Core AI Integration Service**

Functions:
1. **`analyzeFace(base64Image: string): Promise<AnalysisResult>`**
   - Analyzes facial aesthetics using gemini-2.5-flash
   - Returns structured scores and tier classification
   - Schema-validated JSON responses

2. **`compareFaces(img1: string, img2: string): Promise<MogResult>`**
   - Compares two faces to determine dominance
   - Returns winner, score diff, and roast

3. **`getCoachResponse(message: string, history: any[]): Promise<string>`**
   - Chat interface for looksmaxxing coaching
   - Maintains conversation history
   - Short, actionable Gen-Z style responses

**Schema Definitions:**
- `ANALYSIS_SCHEMA`: Structured facial analysis output
- `MOG_SCHEMA`: Face comparison result format

#### `services/firebase.ts`
**Mock Authentication Service**

- **Class:** `MockAuthService`
- **Storage:** localStorage-based persistence
- **Key Methods:**
  - `signInWithEmailAndPassword()`
  - `createUserWithEmailAndPassword()`
  - `signOut()`
  - `onAuthStateChanged()`
- **Note:** Currently a mock implementation; can be replaced with real Firebase

### Type Definitions (`types.ts`)

```typescript
// Core interfaces
AnalysisResult - Facial analysis scores and feedback
MogResult - Face comparison results
ChatMessage - Chat message structure
AppTab - Tab enum (SCAN, EXTRAS, DAILY, COACH)

// Constants
TIER_MAP - Score ranges to tier labels
DAILY_TASKS - Daily improvement tasks
COACH_TOPICS - Coaching conversation topics
```

## Development Workflows

### Local Development

```bash
# Install dependencies
npm install

# Set up environment
# Create .env.local and add:
# GEMINI_API_KEY=your_gemini_api_key

# Start dev server (runs on port 3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables

**Required:**
- `GEMINI_API_KEY` - Google Gemini API key (set in `.env.local`)

**Vite Config Mapping:**
- Maps to `process.env.API_KEY` and `process.env.GEMINI_API_KEY` in code
- Loaded via `loadEnv()` in vite.config.ts

### Dev Server Configuration

```typescript
// vite.config.ts
server: {
  port: 3000,
  host: '0.0.0.0', // Accessible from network
}
```

## Coding Conventions

### TypeScript Standards

1. **Strict Typing:** Always use explicit types, avoid `any`
2. **Interface Definitions:** Define interfaces in `types.ts` for shared types
3. **Path Aliases:** Use `@/` prefix for imports (resolves to project root)
   ```typescript
   import { AnalysisResult } from '@/types';
   ```

4. **Experimental Decorators:** Enabled in tsconfig.json
5. **Module System:** ES2022 with ESNext modules

### React Patterns

1. **Functional Components:** Use `React.FC` type annotation
   ```typescript
   const Component: React.FC<Props> = ({ prop }) => { ... }
   ```

2. **State Management:**
   - Use `useState` for local state
   - No external state management (Redux, Zustand, etc.)
   - State lifted to App.tsx for cross-tab communication

3. **Effects:**
   - `useEffect` for auth listeners, auto-scroll
   - Cleanup functions for subscriptions

4. **Refs:**
   - `useRef` for file inputs, DOM manipulation, gesture tracking

### Styling

- **Framework:** Tailwind CSS (via className strings)
- **Color Scheme:**
  - `brand-primary`: Purple
  - `brand-accent`: Green
  - `brand-warn`: Orange
  - `brand-danger`: Red
  - `brand-card`: Card backgrounds
- **Responsive:** Mobile-first design patterns
- **Icons:** lucide-react library

### File Organization

- **Components:** React components in `components/`
- **Services:** Business logic, API calls in `services/`
- **Types:** Shared interfaces in root `types.ts`
- **Root Level:** Main app files (App.tsx, index.tsx)

### Naming Conventions

- **Files:** PascalCase for components (`Auth.tsx`), camelCase for services (`geminiService.ts`)
- **Components:** PascalCase (`ScoreCard`, `Auth`)
- **Functions:** camelCase (`analyzeFace`, `handleFileSelect`)
- **Types/Interfaces:** PascalCase (`AnalysisResult`, `MogResult`)
- **Constants:** UPPER_SNAKE_CASE (`TIER_MAP`, `DAILY_TASKS`)
- **Enums:** PascalCase with UPPER_CASE values (`AppTab.SCAN`)

## API Integration

### Gemini AI Integration

**Model:** `gemini-2.5-flash`

**Usage Patterns:**

1. **Structured Output:**
   ```typescript
   ai.models.generateContent({
     model: 'gemini-2.5-flash',
     contents: { parts: [...] },
     config: {
       responseMimeType: "application/json",
       responseSchema: SCHEMA
     }
   })
   ```

2. **Chat Interface:**
   ```typescript
   const chat = ai.chats.create({
     model: 'gemini-2.5-flash',
     config: { systemInstruction: "..." },
     history: [...]
   });
   const response = await chat.sendMessage({ message });
   ```

3. **Image Processing:**
   - Images sent as base64 strings
   - Remove data URL header before API call: `base64.split(',')[1]`
   - MIME type: `image/jpeg`

**Error Handling:**
- All API functions have try/catch blocks
- Fallback mock data on API failure
- Console error logging

## State Management

### App-Level State

All primary state lives in `App.tsx`:

```typescript
// Auth
const [user, setUser] = useState<FirebaseUser | null>(null);
const [authLoading, setAuthLoading] = useState(true);

// Navigation
const [activeTab, setActiveTab] = useState<AppTab>(AppTab.SCAN);

// Analysis
const [selectedImage, setSelectedImage] = useState<string | null>(null);
const [isAnalyzing, setIsAnalyzing] = useState(false);
const [result, setResult] = useState<AnalysisResult | null>(null);

// Chat
const [chatHistory, setChatHistory] = useState<ChatMessage[]>([...]);
const [chatInput, setChatInput] = useState('');
const [isChatLoading, setIsChatLoading] = useState(false);

// Mog Checker
const [mogImage1, setMogImage1] = useState<string | null>(null);
const [mogImage2, setMogImage2] = useState<string | null>(null);
const [mogResult, setMogResult] = useState<MogResult | null>(null);
```

### State Flow

1. **Image Upload** → FileReader → Base64 → State → API Call
2. **Analysis** → Loading state → API response → Result state
3. **Chat** → User input → History update → API call → Response append
4. **Auth** → Firebase listener → User state update

## Git Workflow

### Branch Strategy

- **Main Branch:** Primary development branch
- **Feature Branches:** `claude/claude-md-*` pattern for AI-assisted development
- **Convention:** Always develop on designated feature branches

### Commit Messages

Follow conventional commit style:
- `feat:` New features
- `fix:` Bug fixes
- `chore:` Maintenance tasks
- `docs:` Documentation updates
- `refactor:` Code restructuring
- `style:` Formatting changes

### Recent Commits (as of Dec 7, 2025)
```
0533f72 chore: Remove deprecated webpack CI workflow
8dfd509 Add GitHub Actions workflow for Webpack build
33dfe19 feat: Initialize FaceiQ project with Vite
209d399 Initial commit
```

## Testing & Build

### Build Commands

```bash
# Development build with HMR
npm run dev

# Production build (outputs to dist/)
npm run build

# Preview production build locally
npm run preview
```

### Build Configuration

- **Output:** `dist/` directory
- **Bundler:** Vite with esbuild
- **React Plugin:** Fast Refresh enabled
- **Environment:** Environment variables injected at build time

### No Testing Framework Currently

The project does not currently have:
- Unit tests
- Integration tests
- E2E tests

**Recommendation:** Consider adding Vitest for testing

## Common Development Tasks

### Adding a New Component

1. Create file in `components/ComponentName.tsx`
2. Use functional component pattern with TypeScript
3. Define props interface if needed
4. Export default
5. Import in App.tsx or parent component

Example:
```typescript
import React from 'react';

interface MyComponentProps {
  title: string;
  onAction: () => void;
}

const MyComponent: React.FC<MyComponentProps> = ({ title, onAction }) => {
  return (
    <div className="bg-brand-card p-4 rounded-xl">
      <h2>{title}</h2>
      <button onClick={onAction}>Click Me</button>
    </div>
  );
};

export default MyComponent;
```

### Adding a New API Service

1. Add function to `services/geminiService.ts`
2. Define response type in `types.ts`
3. Create schema if using structured output
4. Add error handling with fallback
5. Export function

### Adding New Types

1. Add interface/type to `types.ts`
2. Export for use across components
3. Use PascalCase naming
4. Document complex types with JSDoc comments

### Modifying Gemini Prompts

Prompts are defined inline in `services/geminiService.ts`:
- **Analysis Prompt:** Lines 72-86
- **Comparison Prompt:** Lines 121-128
- **Coach System Instruction:** Lines 159-176

**Guidelines:**
- Keep prompts concise and directive
- Use schema constraints for output structure
- Test thoroughly after changes

## Important Notes for AI Assistants

### Architecture Decisions

1. **Mock Auth:** Firebase is currently mocked for demo purposes
   - Real Firebase integration ready to be implemented
   - Replace `services/firebase.ts` when ready

2. **Single Component State:** All state in App.tsx
   - Consider state management library if app grows significantly
   - Current pattern works well for current scope

3. **No Routing:** Single-page app with tab-based navigation
   - Consider React Router if URL routing needed

4. **API Key Security:**
   - Currently uses env vars
   - Consider backend proxy for production
   - Never commit `.env.local`

### Performance Considerations

1. **Image Processing:** Base64 encoding can be memory-intensive
   - Consider image compression before upload
   - Current implementation works for typical face photos

2. **API Calls:** Gemini calls are async and can take 2-5 seconds
   - Loading states implemented
   - Consider request debouncing for rapid actions

3. **Chat History:** Stored in component state
   - Consider localStorage persistence
   - Limit history size for long conversations

### Security Considerations

1. **API Keys:** Exposed in client-side code via env vars
   - Acceptable for demo/development
   - **Production:** Move to backend proxy

2. **Image Upload:** Client-side only
   - No server-side validation
   - Consider content filtering for production

3. **Auth:** Mock implementation
   - Replace with real auth before production
   - Add proper session management

### Extension Points

**Easy to Add:**
- New coaching topics (edit `COACH_TOPICS` in types.ts)
- New daily tasks (edit `DAILY_TASKS` in types.ts)
- New score metrics (extend `AnalysisResult` interface)
- Additional tabs (add to `AppTab` enum)

**Moderate Complexity:**
- User profile persistence
- History/results storage
- Social features (sharing results)
- Premium features / paywalls

**Significant Effort:**
- Real-time camera capture
- Video analysis
- Mobile native apps
- Backend infrastructure

## Quick Reference

### Key Files to Modify

| Task | Files to Edit |
|------|---------------|
| Add UI component | `components/NewComponent.tsx`, `App.tsx` |
| Modify AI behavior | `services/geminiService.ts` |
| Add new types | `types.ts` |
| Change auth flow | `services/firebase.ts`, `components/Auth.tsx` |
| Adjust build config | `vite.config.ts` |
| Update dependencies | `package.json` |

### Environment Setup Checklist

- [ ] Node.js installed
- [ ] Run `npm install`
- [ ] Create `.env.local` file
- [ ] Add `GEMINI_API_KEY=your_key` to `.env.local`
- [ ] Run `npm run dev`
- [ ] Navigate to `http://localhost:3000`

### Troubleshooting

**Issue:** API calls failing
- Check `GEMINI_API_KEY` in `.env.local`
- Verify API quota not exceeded
- Check network connectivity

**Issue:** Build errors
- Run `npm install` to ensure dependencies are installed
- Check TypeScript errors with `npx tsc --noEmit`
- Clear `node_modules` and reinstall if needed

**Issue:** Hot reload not working
- Restart dev server
- Check file is saved
- Verify Vite config is correct

---

**Last Updated:** December 7, 2025
**Project Version:** 0.0.0
**Claude Code Session:** claude/claude-md-miw7p3j6gegueolf-01S8pCLVMiYXoNm8bJSAihYq
