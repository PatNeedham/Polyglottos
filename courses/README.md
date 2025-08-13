# Course Content Management

This directory contains structured course content for the Polyglottos language learning platform. Content is organized by source and target languages to support multilingual learning paths.

## Directory Structure

```
courses/
├── {source-lang}/
│   └── {target-lang}/
│       ├── lessons/
│       │   ├── 01-basics/
│       │   │   ├── metadata.json
│       │   │   ├── lesson.md
│       │   │   └── quizzes/
│       │   │       ├── quiz-01.md
│       │   │       └── quiz-02.md
│       │   └── 02-intermediate/
│       └── course-metadata.json
└── templates/
    ├── lesson-template.md
    ├── quiz-template.md
    ├── metadata-template.json
    └── course-metadata-template.json
```

## Language Codes

Use ISO 639-1 language codes for directory names:
- `en` - English
- `es` - Spanish
- `da` - Danish
- `hi` - Hindi
- `fr` - French
- `de` - German
- etc.

## Example

For Spanish speakers learning English:
- Source language: `es` (Spanish)
- Target language: `en` (English)
- Path: `courses/es/en/`

## Content Types

### Lessons
- **metadata.json**: Lesson metadata including title, difficulty, objectives
- **lesson.md**: Main lesson content with explanations and examples
- **quizzes/**: Directory containing quiz files for the lesson

### Quizzes
- **quiz-*.md**: Individual quiz files with questions and answers

### Course Metadata
- **course-metadata.json**: Overall course information including title, description, learning path

## Validation

All content submissions are automatically validated using JSON Schema and custom validation rules. See the `.github/workflows/validate-content.yml` workflow for details.

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines on contributing course content.