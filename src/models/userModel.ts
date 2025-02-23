export interface UserModel {
    accepted: number;
    cups_unit: number;
    email: string;
    first_name: string;
    last_name: string;
    networks_index: Map<string, string>;
    photoURL: string;
    temperature_unit: number;
}
