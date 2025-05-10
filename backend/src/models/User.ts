import { Preferences } from "./Preferences";

export interface User {
    id: string;
    username: string;
    preferences: Preferences;
}