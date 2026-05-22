# Contributing to Surviving South AAH!!!

## Code of Conduct

Be respectful. Be inclusive. Remember the goal: creating an empathetic, realistic simulation of South African survival.

## How to Contribute

### Reporting Issues

- Use clear, descriptive titles
- Explain the problem and expected behavior
- Include system specs if relevant
- Tag with appropriate labels (bug, feature, design, etc.)

### Proposing Features

- Open an issue with `[FEATURE]` prefix
- Explain the feature and why it matters
- Discuss impact on game tone and design
- Link to design document sections if relevant

### Content Contributions

If adding events, NPCs, or dialogue:
- Ensure cultural authenticity
- Avoid stereotyping
- Ground in real South African experience
- Include context and sources if inspired by real events
- Submit as draft for community review

### Code Contributions

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Follow code standards (see TECHNICAL.md)
4. Write/update tests
5. Commit with clear messages: `[Category] Description`
6. Push and create a pull request

### Code Style

- **Language**: GDScript (Godot) or C#
- **Naming**: PascalCase for classes, snake_case for methods
- **Docstrings**: Required for public methods
- **Line length**: Max 100 characters
- **Comments**: Explain why, not what

### Testing

Before submitting:
- Run all unit tests
- Test on low-end device if possible
- Verify save/load functionality
- Check for memory leaks
- Test accessibility features

## Development Setup

1. Install Godot 4.x (LTS recommended)
2. Clone repository
3. Open project.godot in Godot
4. Check branch matches your work
5. Install any dependencies (documented in SETUP.md)

## Commit Guidelines

Format:
```
[Category] Brief description

Optional longer explanation if needed.
Fixes #issue_number (if applicable)
```

Categories:
- `[Core]` - Core systems (stats, time, economy)
- `[Features]` - New gameplay features
- `[Content]` - Events, dialogue, NPCs
- `[UI]` - User interface updates
- `[Audio]` - Sound and music
- `[Fix]` - Bug fixes
- `[Docs]` - Documentation
- `[Performance]` - Optimization
- `[Tests]` - Testing additions

## Questions?

Open an issue with `[QUESTION]` prefix or use Discussions tab.

Thank you for helping create this game.
