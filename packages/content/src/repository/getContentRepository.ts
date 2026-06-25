import type { ContentRepository } from "./contentRepository.types";
import { StaticContentRepository } from "./staticContentRepository";

const repositories: Partial<Record<string, ContentRepository>> = {
    dnd: new StaticContentRepository(),
};

export function getContentRepository(system = "dnd"): ContentRepository {
    const repository = repositories[system];
    if (!repository) {
        throw new Error(`Unknown content system: ${system}`);
    }
    return repository;
}
