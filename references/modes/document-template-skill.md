# Document Template Skill Mode

Use this mode when the generated skill should create or edit repeatable document-like artifacts.

## Fits

- presentation skills
- Markdown report skills
- document, email, memo, proposal, spec, or changelog template skills
- spreadsheet workbook templates
- branded or style-sensitive artifact generation

## Intake

Ask for:

- artifact type and target reader
- examples of finished artifacts or source references
- tone, layout, language, locale, and formatting preferences
- required sections, optional sections, and forbidden sections
- source data shape and expected transformations
- whether visual QA, schema validation, or rendering checks are required
- reusable assets such as templates, screenshots, fonts, logos, sample data, or style references

## Output Guidance

- Store reusable source materials in `assets/` when they are copied or transformed.
- Store style rules, content patterns, and evaluation rubrics in `references/`.
- Add scripts only for deterministic rendering, conversion, validation, or extraction.
- Require visual or rendered verification when layout fidelity matters.
- Make the generated skill explicit about whether it creates new artifacts, edits existing artifacts, or both.
