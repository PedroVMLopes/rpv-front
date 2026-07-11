import { screen, within } from "@testing-library/react";

export function getCreationSidebar() {
    const sidebars = screen.getAllByTestId("character-creation-sidebar");

    return within(sidebars[0]!);
}
