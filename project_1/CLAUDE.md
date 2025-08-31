# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the "NODAYSIDLE SECRET" web application - a neobrutalist dark-themed interface for exploring 7 mysterious cursed documents. It's a pure HTML/CSS/JavaScript application with no framework dependencies.

## Architecture

### Core Structure
- **index.html**: Main application structure with 7-tab interface
- **style.css**: Neobrutalist dark theme with high contrast design
- **tabs.js**: Tab switching functionality with accessibility features
- **webapp/data/**: Contains 7 text documents (GOLDEN_SECRET_CURSED*.txt)
- **webapp/data/clean/**: Clean versions of the documents

### Key Components

#### TabSwitcher Class (`tabs.js`)
The core JavaScript class that manages:
- Tab navigation and switching
- Keyboard accessibility (Ctrl+1-7, Alt+Arrow keys)
- URL hash management
- ARIA compliance and screen reader support
- Custom event dispatching

#### Design System (`style.css`)
- **Colors**: Black background (#000), green accent (#00ff00), magenta highlights (#ff00ff)
- **Typography**: Courier New monospace throughout
- **Layout**: CSS Flexbox for tabs, responsive breakpoints at 768px and 480px
- **Theme**: Neobrutalist with sharp borders, high contrast, and neon accents

## Development

### No Build Process
This is a static web application requiring no build tools, package managers, or compilation steps.

### Testing the Application
1. Serve the files via any web server on port 9999 (as mentioned in README)
2. Test tab switching functionality
3. Verify keyboard navigation works
4. Check responsive behavior on different screen sizes

### Key Features to Maintain
- **Accessibility**: ARIA roles, keyboard navigation, screen reader support
- **Responsiveness**: Mobile-first design with proper breakpoints 
- **Browser Compatibility**: Pure web standards, no framework dependencies
- **Performance**: Minimal JavaScript, efficient CSS, no external dependencies

## Document Content
The 7 documents contain AI/ML training content including:
- Core planning and decomposition exercises
- Tool use and API calling examples
- Safety and alignment guidelines  
- Grounding and citation discipline
- Memory and statefulness patterns
- Various coding and benchmarking challenges

## Code Conventions

### CSS
- Use BEM-like naming for components
- Maintain 4px border thickness for neobrutalist aesthetic
- Preserve monospace typography throughout
- Keep high contrast color scheme

### JavaScript
- ES6+ class-based architecture
- Event-driven design with custom events
- Defensive programming for DOM manipulation
- Comprehensive error handling and validation

### HTML
- Semantic markup with proper ARIA attributes
- Accessibility-first approach
- Clean, indented structure
- No inline styles (all CSS externalized)

## Files to Avoid Modifying
- Document content files (`webapp/data/*.txt`) contain training/benchmark data
- Core structure should remain intact to preserve the neobrutalist design aesthetic