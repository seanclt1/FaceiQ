# CLAUDE.md - FaceiQ Project Guide

> **Last Updated:** December 7, 2025
> **Project:** FaceiQ - AI-Powered Facial Aesthetics Analysis & Looksmaxxing Coach

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Key Files & Components](#key-files--components)
6. [Development Workflow](#development-workflow)
7. [Environment Configuration](#environment-configuration)
8. [Coding Conventions](#coding-conventions)
9. [AI Integration Patterns](#ai-integration-patterns)
10. [State Management](#state-management)
11. [Styling System](#styling-system)
12. [Authentication System](#authentication-system)
13. [Deployment Considerations](#deployment-considerations)
14. [Common Tasks](#common-tasks)

---

## Project Overview

**FaceiQ** is an advanced AI-powered web application that provides:
- **Facial Aesthetics Analysis**: AI-driven assessment of facial features using objective beauty standards
- **Looksmaxxing Coach**: Personalized advice for improving appearance
- **Mog Checker**: Side-by-side face comparison tool
- **Daily Routines**: Tracking system for improvement habits
- **AI Chat Coach**: Interactive Q&A for aesthetics guidance

Originally created via AI Studio (Google's app builder), this is a React-based single-page application designed for mobile-first viewing.

---

## Architecture

### High-Level Overview
```
┌─────────────────────────────────────────┐
│         React 19 + TypeScript           │
│      (Vite Dev Server & Builder)        │
├─────────────────────────────────────────┤
│  App.tsx (Main Component)               │
│    ├── Auth Gate (Mock Firebase)        │
│    ├── Tab Navigation System            │
│    │   ├── Scan View                    │
│    │   ├── Extras View (Mog Checker)    │
│    │   ├── Daily View                   │
│    │   └── Coach View (Chat)            │
│    └── Components (Auth, ScoreCard)     │
├─────────────────────────────────────────┤
│  Services Layer                         │
│    ├── geminiService.ts (AI Logic)      │
│    └── firebase.ts (Mock Auth)          │
├─────────────────────────────────────────┤
│  External Dependencies                  │
│    ├── Google Gemini AI API             │
│    ├── Tailwind CSS (CDN)               │
│    ├── Lucide React Icons (CDN)         │
│    └── React 19 (Import Maps/CDN)       │
└─────────────────────────────────────────┘
```

### Design Patterns
- **Component-Based Architecture**: React functional components with hooks
- **Service Layer Pattern**: Separate business logic in `/services`
- **Type Safety**: Comprehensive TypeScript interfaces in `types.ts`
- **Tab-Based Navigation**: Single-page with swipeable tabs
- **Mobile-First**: Optimized for 0-480px screens

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2.1 | UI framework |
| **TypeScript** | 5.8.2 | Type safety |
| **Vite** | 6.2.0 | Build tool & dev server |
| **Tailwind CSS** | CDN | Styling (custom brand colors) |
| **Google GenAI** | 1.31.0 | Gemini AI SDK |
| **Lucide React** | 0.556.0 | Icon library |
| **Firebase** | 12.6.0 | (Mock auth only) |

### Build System
- **Vite** handles:
  - Hot module replacement (HMR) during development
  - TypeScript transpilation
  - Bundling and optimization for production
  - Environment variable injection

---

## Project Structure

```
FaceiQ/
├── components/          # Reusable UI components
│   ├── Auth.tsx         # Login/signup interface
│   └── ScoreCard.tsx    # Score display widget
├── services/            # Business logic & external APIs
│   ├── geminiService.ts # Gemini AI integration
│   └── firebase.ts      # Mock authentication service
├── App.tsx              # Main application component (650+ lines)
├── index.tsx            # React entry point
├── types.ts             # TypeScript type definitions
├── index.html           # HTML shell with Tailwind config
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript compiler options
├── package.json         # Dependencies & scripts
├── metadata.json        # AI Studio metadata
└── README.md            # Quick setup guide
```

### File Responsibilities

| File | Lines | Responsibility |
|------|-------|---------------|
| `App.tsx` | 675 | Main UI logic, tab navigation, state management |
| `geminiService.ts` | 183 | AI model calls, schema definitions, prompt engineering |
| `firebase.ts` | 106 | Mock authentication (localStorage-based) |
| `Auth.tsx` | 162 | Login/signup form UI |
| `types.ts` | 65 | TypeScript interfaces for data models |
| `ScoreCard.tsx` | 35 | Reusable score display component |

---

## Key Files & Components

### App.tsx (Main Application)
**Location:** `/App.tsx`

**Core Features:**
1. **Authentication Gate**: Checks user login state before rendering app
2. **Four Main Views**:
   - `renderScanView()` - Face upload, analysis progress, results display
   - `renderExtrasView()` - Mog checker (face comparison)
   - `renderDailyView()` - Routine tracker with streak counter
   - `renderCoachView()` - AI chat interface
3. **Swipe Gestures**: Touch-based tab navigation (`handleTouchStart/End`)
4. **Image Processing**: FileReader API for base64 conversion
5. **Progress Simulation**: Fake loading bars during AI processing

**State Variables:**
```typescript
// Auth
const [user, setUser] = useState<FirebaseUser | null>(null);

// Analysis (Scan tab)
const [selectedImage, setSelectedImage] = useState<string | null>(null);
const [result, setResult] = useState<AnalysisResult | null>(null);
const [isAnalyzing, setIsAnalyzing] = useState(false);

// Chat (Coach tab)
const [chatHistory, setChatHistory] = useState<ChatMessage[]>([...]);
const [chatInput, setChatInput] = useState('');

// Mog Checker (Extras tab)
const [mogImage1, setMogImage1] = useState<string | null>(null);
const [mogImage2, setMogImage2] = useState<string | null>(null);
const [mogResult, setMogResult] = useState<MogResult | null>(null);
```

**Important Functions:**
- `startAnalysis(base64Data)` - Triggers Gemini face analysis
- `startMogBattle()` - Compares two faces via AI
- `handleSendMessage()` - Sends chat message to AI coach

### services/geminiService.ts
**Location:** `/services/geminiService.ts`

**Exported Functions:**
1. `analyzeFace(base64Image: string): Promise<AnalysisResult>`
   - Uses Gemini 2.5 Flash model
   - Structured output via JSON schema
   - Returns scores, tier, feedback, improvements

2. `compareFaces(img1: string, img2: string): Promise<MogResult>`
   - Determines winner in face comparison
   - Returns brutal roast & advantage reason

3. `getCoachResponse(message: string, history: any[]): Promise<string>`
   - Chat-style AI responses
   - Custom system instruction for concise coaching tone

**AI Configuration:**
```typescript
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schema-based output ensures type safety
const ANALYSIS_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    scores: { ... },
    tier: { type: Type.STRING },
    feedback: { type: Type.ARRAY },
    improvements: { ... }
  }
};
```

### services/firebase.ts
**Location:** `/services/firebase.ts`

**Mock Authentication System:**
- Uses `localStorage` to persist user sessions
- Simulates async behavior with setTimeout
- Exports Firebase-compatible API:
  ```typescript
  export const auth: MockAuthService
  export const signInWithEmailAndPassword(...)
  export const createUserWithEmailAndPassword(...)
  export const onAuthStateChanged(...)
  ```

**Why Mock?**
This app was designed to run in AI Studio's sandbox environment without full Firebase setup. For production, replace with real Firebase:
```typescript
// import { initializeApp } from 'firebase/app';
// import { getAuth, ... } from 'firebase/auth';
```

### types.ts
**Location:** `/types.ts`

**Key Interfaces:**
```typescript
// Analysis result from Gemini
export interface AnalysisResult {
  scores: {
    overall: number;
    potential: number;
    masculinity: number;
    jawline: number;
    skinQuality: number;
    cheekbones: number;
    eyeArea: number;
  };
  tier: string; // "Chad Lite", "High Tier Normie", etc.
  feedback: string[];
  improvements: {
    area: string;
    advice: string;
    priority: 'High' | 'Medium' | 'Low';
  }[];
}

// Mog checker result
export interface MogResult {
  winnerIndex: 0 | 1;
  winnerTitle: string;
  diffScore: number;
  reason: string;
  roast: string;
}

// Chat message
export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

// App tab enum
export enum AppTab {
  SCAN = 'scan',
  EXTRAS = 'extras',
  DAILY = 'daily',
  COACH = 'coach'
}
```

**Constants:**
- `TIER_MAP`: Score thresholds for tier labels
- `DAILY_TASKS`: Pre-defined routine tasks with icons
- `COACH_TOPICS`: Quick-start prompts for coach chat

---

## Development Workflow

### Local Setup
```bash
# 1. Clone repository
git clone <repo-url>
cd FaceiQ

# 2. Install dependencies
npm install

# 3. Set environment variable
# Create .env.local file:
echo "GEMINI_API_KEY=your_api_key_here" > .env.local

# 4. Start development server
npm run dev
# Server runs at http://localhost:3000
```

### Build Process
```bash
# Production build
npm run build
# Output: /dist folder

# Preview production build
npm run preview
```

### Available Scripts
| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server (port 3000) |
| `npm run build` | TypeScript check + Vite build |
| `npm run preview` | Preview production build locally |

### Git Workflow
```bash
# Current branch naming convention
git checkout -b claude/claude-md-mivxt4rajik0f9zk-013PyGcGct1z1unJ71Rj617b

# Commit changes
git add .
git commit -m "feat: description of changes"

# Push to remote (use -u for branch tracking)
git push -u origin <branch-name>
```

**Important:** All development should happen on the designated `claude/*` feature branch. Never push directly to main without explicit permission.

---

## Environment Configuration

### Required Variables
Create a `.env.local` file in the root directory:

```bash
# Google Gemini API Key (required for AI features)
GEMINI_API_KEY=AIzaSy...
```

### How It's Used
In `vite.config.ts`:
```typescript
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    }
  };
});
```

Then accessed in code:
```typescript
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
```

### Getting a Gemini API Key
1. Go to [Google AI Studio](https://ai.studio)
2. Click "Get API Key"
3. Create new key or use existing
4. Copy to `.env.local`

**Note:** `.env.local` is gitignored (via `*.local` pattern)

---

## Coding Conventions

### TypeScript Guidelines
1. **Always define types** - No implicit `any`
2. **Use interfaces for data models** - See `types.ts`
3. **Prefer type inference** - Let TS infer simple types
4. **Function signatures must be typed**:
   ```typescript
   const startAnalysis = async (base64Data: string): Promise<void> => {
     // ...
   }
   ```

### React Patterns
1. **Functional components only** - No class components
2. **Hooks for state** - useState, useEffect, useRef
3. **Event handlers inline** - Small handlers can be inline in JSX
4. **Refs for DOM access** - File inputs, scroll containers
   ```typescript
   const fileInputRef = useRef<HTMLInputElement>(null);
   fileInputRef.current?.click();
   ```

### File Organization
1. **Components in `/components`** - Reusable UI elements
2. **Services in `/services`** - External API logic, utilities
3. **Types in `types.ts`** - Centralized type definitions
4. **One component per file** - Named exports preferred

### Naming Conventions
- **Components**: PascalCase (`Auth.tsx`, `ScoreCard.tsx`)
- **Services**: camelCase with `.ts` extension (`geminiService.ts`)
- **Variables/Functions**: camelCase (`startAnalysis`, `mogResult`)
- **Constants**: UPPER_SNAKE_CASE (`TIER_MAP`, `DAILY_TASKS`)
- **Types/Interfaces**: PascalCase (`AnalysisResult`, `MogResult`)

---

## AI Integration Patterns

### Using Gemini Structured Output

The app uses **JSON schemas** to guarantee type-safe AI responses:

```typescript
// 1. Define TypeScript schema
const ANALYSIS_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    scores: {
      type: Type.OBJECT,
      properties: {
        overall: { type: Type.NUMBER },
        // ... more properties
      },
      required: ["overall", "potential", ...]
    },
    tier: { type: Type.STRING },
    feedback: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ["scores", "tier", "feedback", "improvements"]
};

// 2. Use in API call
const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: { parts: [imageData, textPrompt] },
  config: {
    responseMimeType: "application/json",
    responseSchema: ANALYSIS_SCHEMA
  }
});

// 3. Parse response with confidence
const result = JSON.parse(response.text) as AnalysisResult;
```

### Prompt Engineering Guidelines

**Analysis Prompt (App.tsx:72-86):**
- Set clear persona: "You are FaceiQ, an expert aesthetic consultant..."
- Define scoring criteria: "golden ratio, symmetry, sexual dimorphism"
- Specify output format: "Return strictly JSON"
- Include tier mapping for consistency

**Coach Prompt (geminiService.ts:159-176):**
- Concise responses: "1-3 sentences MAX"
- Tone specification: "high-confidence Gen-Z fitness coach"
- Formatting rules: "No emojis unless user uses them first"
- Actionable focus: "Prioritize actionable advice over theory"

### Error Handling
Always provide fallback data:
```typescript
try {
  const data = await analyzeFace(base64Data);
  setResult(data);
} catch (error) {
  alert("Analysis failed. Please try a different photo.");
  setIsAnalyzing(false);
  setSelectedImage(null);
}
```

---

## State Management

### State Organization

**Global App State (App.tsx):**
- Authentication: `user`, `authLoading`
- Active tab: `activeTab`
- Analysis: `selectedImage`, `result`, `isAnalyzing`
- Chat: `chatHistory`, `chatInput`, `isChatLoading`
- Mog: `mogImage1`, `mogImage2`, `mogResult`, `isMogging`

**No External State Library:**
This app uses React's built-in state management (useState). No Redux/Zustand needed due to:
- Single-component app architecture
- No deep prop drilling
- Limited shared state requirements

### State Update Patterns

**Immutable Updates:**
```typescript
// Adding to array
setChatHistory(prev => [...prev, newMessage]);

// Resetting state
setMogResult(null);
setMogImage1(null);
setMogImage2(null);
```

**Async State Updates:**
```typescript
const handleSendMessage = async () => {
  setIsChatLoading(true);
  try {
    const response = await getCoachResponse(message, history);
    setChatHistory(prev => [...prev, responseMessage]);
  } finally {
    setIsChatLoading(false);
  }
};
```

### useEffect Patterns

**Auth Listener:**
```typescript
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser);
    setAuthLoading(false);
  });
  return () => unsubscribe(); // Cleanup
}, []);
```

**Auto-scroll Chat:**
```typescript
useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [chatHistory, activeTab]);
```

---

## Styling System

### Tailwind CSS Configuration

**Custom Brand Colors (index.html:12-22):**
```javascript
tailwind.config = {
  theme: {
    extend: {
      colors: {
        brand: {
          black: '#050505',     // Background
          dark: '#121212',      // Secondary bg
          card: '#1C1C1E',      // Card backgrounds
          primary: '#8B5CF6',   // Violet (CTA buttons)
          secondary: '#A78BFA', // Light purple
          accent: '#10B981',    // Green (high scores)
          warn: '#F59E0B',      // Amber (mid scores)
          danger: '#EF4444',    // Red (low scores)
        }
      }
    }
  }
}
```

### Common Patterns

**Card Style:**
```jsx
<div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
  {/* content */}
</div>
```

**Primary Button:**
```jsx
<button className="w-full bg-brand-primary hover:bg-violet-600 text-white
                   font-bold py-4 rounded-2xl shadow-[0_0_20px_rgba(139,92,246,0.4)]
                   active:scale-95 transition-all">
  Button Text
</button>
```

**Glass Morphism:**
```jsx
<div className="bg-brand-card/50 backdrop-blur-md border border-zinc-800">
  {/* content */}
</div>
```

### Animation Classes

**Fade In (App.tsx:653-666):**
```css
.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

**Scan Animation:**
```css
@keyframes scan {
  0% { top: 0%; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}
```

### Responsive Design

**Mobile-First Approach:**
- Max width: 480px (max-w-md)
- Centered on larger screens: `mx-auto`
- Fixed bottom nav: `fixed bottom-0`
- Swipe-enabled tabs for mobile UX

---

## Authentication System

### Mock Implementation

**Current Setup:**
- Uses `localStorage` to persist sessions
- No real backend/database
- Simulates Firebase Auth API for compatibility

**User Flow:**
```
1. User opens app
2. authLoading = true
3. MockAuthService checks localStorage
4. If user found → setUser(stored)
5. authLoading = false
6. Render Auth component OR App
```

### Migrating to Real Firebase

**Steps to implement real auth:**

1. **Install Firebase:**
   ```bash
   npm install firebase
   ```

2. **Create `firebase.ts` with real config:**
   ```typescript
   import { initializeApp } from 'firebase/app';
   import { getAuth } from 'firebase/auth';

   const firebaseConfig = {
     apiKey: process.env.FIREBASE_API_KEY,
     authDomain: "your-app.firebaseapp.com",
     // ...
   };

   const app = initializeApp(firebaseConfig);
   export const auth = getAuth(app);
   export {
     signInWithEmailAndPassword,
     createUserWithEmailAndPassword,
     onAuthStateChanged
   } from 'firebase/auth';
   ```

3. **Update `.env.local`:**
   ```bash
   FIREBASE_API_KEY=...
   FIREBASE_AUTH_DOMAIN=...
   FIREBASE_PROJECT_ID=...
   ```

4. **No changes needed in App.tsx** - API remains the same!

---

## Deployment Considerations

### Import Maps (AI Studio Deployment)

The app uses **CDN-based imports** via import maps (index.html:44-59):
```html
<script type="importmap">
{
  "imports": {
    "@google/genai": "https://aistudiocdn.com/@google/genai@^1.31.0",
    "react": "https://aistudiocdn.com/react@^19.2.1",
    "react-dom/client": "https://aistudiocdn.com/react-dom@^19.2.1/client",
    "lucide-react": "https://aistudiocdn.com/lucide-react@^0.556.0"
  }
}
</script>
```

**Pros:**
- No build step needed in AI Studio
- Fast CDN delivery
- Version pinning

**Cons:**
- Not compatible with all bundlers
- Less control over dependencies

### Building for Production

**Standard Vite Build:**
```bash
npm run build
```

**Output:**
- `/dist/index.html` - HTML shell
- `/dist/assets/*.js` - Bundled JS with hash
- `/dist/assets/*.css` - Extracted CSS (if any)

**Deployment Targets:**
- **Vercel/Netlify**: Drag-drop `/dist` folder
- **Firebase Hosting**: `firebase deploy`
- **AI Studio**: Already hosted at https://ai.studio/apps/drive/...

### Environment Variables in Production

**Vite Build Time:**
- `.env.local` is read during `npm run build`
- Values are injected into bundle at compile time
- **Important:** Rebuild after changing env vars

**Security:**
- Never commit `.env.local` to git
- For client-side apps, API keys are **visible in bundle**
- Use backend proxy for sensitive operations

---

## Common Tasks

### Adding a New Tab

1. **Update `types.ts`:**
   ```typescript
   export enum AppTab {
     SCAN = 'scan',
     EXTRAS = 'extras',
     DAILY = 'daily',
     COACH = 'coach',
     NEW_TAB = 'newtab' // Add here
   }
   ```

2. **Create render function in `App.tsx`:**
   ```typescript
   const renderNewTabView = () => (
     <div className="pt-10 pb-24 px-6">
       {/* Your content */}
     </div>
   );
   ```

3. **Add to main render:**
   ```typescript
   {activeTab === AppTab.NEW_TAB && renderNewTabView()}
   ```

4. **Add navigation button:**
   ```typescript
   <button onClick={() => setActiveTab(AppTab.NEW_TAB)}>
     <YourIcon size={24} />
     <span>NEW</span>
   </button>
   ```

### Creating a New Component

1. **Create file:** `/components/MyComponent.tsx`
2. **Define interface:**
   ```typescript
   interface MyComponentProps {
     title: string;
     onAction: () => void;
   }
   ```
3. **Implement component:**
   ```typescript
   const MyComponent: React.FC<MyComponentProps> = ({ title, onAction }) => {
     return <div>{title}</div>;
   };
   export default MyComponent;
   ```
4. **Import in App.tsx:**
   ```typescript
   import MyComponent from './components/MyComponent';
   ```

### Adding a New AI Function

1. **Define response type in `types.ts`:**
   ```typescript
   export interface NewAIResult {
     field1: string;
     field2: number;
   }
   ```

2. **Create schema in `geminiService.ts`:**
   ```typescript
   const NEW_SCHEMA: Schema = {
     type: Type.OBJECT,
     properties: {
       field1: { type: Type.STRING },
       field2: { type: Type.NUMBER }
     },
     required: ["field1", "field2"]
   };
   ```

3. **Export function:**
   ```typescript
   export const newAIFunction = async (input: string): Promise<NewAIResult> => {
     const response = await ai.models.generateContent({
       model: 'gemini-2.5-flash',
       contents: { parts: [{ text: input }] },
       config: {
         responseMimeType: "application/json",
         responseSchema: NEW_SCHEMA
       }
     });
     return JSON.parse(response.text) as NewAIResult;
   };
   ```

4. **Use in component:**
   ```typescript
   const result = await newAIFunction(userInput);
   setResult(result);
   ```

### Debugging API Issues

**Check these in order:**

1. **API Key:**
   ```bash
   # Verify .env.local exists and has valid key
   cat .env.local
   ```

2. **Network Tab:**
   - Open DevTools → Network
   - Look for `generateContent` calls
   - Check response status (200 = success, 429 = quota exceeded)

3. **Console Errors:**
   - Check browser console for error messages
   - Common errors:
     - "API key not valid" → Wrong/missing GEMINI_API_KEY
     - "Resource exhausted" → Quota exceeded, wait or upgrade
     - "Invalid schema" → Mismatch between schema and prompt

4. **Fallback Data:**
   - The app has fallback responses in try-catch blocks
   - If you see score of 0 or "Error" tier, API call failed

### Updating Dependencies

```bash
# Check for updates
npm outdated

# Update all to latest compatible versions
npm update

# Update specific package
npm install react@latest

# Update Vite
npm install vite@latest -D
```

**After updating:**
1. Test dev server: `npm run dev`
2. Test build: `npm run build`
3. Check for breaking changes in changelogs

---

## AI Assistant Guidelines

### When Working on This Codebase

1. **Always read before editing** - Use `Read` tool on files before modifying
2. **Respect type safety** - Maintain strict TypeScript typing
3. **Test AI integrations** - Gemini API calls may fail; always handle errors
4. **Keep mobile-first** - This is a 480px-max mobile app
5. **Match existing patterns** - Follow Tailwind class patterns from existing code
6. **Update this file** - If making significant changes, update CLAUDE.md

### Common Pitfalls to Avoid

❌ **Don't:**
- Use class components (this is React 19 with hooks only)
- Add new state libraries (useState is sufficient)
- Remove error handling in AI calls (API failures are common)
- Change the import map without understanding AI Studio compatibility
- Commit `.env.local` to git

✅ **Do:**
- Use functional components with TypeScript
- Add new state to App.tsx if needed globally
- Provide fallback UI for loading/error states
- Test on mobile viewport (Chrome DevTools)
- Keep API keys in environment variables

### Testing Checklist

Before committing changes:
- [ ] `npm run dev` - Dev server starts without errors
- [ ] `npm run build` - Build completes successfully
- [ ] TypeScript errors resolved (check terminal)
- [ ] Test on mobile viewport (375x667px iPhone)
- [ ] Test auth flow (login/logout)
- [ ] Test image upload in Scan tab
- [ ] Test chat in Coach tab
- [ ] Verify no console errors in browser

---

## Additional Resources

- **Vite Docs:** https://vite.dev
- **React 19 Docs:** https://react.dev
- **Tailwind CSS:** https://tailwindcss.com
- **Google GenAI SDK:** https://github.com/google/generative-ai-js
- **Lucide Icons:** https://lucide.dev
- **AI Studio:** https://ai.studio

---

**Last Updated:** December 7, 2025
**Maintained By:** AI-assisted development team
**Next Review:** When significant architectural changes occur

