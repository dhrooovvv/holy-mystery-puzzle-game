// Build-time replacement for the Reddit bridge in the standalone local preview.
export function requestExpandedMode(_event: MouseEvent, entrypoint: string) {
  location.href = `${entrypoint === 'game' ? '/index.html' : '/splash.html'}?mode=demo`;
}
