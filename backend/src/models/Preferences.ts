export interface Preferences {
    hipHop: number;
    rap: number;
    bpm: number;
    romantic: number;
    sad: number;
    happy: number;
    chill: number;
    [key: string]: number // allows additional dynamic metrics
}