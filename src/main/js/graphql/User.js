'use strict';

/**
 * @author palmtale
 * @since 2017/6/10.
 */
 
 
export default class UserResolver {

    services = null;

    client = null;

    constructor(services, client) {
        this.services = services;
        this.client = client;
    }

    _login = async (username, password) => {
        const oauthService = this.services.oauth;
        const result = await oauthService.token({
            params: {
                grant_type: 'password',
                client_id: this.client.id, client_secret: this.client.secret,
                username: username, password: password
            }
        });
        const r = result.body;
        r.expiresIn = r.accessTokenLifetime;
        delete r.accessTokenLifetime;
        return r;
    };

    get viewer() {
        return {
            user: async(_, {nill}, context) => {
                if(!context.user) {
                    return 403;
                }
                return context.user;
            },
            User: async (_, {id, username, email, mobile}, context) => {
                const userService = this.services.user;
                const user = await userService.getUserByUnique(id||username||email||mobile);
                if(!context.user || (context.user.id !== user.id && context.user.role_id !== 1)) {
                    return 403;
                }
                return user;
            }
        };
    }

    get mutation() {
        return {
            login: async(_, {username, password}) => {
                //login(username: String, password: String): AuthenticatePayload
                try {
                    return await this._login(username, password);
                } catch (e) {
                    return 500;
                }
            },

            signUp: async(_, {input}) => {
                const userService = this.services.user;
                try {
                    await userService.createUser(input);
                    return await this._login(input.username, input.password);
                } catch(e) {
                    return 500;
                }
            }
        };
    }

    get = () => ({
        Viewer: this.viewer,
        Mutation: this.mutation
    })
}