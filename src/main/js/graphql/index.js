'use strict';

/**
 * @author palmtale
 * @since 2017/6/10.
 */

 
export default class {

    services = null;

    resolvers = [];

    constructor(services) {
        this.services = services;
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
        Query: {
            viewer: () => this.viewer
        },
        Viewer: this.viewer,
        Mutation: this.mutation
    });

    combine = (resolver) => {
        if(resolver.constructor.name === 'Array') {
            for(const i in resolver){
                this.resolvers.push(resolver[i]);
            }
        } else {
            this.resolvers.push(resolver);
        }
    };
}