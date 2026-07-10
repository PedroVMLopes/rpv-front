export type RollModifierPart = {
    label: string;
    value: number;
};

export type D20TestRequest = {
    kind: "d20_test";
    id: string;
    label: string;
    die: 20;
    modifier: number;
    breakdown?: RollModifierPart[];
};

export type RollRequest = D20TestRequest;
