# Config Diff Tool

A powerful web-based configuration comparison tool built with React and TypeScript. Compare two configurations side-by-side with syntax highlighting, statistics, and multiple export options.

## Features

- 🔍 **Side-by-side Comparison**: Visual diff display showing additions, removals, and modifications
- 📊 **Diff Statistics**: Track added, removed, unchanged, and modified lines with similarity percentage
- 🚀 **High Performance**: Virtual scrolling for handling large configuration files efficiently
- 🎨 **Theme Support**: Light and dark theme options
- 📤 **Multiple Export Formats**: Export diffs as Text, CSV, PDF, or Markdown
- 📸 **Screenshot Capability**: Capture the diff view as an image
- ⚡ **Real-time Processing**: Instant diff calculation as you type or paste configurations
- 🛡️ **Error Handling**: Comprehensive error boundaries and validation

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Vic563/config-diff-tool-trae-windows.git
cd config-diff-tool-trae-windows

# Install dependencies
npm install
```

### Development

```bash
# Start the development server
npm run dev

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

## Usage

1. **Input Configurations**: Paste or type your configurations in the "Before" and "After" text areas
2. **Compare**: Click "Compare Configurations" to generate the diff
3. **View Results**: 
   - See the side-by-side comparison with color-coded changes
   - Review statistics showing the number of changes
   - Scroll through large diffs efficiently with virtualized rendering
4. **Export**: Choose from multiple export formats to save or share your diff

## Architecture

The application is built with modern React patterns and TypeScript for type safety:

- **React 18** with functional components and hooks
- **TypeScript** for type safety and better developer experience
- **Vite** for fast development and optimized builds
- **Virtual Scrolling** using `react-window` for performance
- **Diff Algorithm** powered by the `diff` library
- **Theme Context** for global theme management
- **Custom Hooks** for reusable logic

## Key Components

- `ConfigDiffEngine`: Core diff algorithm implementation
- `DiffViewer`: Virtualized component for rendering large diffs
- `useDiff`: Custom hook managing diff state and operations
- `ExportButtons`: Modular export functionality
- `ThemeContext`: Dark/light theme support

## Export Formats

- **Text**: Plain text diff output
- **CSV**: Structured data format for spreadsheet analysis
- **PDF**: Formatted document with syntax highlighting
- **Markdown**: GitHub-flavored markdown for documentation
- **Screenshot**: PNG image of the current view

## Performance

The tool is optimized for handling large configuration files:
- Virtual scrolling renders only visible lines
- Memoized computations prevent unnecessary recalculations
- Efficient diff algorithm with configurable options

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.