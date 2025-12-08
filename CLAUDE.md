# CLAUDE.md - AI Assistant Guide for FaceIQ

**Last Updated**: 2025-12-08
**Project**: FaceIQ - AI-powered facial aesthetics analysis application
**Status**: Active Development

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & Technology Stack](#architecture--technology-stack)
3. [Directory Structure](#directory-structure)
4. [Key Components & Services](#key-components--services)
5. [Development Workflow](#development-workflow)
6. [Coding Conventions & Standards](#coding-conventions--standards)
7. [Testing Strategy](#testing-strategy)
8. [Environment Configuration](#environment-configuration)
9. [Git Workflow](#git-workflow)
10. [Common Tasks & Commands](#common-tasks--commands)
11. [AI Assistant Guidelines](#ai-assistant-guidelines)

---

## 🎯 Project Overview

### What is FaceIQ?

FaceIQ is a React-based web application that uses Google's Gemini AI to analyze facial aesthetics and provide personalized improvement recommendations. The app features:

- **Face Analysis**: AI-powered facial feature scoring based on aesthetic standards
- **Mog Checker**: Head-to-head comparison of two faces
- **AI Coach**: Conversational AI for personalized looksmaxxing advice
- **Results Dashboard**: Animated results screen with detailed metrics
- **Social Sharing**: Instagram Stories-optimized share cards

### Target Platform

- **Primary**: Mobile web (iOS/Android)
- **Optimized for**: iPhone (375px - 430px width)
- **Design Language**: Swiss/Apple fusion aesthetic with ultra-minimal design

### Current Development Phase

✅ Core features implemented
✅ Authentication system (mock-based)
✅ Results screen with animations
✅ Share card component
✅ Testing framework setup (Vitest)
🚧 Active feature development ongoing

---

## 🏗️ Architecture & Technology Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2.1 | UI framework |
| **TypeScript** | 5.8.2 | Type safety |
| **Vite** | 6.2.0 | Build tool & dev server |
| **Vitest** | 4.0.15 | Testing framework |
| **Tailwind CSS** | via CDN | Styling (inline classes) |

### AI & Backend Services

- **Google Gemini AI** (`@google/genai` 1.31.0)
  - Model: `gemini-2.5-flash`
  - Face analysis with structured JSON output
  - Chat-based coaching interface
  - Image comparison

- **Firebase** (Mock Implementation)
  - Authentication system (currently mocked in `services/firebase.ts`)
  - User state management with localStorage
  - Ready for real Firebase integration

### Key Dependencies

```json
{
  "dependencies": {
    "@google/genai": "^1.31.0",        // Gemini AI SDK
    "firebase": "^12.6.0",              // Auth (currently mocked)
    "lucide-react": "^0.556.0",         // Icon library
    "react": "^19.2.1",
    "react-dom": "^19.2.1"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.1",
    "@types/node": "^22.14.0",
    "@vitejs/plugin-react": "^5.0.0",
    "jsdom": "^27.3.0",
    "vitest": "^4.0.15"
  }
}
```

### Module System

- **Type**: ES Modules (`"type": "module"` in package.json)
- **Module Resolution**: `bundler` (modern TypeScript)
- **Path Aliases**: `@/*` maps to project root
- **JSX**: `react-jsx` (automatic runtime)

---

## 📁 Directory Structure

```
/home/user/FaceiQ/
├── components/              # React components
│   ├── Auth.tsx            # Authentication UI
│   ├── ResultsScreen.tsx   # Main results display with animations
│   ├── ResultsScreen.types.ts
│   ├── ResultsScreen.example.tsx
│   ├── ScoreCard.tsx       # Individual score card component
│   ├── ShareCard.tsx       # Instagram Stories share card (9:16)
│   └── index.ts            # Component exports
│
├── hooks/                  # Custom React hooks
│   ├── useCountUp.ts       # Number animation (0→target)
│   ├── useScrollReveal.ts  # Intersection Observer reveal
│   ├── useProgressBar.ts   # Progress bar animation
│   └── index.ts            # Hook exports
│
├── services/               # External service integrations
│   ├── geminiService.ts    # Google Gemini AI integration
│   └── firebase.ts         # Mock Firebase auth service
│
├── App.tsx                 # Main application component (~800 lines)
├── index.tsx               # React entry point
├── types.ts                # Global TypeScript type definitions
│
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
├── package.json            # Dependencies & scripts
│
├── README.md               # User-facing documentation
├── RESULTSSCREEN_README.md # ResultsScreen component docs
├── CLAUDE.md               # This file (AI assistant guide)
│
└── index.html              # HTML entry point
```

### Important Notes

- **No `src/` directory**: All source files are in the project root
- **Flat structure**: Components, hooks, and services in top-level directories
- **Path alias**: `@/` resolves to project root (e.g., `@/types`, `@/components/Auth`)

---

## 🧩 Key Components & Services

### 1. App.tsx (Main Application)

**Location**: `/home/user/FaceiQ/App.tsx`
**Lines**: ~800

**Responsibilities**:
- Tab navigation (Scan, Extras, Daily, Coach)
- State management for all features
- Image upload handling
- API orchestration
- User authentication state

**Key State**:
```typescript
// Auth
const [user, setUser] = useState<FirebaseUser | null>(null);

// Analysis
const [selectedImage, setSelectedImage] = useState<string | null>(null);
const [result, setResult] = useState<AnalysisResult | null>(null);

// Chat
const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

// Mog Checker
const [mogResult, setMogResult] = useState<MogResult | null>(null);
```

**Tabs/Features**:
- `AppTab.SCAN`: Face analysis
- `AppTab.EXTRAS`: Mog checker (face comparison)
- `AppTab.DAILY`: Daily tasks (placeholder)
- `AppTab.COACH`: AI chat coach

---

### 2. services/geminiService.ts

**Location**: `/home/user/FaceiQ/services/geminiService.ts`

**Functions**:

#### `analyzeFace(base64Image: string): Promise<AnalysisResult>`
- Analyzes a single face image
- Returns structured JSON with scores, tier, feedback, improvements
- Uses `ANALYSIS_SCHEMA` for type-safe responses
- Fallback mock data on error

#### `compareFaces(img1Base64: string, img2Base64: string): Promise<MogResult>`
- Compares two faces (Mog Checker)
- Returns winner, score difference, roast
- Uses `MOG_SCHEMA` for structured output

#### `getCoachResponse(message: string, history: any[]): Promise<string>`
- Chat-based coaching
- Context-aware with conversation history
- Short, actionable Gen-Z style responses (1-3 sentences)

**Schema Approach**:
```typescript
// Gemini enforces this schema via responseSchema config
const ANALYSIS_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    scores: { ... },
    tier: { ... },
    feedback: { ... },
    improvements: { ... }
  }
};
```

---

### 3. components/ResultsScreen.tsx

**Location**: `/home/user/FaceiQ/components/ResultsScreen.tsx`

**Purpose**: Premium animated results display

**Features**:
- Score count-up animation (1.5s cubic ease-out)
- Progress bar animations (1.2s quad ease-out)
- Scroll-triggered card reveals (staggered 100ms)
- Swiss/Apple aesthetic (#000 background, purple accents)

**Props Interface**:
```typescript
interface ResultsScreenProps {
  overallScore: number;      // 0-10 scale
  potentialScore: number;
  metrics: MetricData[];
  improvements: ImprovementRecommendation[];
  onBack?: () => void;
  onSettings?: () => void;
  onSaveToHistory?: () => void;
  onAnalyzeAgain?: () => void;
}
```

**See**: `RESULTSSCREEN_README.md` for detailed documentation

---

### 4. components/ShareCard.tsx

**Location**: `/home/user/FaceiQ/components/ShareCard.tsx`

**Purpose**: Instagram Stories-optimized share card

**Specs**:
- Dimensions: 360px × 640px (9:16 aspect ratio)
- `forwardRef` for screenshot capture via html2canvas
- Gradient backgrounds with ambient glow effects
- Tier-based color theming
- Metrics grid (Jawline, Eye Area, Skin, Masculinity)

**Usage Pattern**:
```typescript
const shareCardRef = useRef<HTMLDivElement>(null);

// Capture screenshot
const captureImage = async () => {
  if (shareCardRef.current) {
    const canvas = await html2canvas(shareCardRef.current);
    // Share or download
  }
};

<ShareCard ref={shareCardRef} {...data} />
```

---

### 5. services/firebase.ts (Mock Auth)

**Location**: `/home/user/FaceiQ/services/firebase.ts`

**Current State**: Mock implementation using localStorage

**Why Mock?**:
- Allows development without Firebase setup
- Matches Firebase v9 SDK interface
- Easy to swap with real Firebase later

**Interface**:
```typescript
export const auth = new MockAuthService();
export const onAuthStateChanged = (authInstance, callback) => { ... };
export const signInWithEmailAndPassword = (authInstance, email, pass) => { ... };
export const createUserWithEmailAndPassword = (authInstance, email, pass) => { ... };
```

**Migration Path**:
When ready for real Firebase:
1. Replace `services/firebase.ts` content
2. Import real Firebase SDK
3. Initialize with config
4. No changes needed in `App.tsx` (interface matches)

---

### 6. Custom Hooks

#### hooks/useCountUp.ts
```typescript
// Animates number from 0 to target
const value = useCountUp(targetValue, duration, initialValue);
```
- Uses `requestAnimationFrame`
- Cubic ease-out easing
- Returns current animated value

#### hooks/useScrollReveal.ts
```typescript
// Triggers when element enters viewport
const { ref, isVisible } = useScrollReveal({ threshold: 0.2 });
```
- Intersection Observer API
- One-time trigger
- Returns ref + visibility boolean

#### hooks/useProgressBar.ts
```typescript
// Animates progress 0→target when triggered
const progress = useProgressBar(targetPercent, trigger, duration);
```
- Quadratic ease-out
- Requires trigger boolean
- Returns current progress percentage

---

## 🔄 Development Workflow

### Setting Up Development Environment

1. **Prerequisites**:
   - Node.js (any recent version)
   - npm (comes with Node.js)

2. **Initial Setup**:
   ```bash
   cd /home/user/FaceiQ
   npm install
   ```

3. **Environment Variables**:
   Create `.env.local` in project root:
   ```bash
   GEMINI_API_KEY=your_api_key_here
   ```

   **Important**: `.env.local` is gitignored. Never commit API keys.

4. **Start Development Server**:
   ```bash
   npm run dev
   # Server runs at http://localhost:3000
   ```

### Development Server Configuration

**File**: `vite.config.ts`

```typescript
server: {
  port: 3000,
  host: '0.0.0.0',  // Accessible from network
}
```

**Environment Variable Injection**:
```typescript
define: {
  'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
  'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
}
```

---

## 📝 Coding Conventions & Standards

### TypeScript Guidelines

1. **Strict Type Safety**:
   ```typescript
   // ✅ Good: Explicit types
   const [result, setResult] = useState<AnalysisResult | null>(null);

   // ❌ Bad: Implicit any
   const [result, setResult] = useState(null);
   ```

2. **Interface vs Type**:
   - Use `interface` for component props and data structures
   - Use `type` for unions, intersections, mapped types
   ```typescript
   // Interfaces
   interface AnalysisResult { ... }
   interface ShareCardProps { ... }

   // Types
   export type User = { uid: string; email: string | null; ... };
   export enum AppTab { SCAN = 'scan', ... }
   ```

3. **Type Exports**:
   - Export all types from `types.ts` for global use
   - Export component-specific types from component files
   ```typescript
   // types.ts - Global types
   export interface AnalysisResult { ... }

   // ResultsScreen.types.ts - Component-specific
   export interface ResultsScreenProps { ... }
   ```

### React Conventions

1. **Functional Components Only**:
   ```typescript
   // ✅ Always use functional components
   const App: React.FC = () => { ... };

   // ❌ Never use class components
   ```

2. **Hooks Order**:
   ```typescript
   // 1. State hooks
   const [state, setState] = useState();

   // 2. Refs
   const ref = useRef();

   // 3. Effects
   useEffect(() => { ... }, []);

   // 4. Custom hooks
   const value = useCountUp(...);
   ```

3. **Event Handlers**:
   ```typescript
   // Prefix with 'handle'
   const handleSubmit = () => { ... };
   const handleImageUpload = (file: File) => { ... };
   ```

4. **Async Operations**:
   ```typescript
   // Always wrap in try-catch
   const handleAnalyze = async () => {
     setIsAnalyzing(true);
     try {
       const result = await analyzeFace(imageBase64);
       setResult(result);
     } catch (error) {
       console.error("Analysis failed:", error);
       // Show error to user
     } finally {
       setIsAnalyzing(false);
     }
   };
   ```

### Component Structure

**Standard Component Template**:
```typescript
import React, { useState, useEffect } from 'react';
import { IconName } from 'lucide-react';
import { TypeName } from '@/types';

interface ComponentNameProps {
  // Props with JSDoc comments
  prop1: string;
  prop2?: number;  // Optional props with ?
  onAction?: () => void;  // Callbacks optional by default
}

const ComponentName: React.FC<ComponentNameProps> = ({
  prop1,
  prop2 = defaultValue,  // Default values in destructuring
  onAction
}) => {
  // Hooks
  const [state, setState] = useState<Type>(initialValue);

  // Effects
  useEffect(() => {
    // Effect logic
    return () => {
      // Cleanup
    };
  }, [dependencies]);

  // Event handlers
  const handleEvent = () => {
    // Handler logic
  };

  // Render
  return (
    <div className="...">
      {/* JSX */}
    </div>
  );
};

export default ComponentName;
```

### Styling with Tailwind

1. **Class Ordering** (informal, but helpful):
   ```
   Layout → Spacing → Sizing → Typography → Colors → Effects
   ```
   ```jsx
   <div className="flex flex-col gap-4 p-6 w-full bg-black text-white rounded-lg shadow-xl">
   ```

2. **Responsive Design**:
   ```jsx
   {/* Mobile-first, then breakpoints */}
   <div className="w-full md:w-1/2 lg:w-1/3">
   ```

3. **Custom Values**:
   ```jsx
   {/* Use arbitrary values sparingly */}
   <div className="w-[360px] h-[640px] text-[10px]">
   ```

4. **Color System**:
   ```
   Primary: purple-500 (#a855f7)
   Background: #000000 (black)
   Cards: #0a0a0a
   Borders: zinc-800 (#27272a)
   Text: white, zinc-400, zinc-500
   ```

### File Naming

- **Components**: PascalCase (`ResultsScreen.tsx`, `ShareCard.tsx`)
- **Hooks**: camelCase with 'use' prefix (`useCountUp.ts`)
- **Services**: camelCase (`geminiService.ts`, `firebase.ts`)
- **Types**: PascalCase for types file (`ResultsScreen.types.ts`)
- **Config**: lowercase (`vite.config.ts`, `tsconfig.json`)

---

## 🧪 Testing Strategy

### Current Setup

**Framework**: Vitest 4.0.15
**Testing Library**: React Testing Library 16.3.0
**Environment**: jsdom 27.3.0

### Test Commands

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Test File Naming

- Co-locate tests: `Component.test.tsx` next to `Component.tsx`
- Integration tests: `features/*.test.tsx`
- Unit tests: `utils/*.test.ts`

### Writing Tests (Guidelines)

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ComponentName from './ComponentName';

describe('ComponentName', () => {
  it('renders with required props', () => {
    render(<ComponentName prop="value" />);
    expect(screen.getByText('value')).toBeInTheDocument();
  });

  it('handles user interactions', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<ComponentName onClick={handleClick} />);
    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('handles async operations', async () => {
    render(<ComponentName />);

    await waitFor(() => {
      expect(screen.getByText('Loaded')).toBeInTheDocument();
    });
  });
});
```

### What to Test

**Priority Order**:
1. ✅ User interactions (clicks, inputs, navigation)
2. ✅ Data transformations (utility functions)
3. ✅ API integration (mock Gemini responses)
4. ✅ Error states and edge cases
5. ⚠️ Avoid testing implementation details
6. ⚠️ Avoid snapshot tests (brittle)

### Mocking External Services

```typescript
// Mock Gemini service
vi.mock('@/services/geminiService', () => ({
  analyzeFace: vi.fn().mockResolvedValue({
    scores: { overall: 75, ... },
    tier: 'High Tier Normie',
    feedback: ['...'],
    improvements: []
  }),
  compareFaces: vi.fn(),
  getCoachResponse: vi.fn()
}));
```

---

## 🔧 Environment Configuration

### Environment Variables

**File**: `.env.local` (create manually, not in repo)

```bash
# Required
GEMINI_API_KEY=your_gemini_api_key_here

# Optional (for future features)
FIREBASE_API_KEY=...
FIREBASE_PROJECT_ID=...
```

### Accessing Environment Variables

**In Code**:
```typescript
// Vite injects these at build time
const apiKey = process.env.API_KEY;
const geminiKey = process.env.GEMINI_API_KEY;
```

**In Vite Config**:
```typescript
import { loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    }
  };
});
```

### Configuration Files

#### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "jsx": "react-jsx",
    "moduleResolution": "bundler",
    "paths": {
      "@/*": ["./*"]  // Path alias
    },
    "types": ["node"]
  }
}
```

**Key Settings**:
- `experimentalDecorators: true` - For future decorator support
- `allowImportingTsExtensions: true` - Import `.ts` files directly
- `noEmit: true` - Vite handles compilation

#### vite.config.ts

```typescript
export default defineConfig({
  server: { port: 3000, host: '0.0.0.0' },
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') }
  }
});
```

---

## 🌿 Git Workflow

### Branch Strategy

**Main Branch**: `main` (or master)
**Feature Branches**: `claude/claude-md-<session-id>`

### Current Active Branch

```bash
# As of this writing:
claude/claude-md-mixmtehej6h272wc-01Jn1qb65xK7wmQ41XKjx9Ww
```

### Commit Conventions

**Format**: `type: description`

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `chore`: Maintenance (deps, configs)
- `docs`: Documentation only
- `refactor`: Code restructuring (no behavior change)
- `test`: Adding or updating tests
- `style`: Code style/formatting

**Examples**:
```bash
feat: Add ShareCard component for Instagram Stories sharing
feat: Setup Vitest testing framework
chore: Add package-lock.json from npm install
fix: Resolve authentication redirect loop
docs: Update CLAUDE.md with testing guidelines
```

### Recent Commits (Reference)

```
8c029b1 feat: Add ShareCard component for Instagram Stories sharing
ab1c885 feat: Setup Vitest testing framework
b710972 chore: Add package-lock.json from npm install
9c38368 feat: Add FaceIQ Results Screen component with animations
0533f72 chore: Remove deprecated webpack CI workflow
```

### Working with Git

```bash
# Check current branch
git branch --show-current

# View status
git status

# Stage changes
git add <files>

# Commit
git commit -m "type: description"

# Push to feature branch
git push -u origin claude/claude-md-<session-id>

# View recent commits
git log --oneline -10
```

### .gitignore

**Ignored Files**:
```
node_modules/
dist/
dist-ssr/
*.local           # Includes .env.local
logs/
*.log
.DS_Store
.vscode/* (except extensions.json)
.idea/
```

---

## ⚡ Common Tasks & Commands

### Development

```bash
# Install dependencies
npm install

# Start dev server (localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Testing

```bash
# Run tests (watch mode)
npm test

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Code Quality

```bash
# TypeScript type checking (no dedicated script, but can run):
npx tsc --noEmit

# Check for unused dependencies
npx depcheck
```

### Project Information

```bash
# View dependency tree
npm list --depth=0

# Check for outdated packages
npm outdated

# View installed package versions
npm list <package-name>
```

### File Operations

```bash
# Find all TypeScript files
find . -name "*.tsx" -o -name "*.ts" | grep -v node_modules

# Count lines of code (excluding node_modules)
find . -name "*.tsx" -o -name "*.ts" | grep -v node_modules | xargs wc -l

# Search for text in code
grep -r "searchTerm" --include="*.tsx" --include="*.ts" .
```

---

## 🤖 AI Assistant Guidelines

### When Working on This Codebase

#### 1. Always Read Before Editing

```typescript
// ❌ Don't propose changes without reading
"Let's update App.tsx to add a new feature..."

// ✅ Read the file first
<Read file_path="/home/user/FaceiQ/App.tsx" />
// Then propose changes based on actual code
```

#### 2. Understand the Context

Before making changes:
- Check what tab/feature the code belongs to
- Understand state management (where state lives)
- Check for existing similar implementations
- Review type definitions in `types.ts`

#### 3. Maintain Consistency

**Match Existing Patterns**:
```typescript
// File already uses this pattern for async operations
const handleAnalyze = async () => {
  setIsAnalyzing(true);
  try {
    const result = await analyzeFace(base64);
    setResult(result);
  } catch (error) {
    console.error("Failed:", error);
  } finally {
    setIsAnalyzing(false);
  }
};

// ✅ Follow the same pattern for new async functions
// ❌ Don't introduce a different error handling approach
```

#### 4. Preserve Type Safety

```typescript
// ✅ Always maintain TypeScript types
interface NewFeatureProps {
  data: AnalysisResult;  // Use existing types
  onComplete: () => void;
}

// ❌ Don't use 'any' or remove types
interface NewFeatureProps {
  data: any;  // Bad!
}
```

#### 5. Component Creation Checklist

When creating a new component:

- [ ] Create interface for props
- [ ] Add to `components/index.ts` if reusable
- [ ] Use existing hooks where applicable
- [ ] Follow Tailwind class conventions
- [ ] Add TypeScript types (no `any`)
- [ ] Consider mobile-first responsive design
- [ ] Test with realistic data
- [ ] Add JSDoc comments for complex props

#### 6. Service Integration Guidelines

When working with `geminiService.ts`:

- [ ] Always handle errors with try-catch
- [ ] Provide fallback mock data
- [ ] Use structured schemas for type safety
- [ ] Log errors to console
- [ ] Update type definitions if schema changes

#### 7. State Management

**Current Approach**: Component-level state in `App.tsx`

- No global state management (Redux, Zustand, etc.)
- State lifted to `App.tsx` for cross-tab features
- Local state for component-specific UI

**When Adding State**:
```typescript
// ✅ Add to App.tsx for feature-level state
const [newFeature, setNewFeature] = useState<FeatureType | null>(null);

// ✅ Add to component for UI-only state
const [isExpanded, setIsExpanded] = useState(false);
```

#### 8. Animation Guidelines

When adding animations:

- Use existing custom hooks (`useCountUp`, `useProgressBar`, `useScrollReveal`)
- Match the app's animation timing (1-1.5s for major transitions)
- Use cubic/quadratic easing for smoothness
- Trigger animations on scroll or mount, not on every render
- Clean up with `useEffect` return functions

#### 9. Styling Guidelines

**Color Palette**:
```typescript
// Primary
'purple-500' → #a855f7 (accent, highlights)

// Backgrounds
'#000000' → Pure black
'#0a0a0a' → Card backgrounds

// Borders
'zinc-800' → #27272a
'zinc-900' → #18181b (dividers)

// Text
'white' → Primary text
'zinc-400' → #a1a1aa (secondary)
'zinc-500' → Muted text
```

**Spacing System**:
- Use Tailwind's default scale (4px increments)
- Card padding: `p-5` or `p-6` (20px/24px)
- Gap between elements: `gap-3` or `gap-4` (12px/16px)
- Rounded corners: `rounded-lg` (8px) or `rounded-xl` (12px)

#### 10. Error Handling

**User-Facing Errors**:
```typescript
// Show user-friendly messages
try {
  await analyzeFace(image);
} catch (error) {
  // Log technical error
  console.error("Analysis failed:", error);

  // Show user-friendly message
  setError("Unable to analyze image. Please try again.");
}
```

**API Errors**:
- Always provide fallback data
- Never crash the app
- Log errors for debugging
- Inform user gracefully

#### 11. Image Handling

**Format**: Base64-encoded JPEG
```typescript
// Convert File to Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result as string;
      // Remove data:image/jpeg;base64, prefix
      resolve(base64.split(',')[1]);
    };
    reader.onerror = reject;
  });
};
```

#### 12. Testing New Features

When adding features:

1. Test manually first:
   - Upload an image
   - Test on mobile viewport (DevTools)
   - Check all tabs
   - Test error states (API failure)

2. Write automated tests:
   - User interactions
   - Data transformations
   - Edge cases

3. Verify:
   - No console errors
   - No TypeScript errors
   - Responsive design works
   - Animations are smooth

#### 13. Don't Over-Engineer

**Keep It Simple**:
```typescript
// ❌ Don't create abstractions prematurely
const buttonClassNameBuilder = (variant: string, size: string) => { ... };

// ✅ Just use the classes directly (unless pattern repeats 5+ times)
<button className="px-4 py-2 bg-purple-500 rounded-lg">
```

**Avoid**:
- Feature flags for new code (just ship it)
- Backwards compatibility shims (change the code)
- Helper functions for one-time operations
- Abstractions for hypothetical future needs

#### 14. Performance Considerations

**Current App is Small** (no performance issues expected)

But keep in mind:
- Images are base64 (heavy) - consider optimization if scaling
- Gemini API calls can be slow (1-3s) - show loading states
- Animations use `requestAnimationFrame` (optimized)
- No memo/useMemo needed yet (premature optimization)

#### 15. Security Notes

**Current Security Posture**:

✅ **Safe**:
- No user-uploaded code execution
- No SQL (no database yet)
- API key on client (Gemini has quota limits)
- Mock auth (no real credentials)

⚠️ **Future Considerations**:
- Move API key to backend when scaling
- Implement real auth with Firebase
- Validate/sanitize image uploads
- Rate limiting for API calls

#### 16. Documentation

When making significant changes:

- Update `CLAUDE.md` (this file)
- Update component-specific docs (`RESULTSSCREEN_README.md` pattern)
- Add JSDoc comments for complex functions
- Update `types.ts` if interfaces change

**JSDoc Example**:
```typescript
/**
 * Analyzes a face image using Gemini AI
 * @param base64Image - Base64-encoded JPEG image (without data URI prefix)
 * @returns AnalysisResult with scores, tier, feedback, and improvements
 * @throws Error if API call fails (caught internally, returns fallback)
 */
export const analyzeFace = async (base64Image: string): Promise<AnalysisResult> => {
  // ...
};
```

#### 17. Common Pitfalls to Avoid

❌ **Don't**:
- Hardcode API keys in code (use `.env.local`)
- Forget to handle loading states
- Ignore TypeScript errors
- Add `console.log` without removing before commit
- Change existing working code unnecessarily
- Create new files when editing existing ones works
- Use class components (functional only)
- Mix tabs and spaces (use 2 spaces)

✅ **Do**:
- Read existing code before changing
- Match existing patterns
- Test on mobile viewport
- Handle errors gracefully
- Keep changes focused and minimal
- Ask questions if unclear about architecture
- Check git status before committing

---

## 📚 Additional Resources

### Project Documentation

- **README.md**: User-facing setup instructions
- **RESULTSSCREEN_README.md**: ResultsScreen component deep-dive
- **CLAUDE.md**: This file (AI assistant guide)

### External Documentation

- [React 19 Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Vitest Docs](https://vitest.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/)
- [Google Gemini AI](https://ai.google.dev/docs)

### Codebase Exploration Commands

```bash
# Find specific component
find . -name "ShareCard.tsx"

# Search for usage of a function
grep -r "analyzeFace" --include="*.tsx" --include="*.ts" .

# Find all components
ls -la components/

# View recent changes
git log --oneline --since="1 week ago"

# See what changed in a file
git log -p -- App.tsx
```

---

## 🎯 Quick Reference Card

### File Locations (Most Common)

| File | Path |
|------|------|
| Main app | `/home/user/FaceiQ/App.tsx` |
| Types | `/home/user/FaceiQ/types.ts` |
| Gemini AI | `/home/user/FaceiQ/services/geminiService.ts` |
| Auth | `/home/user/FaceiQ/services/firebase.ts` |
| Results screen | `/home/user/FaceiQ/components/ResultsScreen.tsx` |
| Share card | `/home/user/FaceiQ/components/ShareCard.tsx` |

### State Locations (Where Things Live)

| State | Location | File |
|-------|----------|------|
| Current tab | `activeTab` | App.tsx |
| Analysis result | `result` | App.tsx |
| Selected image | `selectedImage` | App.tsx |
| User auth | `user` | App.tsx |
| Chat history | `chatHistory` | App.tsx |
| Mog result | `mogResult` | App.tsx |

### Type Definitions

| Type | Location |
|------|----------|
| `AnalysisResult` | types.ts |
| `MogResult` | types.ts |
| `ChatMessage` | types.ts |
| `AppTab` | types.ts (enum) |
| `ResultsScreenProps` | components/ResultsScreen.types.ts |
| `ShareCardProps` | components/ShareCard.tsx |

### Commands (Copy-Paste Ready)

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm test                       # Run tests

# Git
git status                     # Check status
git log --oneline -10         # Recent commits
git branch --show-current      # Current branch

# File exploration
find . -name "*.tsx" | grep -v node_modules
grep -r "searchTerm" --include="*.tsx" .
```

---

## 📝 Changelog

| Date | Change | Author |
|------|--------|--------|
| 2025-12-08 | Initial CLAUDE.md creation | Claude (AI Assistant) |

---

## 🆘 Getting Help

### For AI Assistants

1. **Read this file first** before making changes
2. **Explore the codebase** using file reads and grep
3. **Check existing patterns** before introducing new ones
4. **Ask clarifying questions** if architecture is unclear
5. **Test changes** before proposing as complete

### For Human Developers

1. **Check README.md** for setup instructions
2. **Read component docs** (e.g., RESULTSSCREEN_README.md)
3. **Explore code** with the commands in this guide
4. **Check git history** for context on past changes

---

**End of CLAUDE.md**

*This document should be updated whenever significant architectural changes are made to the codebase.*
