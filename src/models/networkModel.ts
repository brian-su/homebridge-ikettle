export interface NetworkModel {
    access_tokens_fcm: Map<string, string>;
    associated_devices: Map<string, string>;
    members: Map<string, string>;
    name: string;
    owner: string;
}
