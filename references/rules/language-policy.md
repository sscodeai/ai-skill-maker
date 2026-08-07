# Language Policy

## Core Principle

Write reusable agent instructions in English so future AI coding agent sessions can reliably execute them. Ask interview questions and generate project-facing reference content in the user's selected project language and locale profile when that improves usefulness.

Language is not only translation. Capture the author's comfortable language, country or region context, and target audience locale so generated docs can match local expectations for tone, politeness, terminology, examples, dates, and public communication.

Start each genesis interview by asking the author's comfortable language and whether they want the rest of the interview and generated project-facing references to use that language. If yes, continue the interview in that language and bias generated project references toward that language and locale profile. If no, ask the author to choose the interview/output languages explicitly. Default to English when the author has no preference.

## Language Fields to Capture

- `instruction_language`: English by default for `SKILL.md` and procedural agent instructions.
- `project_docs_language`: language for docs and generated reference files.
- `public_voice_language`: language for website, README, release notes, and social/public copy.
- `developer_interview_language`: language used while asking the creator questions.
- `author_comfort_language`: language the maintainer thinks and reviews best in.
- `use_comfort_language_for_interview`: whether to continue creator interview questions in the author's comfortable language.
- `use_comfort_language_for_generated_references`: whether to bias generated project-facing references toward the author's comfortable language.
- `author_country_or_region`: country or region context that shapes default expression.
- `target_audience_locale`: country, region, or language community the project primarily addresses.
- `formality_profile`: plain, friendly, technical, formal, polite, community-oriented, enterprise, or another declared style.

## Rules

- Ask language and locale setup before deep product or technical intake.
- If the author wants to use their comfortable language, switch interview questions to that language immediately after the language setup answer.
- If the author does not want to use their comfortable language for the project, ask them to choose `developer_interview_language`, `project_docs_language`, and `public_voice_language`; default unresolved fields to English.
- Preserve product names, command names, API identifiers, paths, and code symbols in their original language.
- If the user mixes languages, ask whether generated project references should be bilingual or primarily one language.
- For multilingual projects, record which language belongs to docs, UI text, commit messages, comments, and releases.
- Do not translate legal, license, or policy text unless explicitly requested.
- For Japanese output, ask whether to use `です・ます`, `だ・である`, or a mixed technical documentation style. Also ask whether the audience is domestic Japan, global Japanese speakers, or bilingual engineers.
- For English output, ask whether to prefer US, UK, or neutral international English when spelling, dates, and public tone matter.
- For Chinese output, ask whether to use Simplified or Traditional Chinese and which regional expression should guide terminology.
- Use locale preferences for examples, date formats, currency, politeness, and public copy. Keep code identifiers and commands unchanged.
