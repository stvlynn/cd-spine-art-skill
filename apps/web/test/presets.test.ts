import { describe, expect, it } from 'vitest'
import catalog from '../catalog/presets.json' with { type: 'json' }
import { generatePresets } from '../scripts/lib/presets.ts'
import { aliasesOf, bundledIcon, preset, presets } from '../src/presets.ts'

const entry = { slug: 'typescript', group: 'stack', theme: 'grid' }
const source = (...entries: unknown[]) => ({ presets: entries })

describe('preset catalog validation', () => {
  it.each([
    ['missing list', {}],
    ['empty list', source()],
    ['unknown field', source({ ...entry, titel: 'TypeScript' })],
    ['missing field', source({ slug: 'typescript', group: 'stack' })],
    ['unknown group', source({ ...entry, group: 'language' })],
    ['unknown paint', source({ ...entry, paint: 'background' })],
    ['uppercase slug', source({ ...entry, slug: 'TypeScript' })],
    ['uppercase alias', source({ ...entry, aliases: ['TS'] })],
    ['invalid alias', source({ ...entry, aliases: ['../ts'] })],
    ['blank title', source({ ...entry, title: '  ' })],
    ['duplicate aliases in one entry', source({ ...entry, aliases: ['ts', 'ts'] })],
  ])('rejects %s', (_name, value) => {
    expect(() => generatePresets(value)).toThrow('Invalid preset catalog')
  })

  it('rejects unknown themes and missing icons before writing a registry', () => {
    expect(() => generatePresets(source({ ...entry, theme: 'missing' }))).toThrow(
      'Preset typescript: unknown theme missing',
    )
    expect(() => generatePresets(source({ ...entry, icon: 'not-an-icon' }))).toThrow()
    expect(() => generatePresets(source({ ...entry, slug: 'not-an-icon' }))).toThrow(
      'Preset not-an-icon: unknown Simple Icons slug not-an-icon',
    )
    expect(() => generatePresets(source({ ...entry, icon: 'notanicon' }))).toThrow(
      'Preset typescript: unknown Simple Icons slug notanicon',
    )
  })

  it('rejects duplicate slugs and aliases shared by multiple entries', () => {
    expect(() => generatePresets(source(entry, entry))).toThrow('Duplicate preset slug: typescript')
    expect(() =>
      generatePresets(
        source({ ...entry, aliases: ['shared'] }, { ...entry, slug: 'react', aliases: ['shared'] }),
      ),
    ).toThrow('alias shared conflicts')
  })

  it('rejects aliases shadowing any canonical slug, regardless of declaration order', () => {
    const aliased = { ...entry, aliases: ['react'] }
    const react = { ...entry, slug: 'react' }
    for (const entries of [
      [aliased, react],
      [react, aliased],
    ]) {
      expect(() => generatePresets(source(...entries))).toThrow('alias react conflicts')
    }
    expect(() => generatePresets(source({ ...entry, aliases: ['typescript'] }))).toThrow(
      'alias typescript conflicts',
    )
  })

  it('supports separate badge and icon slugs, with one static import per icon', () => {
    const output = generatePresets(
      source(entry, { ...entry, slug: 'custom-tool', icon: 'typescript' }),
    )
    expect(output.match(/^ {2}siTypescript,$/gm)).toHaveLength(1)
    expect(output).toContain("slug: 'custom-tool'")
    expect(output).toContain('title: siTypescript.title')
    expect(output).not.toContain('import *')
    expect(output).not.toContain('ajv')
  })

  it('escapes display titles as source code instead of interpolating executable text', () => {
    // biome-ignore lint/suspicious/noTemplateCurlyInString: Verify catalog text stays literal.
    const title = "O'Reilly\\Tools\n${globalThis.bad = true}\u2028"
    const output = generatePresets(source({ ...entry, title }))
    const literal = output.match(/^ {4}title: (.*),$/m)![1]!
    // Evaluating only the emitted string literal must recover the original text.
    expect(Function(`return ${literal}`)()).toBe(title)
  })
})

describe('registered catalog', () => {
  it('keeps the source order, defaults, overrides, and aliases in the runtime registry', () => {
    expect(presets.map(({ slug }) => slug)).toEqual(catalog.presets.map(({ slug }) => slug))
    for (const config of catalog.presets) {
      const found = preset(config.slug)!
      expect(found.group).toBe(config.group)
      expect(found.theme).toBe(config.theme)
      expect(found.paint).toBe(config.paint)
      expect(found.title).toBe(config.title ?? found.icon.title)
      expect(aliasesOf(config.slug)).toEqual(config.aliases ?? [])
      for (const alias of config.aliases ?? []) {
        expect(preset(alias.toUpperCase())).toBe(found)
      }
      expect(bundledIcon(found.icon.slug)).toBe(found.icon)
    }
  })

  it('does not treat object prototype properties as aliases', () => {
    expect(preset('constructor')).toBeUndefined()
    expect(preset('toString')).toBeUndefined()
    expect(preset('__proto__')).toBeUndefined()
  })
})
