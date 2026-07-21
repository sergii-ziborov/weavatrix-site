// Ported from the engine repo's file-size-budget test when site/ moved here: versioned asset
// references must not go stale, the hero animation stays deterministic, and source files keep
// the same 300-line owner-module budget the engine holds itself to.
import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync, readdirSync} from 'node:fs'
import {extname, join} from 'node:path'
import {fileURLToPath} from 'node:url'

const REPO_ROOT = fileURLToPath(new URL('..', import.meta.url))
const CODE_EXTENSIONS = new Set(['.js', '.css', '.html'])
const MAX_LINES = 300

function physicalLineCount(text) {
    if (text === '') return 0
    const lines = text.split(/\r?\n/)
    if (lines.at(-1) === '') lines.pop()
    return lines.length
}

test('site assets stay within the 300-line budget', () => {
    const oversized = []
    for (const entry of readdirSync(join(REPO_ROOT, 'site'), {withFileTypes: true})) {
        if (!entry.isFile() || !CODE_EXTENSIONS.has(extname(entry.name).toLowerCase())) continue
        const lines = physicalLineCount(readFileSync(join(REPO_ROOT, 'site', entry.name), 'utf8'))
        if (lines > MAX_LINES) oversized.push(`site/${entry.name}: ${lines}`)
    }
    assert.deepEqual(oversized, [], `Split oversized concerns:\n${oversized.join('\n')}`)
})

test('versioned asset references are current and the hero animation stays deterministic', () => {
    const index = readFileSync(join(REPO_ROOT, 'site/index.html'), 'utf8')
    assert.ok(index.includes('href="/styles.css?v=0.3.9-hosted-shell-5"'), 'the page loads the Hosted-aligned shell stylesheet without a stale asset')
    assert.ok(index.includes('src="/graph-animation.js?v=0.3.9-hero-graph-6"'), 'the page loads the deterministic hero graph without a stale asset')
    assert.ok(index.includes('src="/hero-field.js?v=0.3.9-hero-field-1"'), 'the page loads the ambient hero field without a stale asset')
    const animation = readFileSync(join(REPO_ROOT, 'site/graph-animation.js'), 'utf8')
    assert.doesNotThrow(() => new Function(animation), 'the extracted browser script parses')
    assert.doesNotMatch(animation, /Math\.random/, 'the hero graph layout stays deterministic')
    const field = readFileSync(join(REPO_ROOT, 'site/hero-field.js'), 'utf8')
    assert.doesNotThrow(() => new Function(field), 'the ambient hero field script parses')
    assert.doesNotMatch(field, /Math\.random/, 'the ambient hero field stays deterministic')
})
