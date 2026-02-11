# Contributing to A11yCore

Thank you for your interest in contributing to A11yCore! This guide will help you get started.

## Development Setup

### Prerequisites

- Node.js 18+
- pnpm 8+

### Installation

```bash
# Clone the repository
git clone https://github.com/compa11y/compa11y.git
cd compa11y

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test
```

### Project Structure

```
compa11y/
├── packages/
│   ├── core/          # Framework-agnostic primitives
│   ├── react/         # React components & hooks
│   └── web/           # Web Components for CDN
├── examples/
│   ├── react-demo/    # React example app
│   └── vanilla-demo/  # Vanilla JS example
└── docs/              # Documentation (coming soon)
```

### Development Workflow

```bash
# Watch mode for a specific package
cd packages/core
pnpm dev

# Run tests in watch mode
pnpm test:watch

# Type check
pnpm typecheck
```

## Code Standards

### Accessibility Requirements

All components must meet these accessibility requirements:

1. **Keyboard Navigation**
   - All interactive elements must be keyboard accessible
   - Proper tab order and focus management
   - Support for arrow keys where applicable (menus, tabs, etc.)

2. **Screen Reader Support**
   - Proper ARIA roles, states, and properties
   - Live region announcements for dynamic content
   - Meaningful labels for all interactive elements

3. **Dev Warnings**
   - Components should warn developers about missing accessibility props
   - Warnings should include suggestions for fixes

4. **Testing**
   - Write tests for keyboard navigation
   - Test ARIA attribute changes
   - Test screen reader announcements

### Code Style

- TypeScript for all code
- Functional approach where possible
- Clear, descriptive names
- JSDoc comments for public APIs

### Commit Messages

Follow conventional commits:

```
feat(react): add Combobox component
fix(core): correct focus trap behavior with nested dialogs
docs: update Menu component examples
test(web): add Tab component tests
```

## Adding a New Component

1. **Core Utilities First**
   - Add any needed utilities to `@compa11y/core`
   - Keep framework-specific code out of core

2. **React Component**
   - Create in `packages/react/src/components/[name]/`
   - Include context, component, and index files
   - Export from main index

3. **Web Component**
   - Create in `packages/web/src/components/`
   - Extend `A11yKitElement` base class
   - Use Shadow DOM for encapsulation

4. **Documentation**
   - Add usage examples to README
   - Include keyboard navigation guide
   - Document all props/attributes

5. **Testing**
   - Unit tests for core logic
   - Integration tests for components
   - Accessibility tests

## Submitting Changes

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Make your changes
4. Run tests (`pnpm test`)
5. Commit with conventional commit message
6. Push and create a Pull Request

### PR Guidelines

- Keep PRs focused on a single change
- Include tests for new functionality
- Update documentation as needed
- Ensure all CI checks pass

## Questions?

- Open an issue for bugs or feature requests
- Check existing issues before creating new ones
- Be respectful and constructive in discussions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
