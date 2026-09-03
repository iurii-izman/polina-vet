export function medicalBlockId(type: string, key?: string): string {
  return `medical-block-${key ?? type}`;
}
