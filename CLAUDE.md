# CLAUDE.md - FaceiQ Project Guide

## Project Overview

**FaceiQ** is an AI-powered facial aesthetics analysis and looksmaxxing coach application. The app analyzes user-uploaded photos using Google's Gemini AI to provide detailed aesthetic scores, improvement recommendations, and personalized coaching advice.

### Key Features
- **Face Scanning**: Analyzes facial features using Gemini 2.5 Flash
- **Aesthetic Scoring**: Provides detailed scores across multiple facial metrics
- **Mog Checker**: Compares two faces to determine aesthetic superiority
- **AI Coach**: Chat-based coaching for fitness, grooming, and style advice
- **Daily Routines**: Personalized improvement tasks and streak tracking

## Technology Stack

### Frontend
- **React 19.2.1**: UI library with hooks and functional components
- **TypeScript 5.8.2**: Type-safe development
- **Vite 6.2.0**: Build tool and dev server
- **Tailwind CSS**: Utility-first CSS via CDN (configured in index.html)

### AI & Services
- **Google Gemini AI** (`@google/genai` v1.31.0):
  - Model: `gemini-2.5-flash`
  - Features: Vision analysis, structured JSON output, chat completions
- **Mock Firebase Auth**: localStorage-based authentication (no real Firebase backend)

### UI Components
- **Lucide React** (v0.556.0): Icon library
- **Custom Components**: ScoreCard, Auth, App

## Project Structure

```
FaceiQ/
├── index.html              # Entry HTML with Tailwind config & import maps
├── index.tsx               # React app entry point
├── App.tsx                 # Main application component (650+ lines)
├── types.ts                # TypeScript interfaces and constants
├── metadata.json           # App metadata (name, description, permissions)
│
├── components/
│   ├── ScoreCard.tsx       # Reusable score display card
│   └── Auth.tsx            # Login/signup UI component
│
├── services/
│   ├── geminiService.ts    # Gemini AI integration & API calls
│   └── firebase.ts         # Mock authentication service
│
├── package.json            # Dependencies & scripts
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite build configuration
├── .gitignore              # Git ignore rules
└── README.md               # User-facing documentation
```

## Core Components & Services

### App.tsx
The main application component managing all views and state:

**State Management:**
- `activeTab`: Current view (SCAN, EXTRAS, DAILY, COACH)
- `selectedImage`: User's uploaded photo for analysis
- `result`: Analysis results from Gemini
- `chatHistory`: AI coach conversation history
- `mogImage1/mogImage2`: Images for face comparison
- `user`: Current authenticated user

**Views:**
1. **Scan View** (`renderScanView`): Face upload, analysis, and results
2. **Daily View** (`renderDailyView`): Routine tasks and streak tracking
3. **Coach View** (`renderCoachView`): AI chat interface
4. **Extras View** (`renderExtrasView`): Mog Checker comparison tool

**Features:**
- Touch gesture support for swipe navigation between tabs
- Progress animations during AI analysis
- Mobile-first responsive design (max-w-md container)

### services/geminiService.ts

**API Functions:**
- `analyzeFace(base64Image)`: Analyzes a single face
  - Uses structured JSON schema (`ANALYSIS_SCHEMA`)
  - Returns scores, tier, feedback, and improvements
  - Fallback error handling with mock data

- `compareFaces(img1, img2)`: Compares two faces
  - Uses `MOG_SCHEMA` for battle results
  - Returns winner, score difference, and roast

- `getCoachResponse(message, history)`: Chat completions
  - System instruction: "Gen-Z fitness/aesthetics coach"
  - Keeps responses short (1-3 sentences)
  - No emojis unless user uses them first

**Important Notes:**
- API key accessed via `process.env.API_KEY` (injected by Vite)
- All functions include try/catch with fallback responses
- Base64 images passed WITHOUT `data:image/jpeg;base64,` header

### services/firebase.ts

**Mock Authentication System:**
- **NOT real Firebase** - localStorage-based simulation
- Validates email format and password length (6+ chars)
- Persists user session in `localStorage.faceiq_mock_user`
- Supports: sign in, sign up, sign out, profile updates

**Functions:**
- `auth.signInWithEmailAndPassword(email, pass)`
- `auth.createUserWithEmailAndPassword(email, pass)`
- `auth.signOut()`
- `onAuthStateChanged(auth, callback)`

### types.ts

**Key Interfaces:**
```typescript
AnalysisResult {
  scores: { overall, potential, masculinity, jawline, skinQuality, cheekbones, eyeArea }
  tier: string  // "Chad Lite", "High Tier Normie", etc.
  feedback: string[]
  improvements: Array<{ area, advice, priority }>
}

MogResult {
  winnerIndex: 0 | 1
  winnerTitle: string
  diffScore: number
  reason: string
  roast: string
}

AppTab enum: SCAN | EXTRAS | DAILY | COACH
```

**Constants:**
- `TIER_MAP`: Score ranges mapped to tier labels
- `DAILY_TASKS`: Default routine tasks
- `COACH_TOPICS`: Pre-configured coaching questions

## Configuration Files

### vite.config.ts
```typescript
- Server: port 3000, host 0.0.0.0
- React plugin enabled
- Environment variables injected:
  - process.env.API_KEY → GEMINI_API_KEY
  - process.env.GEMINI_API_KEY → GEMINI_API_KEY
- Path alias: '@' → project root
```

### tsconfig.json
```typescript
- Target: ES2022
- Module: ESNext, bundler resolution
- JSX: react-jsx (React 19 automatic runtime)
- Path alias: @/* → ./*
- Experimental decorators enabled
- No emit (Vite handles compilation)
```

