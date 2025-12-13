# Contributing to Polyglottos

We're thrilled you're interested in contributing to Polyglottos! Whether you're fixing a bug, adding a new feature, improving documentation, or creating course content, your contributions are valuable. Please open [a Github Issue](https://github.com/PatNeedham/Polyglottos/issues/new) first describing the intended contribution and relevant details.

## Types of Contributions

### 1. Code Contributions
Bug fixes, new features, performance improvements, and technical enhancements to the platform.

### 2. Course Content Contributions
Educational content including lessons, quizzes, and language learning materials.

### 3. Documentation
Improvements to documentation, guides, and educational resources.

## Course Content Contributions

### Getting Started with Course Content

Course content in Polyglottos follows a structured format to ensure consistency and quality across all languages and difficulty levels.

#### Directory Structure
All course content is organized under the `courses/` directory using the following structure:
```
courses/
├── {source-lang}/
│   └── {target-lang}/
│       ├── course-metadata.json
│       └── lessons/
│           ├── 01-lesson-name/
│           │   ├── metadata.json
│           │   ├── lesson.md
│           │   └── quizzes/
│           │       ├── quiz-01.json
│           │       └── quiz-02.json
│           └── 02-next-lesson/
└── templates/
```

#### Language Codes
Use ISO 639-1 language codes (2 lowercase letters):
- `en` - English
- `es` - Spanish  
- `da` - Danish
- `hi` - Hindi
- `fr` - French
- `de` - German
- etc.

**Example:** For Spanish speakers learning English, use `courses/es/en/`

### Content Guidelines

#### 1. Course Metadata (`course-metadata.json`)
Every course must include a metadata file describing:
- Course title and description
- Source and target languages
- Difficulty level (beginner/intermediate/advanced)
- Estimated completion time
- Author information
- Prerequisites

#### 2. Lesson Structure
Each lesson should include:
- **`metadata.json`**: Lesson metadata with objectives, topics, and vocabulary
- **`lesson.md`**: Main lesson content with explanations and examples
- **`quizzes/`**: Directory containing quiz files for practice

#### 3. Quiz Format
Quizzes support multiple types:
- Multiple choice
- Fill-in-the-blank
- Translation
- Listening comprehension
- Matching exercises

#### 4. Content Quality Standards
- **Accuracy**: All content must be linguistically accurate
- **Cultural Sensitivity**: Respect cultural contexts and avoid stereotypes
- **Progression**: Lessons should build upon previous concepts
- **Engagement**: Include interactive elements and real-world examples

### Creating New Course Content

#### Step 1: Use Templates
Start with the provided templates in `courses/templates/`:
- `course-metadata-template.json`
- `lesson-metadata-template.json`
- `lesson-template.md`
- `quiz-template.json`

#### Step 2: Follow Naming Conventions
- Lesson directories: `01-lesson-name`, `02-next-lesson`
- Quiz files: `quiz-01.json`, `quiz-02.json`
- Use descriptive, URL-friendly names

#### Step 3: Validate Content
Before submitting, ensure your content passes validation:
```bash
# Install validation tools
npm install -g ajv-cli markdownlint-cli

# Validate JSON against schemas
ajv validate -s courses/schemas/course-metadata.json -d your-course-metadata.json

# Lint markdown files
markdownlint your-lesson.md
```

### Content Review Process

1. **Submission**: Submit content via pull request
2. **Automated Validation**: GitHub Actions will validate structure and format
3. **Content Review**: Language experts and maintainers review for accuracy
4. **Feedback**: Address any requested changes
5. **Approval**: Content is merged after approval

### Content Validation

All course content is automatically validated for:
- **JSON Schema Compliance**: Metadata files must match defined schemas
- **Markdown Quality**: Lessons must pass markdown linting
- **Directory Structure**: Must follow established folder conventions
- **Language Codes**: Must use valid ISO 639-1 codes

The validation runs automatically on every pull request affecting the `courses/` directory.

### Translation Guidelines

When translating existing content:
- Maintain the same lesson structure and objectives
- Adapt cultural references appropriately
- Ensure translations are natural, not literal
- Include pronunciation guides when helpful
- Test with native speakers when possible

### Getting Help

- **Questions**: Open a GitHub issue with the `course-content` label
- **Language Support**: Connect with other contributors working on the same language
- **Technical Issues**: Tag maintainers in your pull request

Thank you for helping make language learning accessible to everyone! 🌍
