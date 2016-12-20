'use strict';

/**
 * Module dependencies
 */
var opportunitiesPolicy = require('../policies/opportunities.server.policy'),
  opportunities = require('../controllers/opportunities.server.controller');

module.exports = function(app) {
  // Opportunities Routes
  app.route('/api/opportunities').all(opportunitiesPolicy.isAllowed)
    .get(opportunities.list)
    .post(opportunities.create);

  app.route('/api/opportunities/:opportunityId').all(opportunitiesPolicy.isAllowed)
    .get(opportunities.read)
    .put(opportunities.update)
    .delete(opportunities.delete);

  //
  // opportunities for project
  //
  app.route('/api/opportunities/for/project/:projectId')
    .get(opportunities.forProject);

  //
  // get lists of users
  //
  app.route('/api/opportunities/members/:opportunityId')
    // .all(opportunitiesPolicy.isAllowed)
    .get(opportunities.listMembers);
  app.route('/api/opportunities/requests/:opportunityId')
    .all(opportunitiesPolicy.isAllowed)
    .get(opportunities.listRequests);

  //
  // modify users
  //
  app.route('/api/opportunities/requests/confirm/:opportunityId/:userId')
    .all(opportunitiesPolicy.isAllowed)
    .get(opportunities.confirmMember);
  app.route('/api/opportunities/requests/deny/:opportunityId/:userId')
    .all(opportunitiesPolicy.isAllowed)
    .get(opportunities.denyMember);

  app.route('/api/new/activity')
    // .all(opportunitiesPolicy.isAllowed)
    .get(opportunities.new);

  app.route('/api/request/activity/:opportunityId')
    .get(opportunities.request)

  // Finish by binding the Opportunity middleware
  app.param('opportunityId', opportunities.opportunityByID);
};