### index.html
- **Tailwind CSS**: Loaded via CDN with custom config
- **Import Maps**: Uses AI Studio CDN for React, Gemini, Firebase
- **Brand Colors**:
  - Primary: #8B5CF6 (violet)
  - Accent: #10B981 (emerald green)
  - Danger: #EF4444 (red)
  - Warn: #F59E0B (amber)
- Custom scrollbar hidden for clean UI

## Environment Setup

### Prerequisites
- Node.js (any modern version)
- Gemini API key from Google AI Studio

### Installation
```bash
npm install
```

### Environment Variables
Create `.env.local` in project root:
```
GEMINI_API_KEY=your_api_key_here
```

**Important:** The Vite config injects this as both `process.env.API_KEY` and `process.env.GEMINI_API_KEY`

### Development
```bash
npm run dev        # Start dev server on port 3000
npm run build      # Build for production
npm run preview    # Preview production build
```

## Code Conventions & Best Practices

### React Patterns
1. **Functional Components**: All components use React.FC with hooks
2. **State Colocation**: State kept close to where it's used
3. **Ref Usage**: `useRef` for file inputs, DOM refs, and gesture tracking
4. **Effect Dependencies**: Proper dependency arrays in useEffect

### TypeScript
- Explicit interface definitions in types.ts
- Type imports from types.ts
- Avoid `any` except in error handling
- Use optional chaining and nullish coalescing

### Styling
- **Tailwind Utilities**: Primary styling method
- **Custom Animations**: Defined in `<style>` tag in App.tsx
- **Brand Colors**: Use `brand-*` classes (defined in index.html)
- **Responsive**: Mobile-first, max-w-md container for app shell

### File Organization
- **Components**: Reusable UI in `/components`
- **Services**: API logic and external integrations in `/services`
- **Types**: Shared interfaces in root `types.ts`
- **Constants**: Exported from types.ts (TIER_MAP, DAILY_TASKS, etc.)

### Error Handling
- All async functions wrapped in try/catch
- User-facing error messages via `alert()` or error state
- Fallback data for failed API calls
- Console.error for debugging

## Common Development Tasks

### Adding a New Score Metric

1. Update `AnalysisResult` interface in `types.ts`
2. Add to `ANALYSIS_SCHEMA` in `geminiService.ts`
3. Update Gemini prompt to request the new metric
4. Add `<ScoreCard>` in `renderScanView()` results section

### Modifying AI Behavior

**Face Analysis:**
- Edit prompt in `analyzeFace()` function
- Adjust schema constraints in `ANALYSIS_SCHEMA`

**Coach Chat:**
- Modify `systemInstruction` in `getCoachResponse()`
- Current tone: "Gen-Z fitness coach, short responses"

**Mog Checker:**
- Edit prompt in `compareFaces()`
- Adjust `MOG_SCHEMA` for different output format

### Adding a New Tab

1. Add enum value to `AppTab` in types.ts
2. Create render function (e.g., `renderNewView()`)
3. Add state and handlers in App.tsx
4. Add navigation button in bottom nav
5. Add swipe gesture support in tab array

### Customizing UI Theme

Edit Tailwind config in `index.html`:
```javascript
tailwind.config.theme.extend.colors.brand = {
  primary: '#YOUR_COLOR',
  // ...
}
```

## Important Notes for AI Assistants

### Architecture Decisions

1. **No Real Backend**: Auth is localStorage-based mock. Users are not persisted.
2. **CDN Dependencies**: Import maps use AI Studio CDN, not node_modules
3. **Inline Tailwind Config**: Config in HTML, not external file
4. **Flat Structure**: No deep nesting; components at root of `/components`
5. **Single App Component**: All views in one 650-line App.tsx file

### When Modifying Code

**DO:**
- Maintain TypeScript strict typing
- Keep Gemini API calls in `geminiService.ts`
- Use existing brand color classes
- Follow mobile-first responsive patterns
- Include error handling with user feedback
- Test image upload and base64 handling

**DON'T:**
- Add real Firebase (it's intentionally mocked)
- Create new CSS files (use Tailwind or inline styles)
- Move Tailwind config to external file
- Add external state management (Redux, Zustand)
- Remove error fallbacks in API calls
- Add server-side code (this is client-only)

### Gemini API Specifics

- **Model**: Always use `gemini-2.5-flash` for speed
- **Image Format**: Base64 strings WITHOUT data URI prefix
- **Structured Output**: Use `responseSchema` for type-safe JSON
- **Rate Limits**: Handle with try/catch and fallback data
- **API Key**: Accessed via `process.env.API_KEY` (Vite injected)

### Testing Checklist

When making changes, verify:
- [ ] Image upload and base64 conversion works
- [ ] Gemini API calls handle errors gracefully
- [ ] Touch gestures work on mobile (swipe between tabs)
- [ ] Auth flow persists user in localStorage
- [ ] Scores display correctly with color coding
- [ ] Chat history scrolls to bottom on new messages
- [ ] Mobile viewport (max-w-md) displays correctly

### Known Limitations

1. **No Database**: User data and scans not persisted
2. **Mock Auth**: No password reset, email verification
3. **API Key Exposure**: Client-side API key (not production-ready)
4. **No Image Optimization**: Large images may slow analysis
5. **Limited Error States**: Some errors only show in console

### Git Workflow

- **Main Branch**: Not defined (Claude branches only)
- **Claude Branches**: Format `claude/claude-md-mivzmytrozohve27-*`
- **Commits**: Clear, descriptive messages
- **Push**: Always use `git push -u origin <branch-name>`

### Related Documentation

- [Google Gemini AI Docs](https://ai.google.dev/docs)
- [Vite Documentation](https://vitejs.dev)
- [React 19 Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**Last Updated**: 2025-12-07
**Version**: 0.0.0
**Maintained By**: AI Assistant (Claude)
