# 🤖 AI/ML Benchmark Suite

A **neobrutalist-styled web application** for systematic evaluation of artificial intelligence capabilities across multiple difficulty levels and domains.

![Neobrutalist Design](https://img.shields.io/badge/Style-Neobrutalist-000000?style=for-the-badge&logo=css3&logoColor=00FFFF)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-Semantic-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-Modern-1572B6?style=for-the-badge&logo=css3&logoColor=white)

## 🎯 **Project Overview**

This project contains two distinct web applications:

### 1. **NODAYSIDLE SECRET** (Original)
A neobrutalist dark-themed interface for exploring 7 mysterious cursed documents containing AI/ML training content, benchmarks, and educational materials.

### 2. **AI/ML Benchmark Suite** (New)
A comprehensive testing platform for evaluating AI capabilities across **45 carefully categorized benchmarks** spanning Easy, Medium, and Hard difficulty levels.

---

## 🚀 **Quick Start**

### **AI/ML Benchmark Suite**
```bash
# Clone the repository
git clone https://github.com/your-username/project_1.git
cd project_1

# Open the benchmark webapp
open webapp/ai-ml-benchmarks.html
# or serve via any web server
python3 -m http.server 8000
# Navigate to http://localhost:8000/webapp/ai-ml-benchmarks.html
```

### **Original NODAYSIDLE SECRET**
```bash
# Serve the files (original mentions port 9999)
python3 -m http.server 9999
# Navigate to http://localhost:9999
```

---

## 📋 **Benchmark Categories**

### 🟢 **Easy Benchmarks (20 total)**
- **Basic Knowledge**: Geography, biology, general facts
- **Language Tasks**: Translation, grammar correction, creative writing
- **Simple Programming**: Basic algorithms, HTML/CSS, simple functions
- **Mathematics**: Arithmetic, basic geometry, simple calculations

### 🟡 **Medium Benchmarks (15 total)**
- **Web Development**: React optimization, Express.js security, responsive design
- **Backend Systems**: API design, authentication, database optimization
- **Algorithms & Data Structures**: Search algorithms, complexity analysis
- **Security**: SQL injection prevention, rate limiting, JWT implementation

### 🔴 **Hard Benchmarks (10 total)**
- **System Architecture**: Distributed systems, microservices design
- **Advanced Graphics**: Ray tracing, physics simulation, game engines
- **Machine Learning**: Neural networks, advanced algorithms
- **Low-level Systems**: OS kernels, compilers, blockchain implementation

---

## 🎨 **Design Philosophy**

### **Neobrutalist Aesthetics**
- **High Contrast**: Pure black backgrounds with neon accents
- **Geometric Brutality**: Harsh shadows (4px-16px), thick borders
- **Monospace Typography**: JetBrains Mono, Courier New for tech aesthetic
- **Bold Color Coding**: 
  - 🟢 Green (Easy) 
  - 🟡 Orange (Medium) 
  - 🔴 Red (Hard)
  - 🔵 Cyan (Interface accents)

### **User Experience**
- **Accessibility First**: ARIA compliant, keyboard navigation, screen reader support
- **Progressive Enhancement**: Works without JavaScript, enhanced with it
- **Responsive Design**: Mobile-first approach with breakpoints at 768px/480px
- **Performance Optimized**: Minimal dependencies, efficient rendering

---

## 🛠️ **Technology Stack**

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend** | Vanilla HTML5/CSS3/JavaScript | Pure web standards, no frameworks |
| **Styling** | CSS Custom Properties | Consistent theming system |
| **Interactivity** | ES6+ JavaScript | Modern language features |
| **Storage** | LocalStorage | Progress persistence |
| **Accessibility** | ARIA, Semantic HTML | Universal usability |

---

## 📁 **Project Structure**

```
project_1/
├── 📄 README.md                    # This file
├── 📄 CLAUDE.md                    # Development guidance for Claude Code
├── 📄 INSTRUCTION.md               # Original benchmark source data
├── 📄 index.html                   # Original NODAYSIDLE SECRET interface
├── 📄 style.css                    # Original neobrutalist styling
├── 📄 tabs.js                      # Original tab switching functionality
├── 📁 webapp/
│   ├── 📄 ai-ml-benchmarks.html    # Main benchmark suite interface
│   ├── 📄 benchmark-style.css      # Neobrutalist styling system
│   ├── 📄 benchmark-app.js         # Interactive functionality & progress tracking
│   └── 📁 data/                    # Original document collection
│       ├── GOLDEN_SECRET_CURSED*.txt
│       └── 📁 clean/
└── 📁 docs/                        # Documentation (auto-generated)
```

---

## ⚡ **Key Features**

### **Progress Tracking**
- ✅ **Real-time progress bars** with completion percentages
- 💾 **Automatic save/restore** via browser localStorage
- 📊 **Live statistics**: Completed, Running, Total counts
- 🏆 **Achievement badges** with status indicators

### **Interactive Elements**
- 🔍 **Live search** across titles, descriptions, categories
- ⌨️ **Keyboard shortcuts**: Ctrl+1/2/3 for quick navigation
- 🎯 **One-click actions**: Start, Complete, Reset benchmarks
- 📱 **Touch-friendly** mobile interface

### **Accessibility**
- 🎧 **Screen reader optimized** with proper ARIA labels
- ⌨️ **Full keyboard navigation** support
- 🔍 **High contrast ratios** (4.5:1 minimum)
- 🏃 **Skip navigation** links for efficiency

---

## 🎮 **Usage Guide**

### **Getting Started**
1. **Open** the webapp in any modern browser
2. **Choose difficulty**: Click Easy/Medium/Hard tabs or use Ctrl+1/2/3
3. **Browse benchmarks**: Scroll through categorized challenges
4. **Start testing**: Click "Start Benchmark" to begin
5. **Track progress**: Mark complete when finished

### **Keyboard Shortcuts**
| Shortcut | Action |
|----------|--------|
| `Ctrl + 1` | Switch to Easy benchmarks |
| `Ctrl + 2` | Switch to Medium benchmarks |
| `Ctrl + 3` | Switch to Hard benchmarks |
| `Tab` | Navigate between interactive elements |
| `/` | Focus search input |

### **Search & Filter**
- Type in the search bar to filter benchmarks
- Search works across titles, descriptions, and categories
- Results update in real-time as you type

---

## 🧪 **Benchmark Examples**

### Easy: "Hello World Translation"
```
Translate "Artificial Intelligence is fascinating" to Japanese.
⏱️ Estimated Time: 2 minutes
📝 Type: Translation
```

### Medium: "Express Login Route"
```
Create secure Express.js login route with rate limiting and CSRF protection.
⏱️ Estimated Time: 45 minutes
📝 Type: Backend Security
```

### Hard: "Neural Network from Scratch"
```
Build and train neural network without frameworks.
⏱️ Estimated Time: 8+ hours
📝 Type: Deep Learning Implementation
```

---

## 🔧 **Development**

### **No Build Process Required**
This is a **pure web application** with no compilation, bundling, or build steps needed.

### **Local Development**
```bash
# Any static file server works
python3 -m http.server 8000
# or
npx serve .
# or
php -S localhost:8000
```

### **Code Style**
- **CSS**: BEM-like naming, CSS custom properties
- **JavaScript**: ES6+ classes, modules, modern syntax
- **HTML**: Semantic markup, accessibility-first

### **Testing**
- Manual testing across browsers
- Accessibility testing with screen readers
- Responsive design testing on multiple devices
- Performance profiling for optimal load times

---

## 🤝 **Contributing**

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### **Contribution Guidelines**
- Maintain neobrutalist design consistency
- Ensure accessibility compliance
- Add benchmarks with proper categorization
- Test across multiple browsers
- Update documentation

---

## 📊 **Browser Support**

| Browser | Support Level | Notes |
|---------|---------------|-------|
| Chrome 90+ | ✅ Full | Recommended for development |
| Firefox 88+ | ✅ Full | Excellent CSS Grid support |
| Safari 14+ | ✅ Full | iOS/macOS compatible |
| Edge 90+ | ✅ Full | Chromium-based versions |

**Requirements**: CSS Grid, ES6+ JavaScript, LocalStorage API

---

## 📜 **License**

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 **Acknowledgments**

- **Neobrutalist Design**: Inspired by brutalist architecture principles
- **Accessibility**: Following WCAG 2.1 guidelines
- **Typography**: JetBrains Mono, Courier New for technical aesthetic
- **Color Theory**: High contrast for optimal readability

---

## 📞 **Contact & Support**

- **Issues**: [GitHub Issues](https://github.com/your-username/project_1/issues)
- **Documentation**: See `CLAUDE.md` for development guidance
- **Original Content**: Based on benchmarks from `INSTRUCTION.md`

---

**Built with ❤️ and brutal aesthetics for systematic AI evaluation**

![Neobrutalist](https://img.shields.io/badge/Designed%20with-Brutal%20Aesthetics-000000?style=for-the-badge&logo=designsparkpcb&logoColor=00FFFF)