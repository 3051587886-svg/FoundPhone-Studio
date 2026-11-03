export type CallStep = { line: string; choices: { label: string; reply: string }[] };
export function parseCallDialogue(value: string | undefined): CallStep[] | null {
  if (!value) return null;
  try {
    const steps: unknown = JSON.parse(value);
    if (!Array.isArray(steps) || steps.length < 1 || steps.length > 12) return null;
    for (const step of steps) {
      if (!step || typeof step !== "object" || typeof step.line !== "string" ||
          !step.line || step.line.length > 300 || !Array.isArray(step.choices) ||
          step.choices.length < 1 || step.choices.length > 3) return null;
      for (const choice of step.choices) {
        if (!choice || typeof choice !== "object" ||
            typeof choice.label !== "string" || !choice.label || choice.label.length > 100 ||
            typeof choice.reply !== "string" || !choice.reply || choice.reply.length > 300) return null;
      }
    }
    return steps as CallStep[];
  } catch { return null; }
}
export function validCallHistory(steps: CallStep[], value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const result: string[] = [];
  for (const [index, choice] of value.entries()) {
    if (!steps[index] || typeof choice !== "string" || !/^[0-2]$/.test(choice) ||
        !steps[index].choices[Number(choice)]) break;
    result.push(choice);
  }
  return result;
}
