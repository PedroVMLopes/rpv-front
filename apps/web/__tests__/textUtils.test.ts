import {
    stripLeadingLabel,
    stripMarkdown,
    truncateSummary,
} from "../lib/character/creation/textUtils";

describe("stripMarkdown", () => {
    it("strips headings, emphasis, and collapses whitespace", () => {
        expect(
            stripMarkdown("## Dwarf Traits\nYour **dwarf** has _inborn_ abilities.")
        ).toBe("Dwarf Traits Your dwarf has inborn abilities.");
    });
});

describe("stripLeadingLabel", () => {
    it("strips a labeled prefix even when the label has regex metacharacters", () => {
        expect(
            stripLeadingLabel(
                "Size (Small/Medium). You choose Small or Medium.",
                "Size (Small/Medium)"
            )
        ).toBe("You choose Small or Medium.");
    });

    it("is case-insensitive and treats a trailing period as optional", () => {
        expect(stripLeadingLabel("**_Age._** Dwarves mature slowly.", "Age")).toBe(
            "Dwarves mature slowly."
        );
    });
});

describe("truncateSummary", () => {
    it("returns stripped markdown unchanged when it fits", () => {
        expect(truncateSummary("**Short** summary")).toBe("Short summary");
    });

    it("truncates after stripping markdown and appends an ellipsis", () => {
        const value = `## Heading\n${"word ".repeat(50)}`;

        expect(truncateSummary(value, 20)).toBe("Heading word word w…");
        expect(truncateSummary(value, 20).endsWith("…")).toBe(true);
        expect(truncateSummary(value, 20).length).toBeLessThanOrEqual(20);
    });
});
