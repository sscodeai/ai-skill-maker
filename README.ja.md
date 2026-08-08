# AI Skill Maker

[English](README.md)

AI coding agent 向けに、再利用可能な skill と instruction bundle を作成します。

AI Skill Maker は meta-skill です。将来の AI セッションが特定の能力を実行したり、繰り返し使う artifact を生成したり、workflow を自動化したり、software project を保守したり、assistant platform 向けの instruction に展開したりするための durable skill を設計します。

このリポジトリは、実績のある `ai-project-skill-maker` の基盤から始め、それを project maintainer skill 以外にも使える形へ広げます。最初の scaffold では、互換性のために project-maintainer renderer と validation chain を残し、その後 functional-skill mode を追加していきます。

## Source of Truth and Installation

このリポジトリが `ai-skill-maker` skill の canonical source です。Codex personal skill としてローカルで使う場合は、runtime payload を次の場所へ install または sync します。

```text
~/.codex/skills/ai-skill-maker
```

ローカルの skill install に含めるのは runtime payload のみです。対象は `SKILL.md`、`agents/`、`references/`、`assets/`、`scripts/` です。`README.md`、`README.ja.md`、`LICENSE` などの repository documents はリポジトリ側に残します。

## Target Outputs

AI Skill Maker は次のような出力を作成または refresh することを目指します。

- presentation、Markdown report、PDF、spreadsheet、browser automation、API workflow などの functional skills
- reusable assets と style rules が重要な document/template skills
- deterministic scripts を含む workflow automation skills
- 長期運用する repository 向けの project maintainer skills
- `AGENTS.md`、`CLAUDE.md`、Cursor rules、GitHub Copilot instructions などの adapter instruction bundles

## Evidence Model

生成される references では、主張を次の種類に分けます。

- `observed_fact`: repository files、commands、metadata、examples、既存 skill files などから得られる証拠
- `declared_intent`: maintainer が明示した目標、制約、好み
- `recommended_standard`: skill type に合うため選ばれた標準
- `inferred_assumption`: 情報が不足している中での慎重な仮定

`observed_fact` は、可能な限り根拠となる source files を引用します。

## Current Scaffold

初期 scaffold には、`ai-project-skill-maker` から引き継いだ互換 tooling が含まれます。

- repo signal collection
- project-maintainer config の draft generation
- strict config validation
- project-maintainer skill rendering and validation
- `AGENTS.md`、`CLAUDE.md`、Cursor rules、`.github/copilot-instructions.md` 向け adapter rendering
- user-authored blocks を保持する refresh preservation
- functional-skill intake と existing-skill refresh checklists
- skills と artifacts 向けに一般化した evidence / language policies
- local install and self-check scripts

次の revisions で、general skill output schemas、functional-skill intake、generalized templates、examples、forward tests を追加します。

## Scripts

JSON config から general functional skill を生成します。

```bash
node scripts/render-skill.mjs --init-config functional > config.json
node scripts/render-skill.mjs --input config.json --output ./generated-skill
node scripts/validate-skill-output.mjs ./generated-skill
```

repository signals を収集します。

```bash
node scripts/collect-repo-signals.mjs /path/to/repo > repo-signals.json
```

互換 project-maintainer config を draft します。

```bash
node scripts/draft-project-config.mjs --repo /path/to/repo > config.json
```

現在の adapter outputs を生成します。

```bash
node scripts/render-adapter.mjs --input config.json --adapter agents --output .
node scripts/render-adapter.mjs --input config.json --adapter claude --output .
node scripts/render-adapter.mjs --input config.json --adapter cursor --output .
node scripts/render-adapter.mjs --input config.json --adapter copilot --output .
```

repository self-check を実行します。

```bash
node scripts/self-check.mjs
node scripts/self-check.mjs --check-installed
```

ローカルの Codex personal skill を install または sync します。

```bash
node scripts/install-local-skill.mjs
```

## License

Apache-2.0
