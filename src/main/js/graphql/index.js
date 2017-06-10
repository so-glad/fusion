'use strict';

/**
 * @author palmtale
 * @since 2017/6/10.
 */

import UserResolver from './User';
 
export default class {

    services = null;

    resolvers = [];

    constructor(services) {
        this.services = services;
        this.resolvers.push(new UserResolver(services));
    }

    get viewer () {
        const viewer = {};
        for(const i in this.resolvers) {
            Object.assign(viewer, this.resolvers[i].viewer);
        }
        return viewer;
    }

    get mutation () {
        const mutation = {};
        for(const i in this.resolvers) {
            Object.assign(mutation, this.resolvers[i].mutation);
        }
        return mutation;
    }

    get = () => ({
        Viewer: this.viewer,
        Mutation: this.mutation
    });

    combine = (resolver) => {
        this.resolvers.push(resolver);
    };
}