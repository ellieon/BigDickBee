    import {EnvironmentHelper as env} from "./environmentHelper";

const Pool = require('pg').Pool

export class SpotifyConnection{
    constructor(
        public connectionToken: string,
        public refreshToken: string,
        public expires: Date
    ) {
    }
}

export class UserID {
    user_id: string
}
export class DatabaseHelper {

    private static readonly CREATE_UPDATE: string = `
    INSERT INTO spotify_connections VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id) DO
        UPDATE SET connection_token = $2, refresh_token = $3, expires = $4
   `
    private static readonly GET_KEY: string =
            `SELECT connection_token, refresh_token, expires FROM spotify_connections WHERE user_id=$1`
    private static readonly GET_USERS: string = `SELECT user_id FROM spotify_connections`
    private static readonly DELETE_USERS: string = `DELETE from spotify_connections WHERE user_id=$1`

    readonly pool = new Pool({
        connectionString: env.getDatabaseURL()
    })

    constructor() {
    }

    async getSpotifyKeyForUser(userId: string): Promise<SpotifyConnection> {
        const res =
            await this.pool.query(
               DatabaseHelper.GET_KEY, [userId]).catch(console.log)

        if(res.rows.length === 0) {
            return undefined
        } else {
            const row = res.rows[0];
            let expires: Date = new Date(row.expires)
            return new SpotifyConnection(row.connection_token, row.refresh_token, expires)
        }
    }

    async setCurrentSpotifyKey(
        userId: string, connection_token: string, refresh_token: string, expires: Date): Promise<void>{
        return await this.pool.query(DatabaseHelper.CREATE_UPDATE,
            [userId, connection_token, refresh_token, expires.toISOString()])
    }

    async updateSpotifyKeyForUser(
        userId: string, connection_token: string, expires: Date): Promise<void>{
        return await this.pool.query("UPDATE spotify_connections SET user_id = $1, connection_token = $2, expires = $3 WHERE user_id = $1",
            [userId, connection_token, expires.toISOString()])
    }

    async getAllUserIds(): Promise<UserID[]> {
        return (await this.pool.query(DatabaseHelper.GET_USERS)).rows
    }

    async deleteUser(userId: string){
        return await this.pool.query(DatabaseHelper.DELETE_USERS, [userId])
    }


}

