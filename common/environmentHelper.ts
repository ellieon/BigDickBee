export class EnvironmentHelper {

    static getBaseURL(): string {
        return process.env.BEE_URL
    }

    static getEnvironment(): string {
        return process.env.BEE_ENV || 'debug'
    }

    static isDevelopmentMode(): boolean {
        return this.getEnvironment() === 'debug'
    }

    static getDebugChannelName(): string {
        return process.env.BEE_DEBUG_CHANNEL
    }

    static getSpotifyClientId(): string {
        return process.env.BEE_SPOTIFY_CLIENT_ID
    }

    static getSpotifyClientSecret(): string {
        return process.env.BEE_SPOTIFY_CLIENT_SECRET
    }

    static getSpotifyCallbackUrl(): string {
        return `${this.getBaseURL()}/callback`
    }

    static getDiscordClientId(): string {
        return process.env.BEE_DISCORD_CLIENT_ID
    }

    static getDiscordClientSecret(): string {
        return process.env.BEE_DISCORD_CLIENT_SECRET
    }

    static getDiscordBotToken(): string {
        return process.env.BEE_DISCORD_BOT_TOKEN
    }

    static getDiscordCallbackUrl(): string {
        return `${this.getBaseURL()}/discord-callback`
    }

    static getDatabaseURL(): string {
        return process.env.DATABASE_URL
    }
}