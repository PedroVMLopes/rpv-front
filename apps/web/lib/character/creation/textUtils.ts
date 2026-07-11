export function stripMarkdown(value: string): string {
    return value
        .replace(/^#+\s*/gm, "")
        .replace(/\*\*_/g, "")
        .replace(/_\*\*/g, "")
        .replace(/\*\*/g, "")
        .replace(/_/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

export function truncateSummary(value: string, maxLength = 160): string {
    const plain = stripMarkdown(value);

    if (plain.length <= maxLength) {
        return plain;
    }

    return `${plain.slice(0, maxLength - 1).trimEnd()}…`;
}
