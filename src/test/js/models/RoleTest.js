
'use strict';

/**
 * @author palmtale
 * @since 2017/5/3.
 */

import chai from 'chai';
import log4js from 'koa-log4';

import RoleClass from '../../../main/js/models/Role';
import context from '../context';

chai.should();

const dbLogger = log4js.getLogger('test-db');
const Role = new RoleClass(context.persistence.common, {logger: dbLogger});
describe('Role model test', () => {
    it('Role constructor', () => {
        Role.should.have.property('create');
        Role.should.have.property('findOne');
    });

    it('Creat role', () => {
        return Role.create({name: 'Some Role', code: 'SMR'})
            .then(role => {
                role.should.have.property('id');
                role.id.should.not.equal(0);
            });
    });

    it('Retrieve and update role', () => {
        return Role.findOne({where: {code: 'SMR'}})
            .then(role => {
                role.should.have.property('name');
                role.name.should.equal('Some Role');
                return role.update({name: 'Updated Role'});
            }).then(role => {
                role.name.should.equal('Updated Role');
            })
    });

    it('Retrieve and delete role', () => {
        return Role.findOne({where: {code: 'SMR'}})
            .then(role => role.destroy())
            .then(result => result.length.should.equal(0))
    });
});