declare class BaseUrl {
    private static baseUrl;
    private static discordLoginUrl;
    static getDiscordLoginLink(): string;
    static getBaseUrl(): any;
}
export declare const treat: {
    hello: string;
    ok: typeof BaseUrl;
};
export {};
