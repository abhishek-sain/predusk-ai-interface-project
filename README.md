# 🧠 AI Interface Prototype

A **beautiful, local-first, fully offline-capable** AI chat playground that delivers a **ChatGPT / Claude-level experience** entirely in the browser — no backend required for core functionality.

This project is designed as a **production-ready foundation** for building custom LLM interfaces. It includes multi-session management, streaming responses, rich markdown rendering, shareable conversations, PDF export, system prompts, fine-grained model parameters, and a polished dark/light theme — all while staying 100% functional offline.

Perfect for:
- Prototyping new LLM frontends
- Demoing models locally
- Building private/internal AI tools
- Learning advanced Next.js patterns

---

## 🚀 Live Demo

[https://ai-interface-prototype.vercel.app](https://ai-interface-prototype.vercel.app)  
(Deployed with Vercel — works completely offline after first load thanks to service worker caching)

---

## ✨ Key Features

### 🗂️ Multi-Session Conversation Management
- Unlimited chat sessions stored in `localStorage`
- Auto-generated titles from first user message (fallback: "New Chat")
- Create • Rename • Delete • Reorder sessions
- Active session highlighted with smooth transitions
- All sessions persist across browser restarts

### 🔗 Share Any Conversation
- One-click "Share" button generates a compressed URL
- Uses [**lz-string**](https://github.com/pieroxy/lz-string) for efficient compression
- Recipients open the link → entire chat (messages, model, parameters, system prompt) instantly loads
- Works even if the app is hosted on different domains

### 🎛️ Advanced Prompt Engineering Tools

#### System Prompt Editor
- Full-featured editor with saveable templates
- Templates loaded from `/api/templates` + user-created ones stored in `localStorage`
- Selected system prompt automatically injected as the first message (non-editable in chat)

#### Model & Sampling Parameters
| Parameter             | Range       | Default | Description |
|-----------------------|-------------|---------|-----------|
| **Model**             | Dropdown    | First available | Populated from `/api/models` |
| **Temperature**       | 0.00 – 2.00 | 0.70    | Controls randomness |
| **Top-p (Nucleus)**   | 0.00 – 1.00 | 0.92    | Alternative diversity control |
| **Max Tokens**        | 64 – 8192   | 2048    | Response length limit |
| **Presence Penalty**  | -2.0 – +2.0 | 0.0     | Discourage topic repetition |
| **Frequency Penalty** | -2.0 – +2.0 | 0.0     | Reduce word repetition |

All parameters are saved per-session.

### 💬 Rich Chat Experience
- **Realistic streaming** with variable token delays (simulated SSE-style)
- **Stop Generation** button during streaming
- Edit any previous user message → automatically removes subsequent messages and regenerates
- **Regenerate** last assistant response
- Full **Markdown rendering** with GitHub-flavored tables, task lists, etc.
- **Code syntax highlighting** (via `react-syntax-highlighter`, 20+ themes)
- **LaTeX math support** with **KaTeX** (inline `$x$` and display `$$...$$`)
- Copy message • Download as JSON • Hover timestamps

### 📤 Export Options
| Action                  | Format            | Library Used                    |
|-------------------------|-------------------|----------------------------------|
| Copy entire chat        | Plain text        | Clipboard API                    |
| Export conversation     | Markdown (.md)    | Blob + FileSaver                 |
| Export as PDF           | PDF               | `@react-pdf/renderer` (client-side) |
| Share via link          | Compressed URL    | `lz-string` + URLSearchParams    |

### ⭐ Response Feedback System
- Thumbs up/down on any assistant message
- Optional comment field
- All feedback stored in `localStorage` under `ai-feedback`
- Useful for future fine-tuning or analytics

### ⌨️ Keyboard Shortcuts
| Shortcut                 | Action                                  |
|--------------------------|------------------------------------------|
| `Cmd/Ctrl + K`           | Focus message input                     |
| `Cmd/Ctrl + Enter`       | Send message                            |
| `↑` (when input empty)   | Edit last user message                  |
| `Esc`                    | Stop streaming • Clear input • Close modals |
| `Cmd/Ctrl + Shift + F`   | Open feedback modal                     |

### 📱 Mobile-First Responsive Design
- Collapsible sidebar on screens < 768px
- Hamburger menu toggle
- Full-height chat on mobile
- Touch-friendly controls and sliders

### 🌓 Perfect Dark & Light Themes
- Tailwind CSS + CSS variables
- Automatic system preference detection
- Persistent choice saved in `localStorage`
- Smooth color transitions
- Theme toggle in header with sun/moon emoji

---

## 🛠 Tech Stack & Libraries

| Purpose                    | Technology / Library                               |
|----------------------------|-----------------------------------------------------|
| Framework                  | Next.js 14+ (App Router) + TypeScript               |
| Styling                    | Tailwind CSS + CSS variables                        |
| State Management           | React Context API (no Redux/Zustand)                |
| Animations                 | Framer Motion                                       |
| Markdown → React           | `react-markdown` + `remark-gfm`                     |
| Code Highlighting          | `react-syntax-highlighter`                          |
| Math Rendering             | `react-katex`                                               |
| PDF Export                 | `@react-pdf/renderer`                               |
| URL Compression            | `lz-string`                                         |
| Icons & Illustrations      | Lucide React (optional, easy to add)                |
| Component Documentation    | Storybook                                           |

---

## 📂 Project Structure

```bash
src/
├── app/
│   ├── page.tsx              → Main chat interface
│   ├── layout.tsx            → Providers + <html> setup
│   └── api/
│       ├── models/route.ts   → Mock model list
│       └── templates/route.ts→ Mock prompt templates
├── components/
│   ├── ai/                   → ChatArea, ModelSelector, PromptEditor, ParametersPanel
│   ├── layout/               → AppShell, Sidebar, Header, ExportMenu
│   └── ui/                   → Button, Slider, Modal, ChatBubble, ThemeToggle
├── context/
│   ├── SessionContext.tsx    → All chat state, sessions, streaming
│   └── ThemeContext.tsx      → Theme persistence & toggle
├── lib/
│   └── utils.ts              → Helpers (formatDate, truncate, etc.)
├── stories/                  → Storybook components
└── styles/
    └── globals.css           → Tailwind base + KaTeX