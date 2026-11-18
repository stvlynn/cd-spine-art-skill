import type { ThemeId } from '@repo/spine'
import type { SimpleIcon } from 'simple-icons'
import { aliases, presets } from './presets.generated.ts'

export { presets }

/**
 * The catalog of common AI tools and tech stacks, used like shields.io badges:
 * `/badge/typescript,react,docker.svg`. Each entry is meant to be a print of
 * its own in `art/<group>/<slug>.png`; until that print is drawn, the entry
 * is typeset in the look given here. Marks and brand colors come from Simple
 * Icons and are bundled, so a badge never waits on another server.
 *
 * `paper` prints the whole sheet in the brand color; `accent` keeps the
 * theme's paper and uses the brand color for the artwork only, which suits
 * colors that are too light or too dark to carry text.
 */
export interface Preset {
  slug: string
  title: string
  /** Also the folder under `art/` that holds its print. */
  group: 'ai' | 'stack'
  theme: ThemeId
  icon: SimpleIcon
  paint?: 'paper' | 'accent'
}

const bySlug = new Map(presets.map((entry) => [entry.slug, entry]))
const byAlias = new Map(aliases)
const iconsBySlug = new Map(presets.map(({ icon }) => [icon.slug, icon]))

/** The short names that lead to a preset, so search can find it by them too. */
export function aliasesOf(slug: string): string[] {
  return aliases.filter(([, target]) => target === slug).map(([alias]) => alias)
}

export function preset(slug: string): Preset | undefined {
  const key = slug.toLowerCase()
  return bySlug.get(byAlias.get(key) ?? key)
}

/** A bundled Simple Icons mark by slug, so presets' marks need no network. */
export function bundledIcon(slug: string): SimpleIcon | undefined {
  return iconsBySlug.get(slug.toLowerCase()) ?? preset(slug)?.icon
}
