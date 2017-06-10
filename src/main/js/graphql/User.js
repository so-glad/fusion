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
                const {userService} = this.services;
                const user = await userService.findByUnique(id||username||email||mobile);
                if(context.user.id === user.id || context.user.role_id === 1) {
                    return user;
                } else {
                    return 403;
                }
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