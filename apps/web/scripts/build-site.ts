import { readFile, writeFile } from 'node:fs/promises'
import { withAnalytics } from '../src/analytics.ts'
import { buildPresets } from './build-presets.ts'

await buildPresets()

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8')
await writeFile(
  new URL('../public/index.html', import.meta.url),
  withAnalytics(html, process.env.GTM_ID),
)
