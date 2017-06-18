'use strict';

/**
 * @author palmtale
 * @since 2017/6/10.
 */
 
 
export default class UserResolver {

    services = null;

    constructor(services) {
        this.services = services;
    }

    _login = async (username, password, client) => {
        const oauthService = this.services.oauth;
        const result = await oauthService.token({
            params: {
                grant_type: 'password',
                client_id: client.id, client_secret: client.secret,
                username: username, password: password
            }
        });
        const auth = result.body;
        auth.expiresIn = auth.accessTokenLifetime;
        delete auth.accessTokenLifetime;
        return auth;
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
            login: async(_, {username, password}, context) => {
                //login(username: String, password: String): AuthenticatePayload
                try {
                    return await this._login(username, password, context.client);
                } catch (e) {
                    return 500;
                }
            },

            signUp: async(_, {input}, context) => {
                const userService = this.services.user;
                try {
                    await userService.createUser(input);
                    return await this._login(input.username, input.password, context.client);
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