const TOOL_TASKS = [
  'duplicate-check',
  'create_property',
  'logical_delete_property',
  'hard_delete_property',
  'tenant-check',
  'balance-check',
  'hold-check',
] as const;

export const TOOL_TASK_PROMPT = TOOL_TASKS.join(', ');
const TOOL_TASK_SET = new Set<string>(TOOL_TASKS);

function cleanTask(raw: string): string {
  return raw.trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
}

export function mapToCanonicalTask(rawTask: string | undefined): string | null {
  if (!rawTask) return null;

  const trimmed = rawTask.trim().toLowerCase();
  if (!trimmed) return null;
  if (TOOL_TASK_SET.has(trimmed)) return trimmed;

  const cleaned = cleanTask(rawTask);
  if (!cleaned) return null;

  const hyphenated = cleaned.replace(/\s+/g, '-');
  if (TOOL_TASK_SET.has(hyphenated)) return hyphenated;

  const underscored = cleaned.replace(/\s+/g, '_');
  if (TOOL_TASK_SET.has(underscored)) return underscored;

  for (const canonical of TOOL_TASKS) {
    const canonicalWords = canonical.replace(/[_-]+/g, ' ');
    if (!canonicalWords) continue;
    if (cleaned === canonicalWords || cleaned.includes(canonicalWords)) {
      return canonical;
    }
  }

  return null;
}
