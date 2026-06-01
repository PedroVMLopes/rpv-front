export interface ParsedTrait {
    slug: string;
    name: string;
    description: string;
}

export function kebabCase(input: string): string {
    return input
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

/**
 * Open5e race/subrace traits are a single markdown string whose entries follow
 * a `**_Trait Name._** description...` pattern, separated by blank lines. We use
 * the bold headers as delimiters (rather than splitting on blank lines) so that
 * multi-paragraph descriptions stay attached to their trait.
 */
export function parseTraitBlocks(markdown: string): ParsedTrait[] {
    if (!markdown) {
        return [];
    }

    const header = /\*\*_(.+?)_\*\*/g;
    const headers: Array<{ name: string; start: number; end: number }> = [];
    let match: RegExpExecArray | null;

    while ((match = header.exec(markdown)) !== null) {
        headers.push({
            name: match[1],
            start: match.index,
            end: match.index + match[0].length,
        });
    }

    const traits: ParsedTrait[] = [];

    for (let i = 0; i < headers.length; i++) {
        const rawName = headers[i].name.replace(/\.\s*$/, "").trim();
        const descStart = headers[i].end;
        const descEnd =
            i + 1 < headers.length ? headers[i + 1].start : markdown.length;
        const description = markdown.slice(descStart, descEnd).trim();

        traits.push({
            slug: kebabCase(rawName),
            name: rawName,
            description,
        });
    }

    return traits;
}
