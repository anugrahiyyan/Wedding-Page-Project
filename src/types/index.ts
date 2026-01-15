export interface Tier {
    id: string;
    name: string;
    priceMin: number;
    priceMax: number;
    color: string;
}

export interface Template {
    id: string;
    name: string;
    description: string | null;
    thumbnail: string | null;
    price: number | null;
    tier: Tier | null;
}
