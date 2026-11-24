import { requestExpandedMode } from '@devvit/web/client';
document.getElementById('investigate')!.addEventListener('click', event => {
  try { requestExpandedMode(event as MouseEvent, 'game'); }
  catch { document.getElementById('status')!.textContent = 'could not open the archive. tap investigate to try again.'; }
});
