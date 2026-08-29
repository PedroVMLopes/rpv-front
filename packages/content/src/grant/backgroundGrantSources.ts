import { getContentRepository } from "../repository/getContentRepository";
import type { Grant } from "./grant.types";

export function getBackgroundGrants(slug: string): Grant[] {
    return getContentRepository("dnd").getBackground(slug)?.grants ?? [];
}
