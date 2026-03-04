import { copyFileSync, readdirSync } from 'fs';
import { join } from 'path';

const src = 'assets';
const dst = 'public';
const files = readdirSync(src).filter(f => f.endsWith('.png'));
for (const f of files) {
  copyFileSync(join(src, f), join(dst, f));
  console.log(`Copied: ${f}`);
}
console.log('All done!');
