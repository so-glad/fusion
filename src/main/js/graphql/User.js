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

    get viewer() {
        return {
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

    }

    get = () => ({
        Viewer: this.viewer,
        Mutation: this.mutation
    })
}