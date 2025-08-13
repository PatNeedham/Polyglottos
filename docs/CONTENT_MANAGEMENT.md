# Course Content Management System

This document provides a comprehensive guide to the GitHub-based course content management system for Polyglottos.

## Overview

The Polyglottos course content management system provides a structured, version-controlled approach to creating and maintaining language learning content. All course materials are stored in GitHub and automatically validated through CI/CD pipelines.

## Architecture

### Content Structure

```
courses/
├── schemas/                    # JSON schemas for validation
│   ├── course-metadata.json
│   ├── lesson-metadata.json
│   └── quiz-metadata.json
├── templates/                  # Templates for new content
│   ├── course-metadata-template.json
│   ├── lesson-metadata-template.json
│   ├── lesson-template.md
│   └── quiz-template.json
├── {source-lang}/              # ISO 639-1 language codes
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
└── index.json                 # Auto-generated content index
```

### Validation Pipeline

1. **Schema Validation**: All JSON files are validated against predefined schemas
2. **Markdown Linting**: Lesson content is checked for consistent formatting
3. **Structure Validation**: Directory structure follows naming conventions
4. **Content Validation**: Custom rules ensure content quality and completeness

### Deployment Pipeline

1. **Content Validation**: Re-validation before deployment
2. **Index Generation**: Creates searchable content index
3. **Artifact Creation**: Packages content for distribution
4. **Deployment**: Updates live content (configurable endpoints)

## Content Types

### Course Metadata

Defines overall course information including:

- Course title and description
- Source and target languages
- Difficulty level and estimated duration
- Author information and version
- Prerequisites and tags

**File**: `course-metadata.json`
**Schema**: `courses/schemas/course-metadata.json`

### Lesson Content

Each lesson consists of:

- **Metadata** (`metadata.json`): Learning objectives, vocabulary, topics
- **Content** (`lesson.md`): Main instructional content
- **Quizzes** (`quizzes/*.json`): Interactive practice exercises

### Quiz Types

Supported quiz formats:

- **Multiple Choice**: Single or multiple correct answers
- **Fill-in-the-Blank**: Text completion exercises
- **Translation**: Bidirectional language translation
- **Listening**: Audio comprehension (with audio URLs)
- **Matching**: Pair matching exercises
- **Ordering**: Sequence arrangement tasks

## Content Creation Workflow

### 1. Planning

- Define learning objectives
- Identify target audience and difficulty level
- Plan lesson progression and dependencies

### 2. Content Development

- Copy templates from `courses/templates/`
- Create course and lesson metadata
- Write lesson content in markdown
- Develop interactive quizzes

### 3. Validation

- Local validation using CLI tools
- Automated validation in pull requests
- Content review by language experts

### 4. Publication

- Merge to main branch triggers deployment
- Content index automatically updates
- Live content becomes available

## Quality Standards

### Content Quality

- **Linguistic Accuracy**: Native speaker review required
- **Cultural Sensitivity**: Appropriate cultural context
- **Pedagogical Soundness**: Evidence-based learning design
- **Progressive Difficulty**: Logical skill building

### Technical Standards

- **Schema Compliance**: All metadata must validate
- **Markdown Quality**: Consistent formatting and structure
- **Asset Management**: Proper referencing of audio/image files
- **Version Control**: Semantic versioning for content updates

## Automation Features

### Content Validation

GitHub Actions automatically:

- Validates JSON schemas on every PR
- Lints markdown for consistency
- Checks directory structure compliance
- Runs custom content quality checks

### Content Deployment

Deployment pipeline:

- Validates content before release
- Generates searchable content index
- Creates deployment artifacts
- Supports multiple deployment targets

### Content Discovery

Auto-generated features:

- Course catalog with metadata
- Learning path recommendations
- Progress tracking integration
- Search and filtering capabilities

## Integration Points

### Learning Platform Integration

The content system integrates with:

- **User Progress Tracking**: Completion and scoring data
- **Adaptive Learning**: Difficulty adjustment based on performance
- **Content Recommendation**: Personalized learning paths
- **Analytics**: Usage patterns and learning outcomes

### Content Management

Administrative features:

- **Version Control**: Full content history and rollback
- **Author Management**: Contributor tracking and permissions
- **Content Analytics**: Usage statistics and effectiveness metrics
- **Quality Assurance**: Automated and manual review processes

## Configuration

### Environment Variables

For deployment workflows:

```bash
# Content validation
VALIDATE_CONTENT=true

# Deployment targets
CONTENT_API_URL=https://api.polyglottos.com/content
CONTENT_STORAGE_BUCKET=polyglottos-content

# Authentication
CONTENT_API_KEY=your-api-key
STORAGE_CREDENTIALS=your-credentials
```

### Workflow Configuration

Customize validation and deployment in:

- `.github/workflows/validate-content.yml`
- `.github/workflows/deploy-content.yml`
- `.markdownlint.json`

## Monitoring and Maintenance

### Health Checks

Regular monitoring of:

- Content validation pipeline success rates
- Deployment pipeline reliability
- Content freshness and update frequency
- User engagement with content

### Maintenance Tasks

Periodic activities:

- Schema updates for new content types
- Template improvements based on usage
- Performance optimization for large content sets
- Security updates for dependencies

## Getting Started

### For Content Contributors

1. Review [CONTRIBUTING.md](../CONTRIBUTING.md)
2. Use templates in `courses/templates/`
3. Follow validation guidelines
4. Submit content via pull requests

### For Developers

1. Understand schema definitions
2. Set up local validation tools
3. Configure deployment pipelines
4. Implement content API integrations

### For Administrators

1. Configure GitHub Actions workflows
2. Set up deployment endpoints
3. Monitor content quality metrics
4. Manage contributor permissions

## Future Enhancements

### Planned Features

- **Visual Content Support**: Images, videos, interactive media
- **Advanced Quiz Types**: Speech recognition, drawing exercises
- **Collaborative Editing**: Multi-author content development
- **Real-time Preview**: Live content preview during editing
- **A/B Testing**: Content effectiveness experiments

### Technical Improvements

- **Performance Optimization**: Faster validation and deployment
- **Enhanced Analytics**: Detailed content usage insights
- **Mobile Optimization**: Mobile-first content delivery
- **Offline Support**: Downloadable content packages
- **Internationalization**: Multi-language content management

## Support

For questions or issues:

- **Content Questions**: Open GitHub issue with `content` label
- **Technical Issues**: Open GitHub issue with `technical` label
- **General Support**: Contact maintainers via GitHub discussions

## License

Course content is licensed under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0) unless otherwise specified.