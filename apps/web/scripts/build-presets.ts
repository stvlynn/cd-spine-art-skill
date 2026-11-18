import { readFile, writeFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import { generatePresets } from './lib/presets.ts'

const source = new URL('../catalog/presets.json', import.meta.url)
const target = new URL('../src/presets.generated.ts', import.meta.url)

export async function buildPresets({ check = false } = {}): Promise<void> {
  const generated = generatePresets(JSON.parse(await readFile(source, 'utf8')))
  let current: string | undefined
  try {
    current = await readFile(target, 'utf8')
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
  }
  if (current === generated) return
  if (check)
    throw new Error('Preset registry is out of date. Run pnpm presets and commit the result.')
  // Avoid triggering the dev watcher again when the generated source is unchanged.
  await writeFile(target, generated)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    await buildPresets({ check: process.argv.includes('--check') })
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  }
}
