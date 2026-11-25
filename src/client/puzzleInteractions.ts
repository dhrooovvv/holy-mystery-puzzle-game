/** Shared interaction rules, independent of rendering and server answer validation. */
export function photoFragmentAlignment(value: number, interaction: 'move' | 'release' = 'move'): number {
  const bounded = Math.max(-40, Math.min(40, Math.round(value)));
  return interaction === 'release' && Math.abs(bounded) <= 2 ? 0 : bounded;
}
export type CircuitSettings = { mode: 'daily' | 'demo'; main: boolean; backup: boolean; relay: boolean };
export function circuitSignature(settings: CircuitSettings): string {
  return JSON.stringify({ mode: settings.mode, main: settings.main, backup: settings.backup, relay: settings.relay });
}
export function isCircuitRecordingAvailable(response: { powered: boolean; query?: string }, settings: CircuitSettings): boolean {
  return response.powered === true && response.query === circuitSignature(settings);
}
