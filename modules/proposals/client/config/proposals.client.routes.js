// =========================================================================
//
// All the client side routes for proposals
//
// =========================================================================
(function () {
	'use strict';

	angular.module('proposals.routes').config(['$stateProvider', function ($stateProvider) {
		$stateProvider
		// -------------------------------------------------------------------------
		//
		// this is the top level, abstract route for all proposal routes, it only
		// contians the ui-view that all other routes get rendered in
		//
		// -------------------------------------------------------------------------
		.state('proposals', {
			abstract: true,
			url: '/proposals',
			template: '<ui-view/>'
		})
		// -------------------------------------------------------------------------
		//
		// proposal listing. Resolve to all proposals in the system and place that in
		// the scope. listing itself is done through a directive
		//
		// -------------------------------------------------------------------------
		.state('proposals.list', {
			url: '',
			templateUrl: '/modules/proposals/client/views/list-proposals.client.view.html',
			data: {
				pageTitle: 'Proposals List'
			},
			ncyBreadcrumb: {
				label: 'All proposals'
			},
			resolve: {
				proposals: function ($stateParams, ProposalsService) {
					return ProposalsService.query ();
				}
			},
			controller: 'ProposalsListController',
			controllerAs: 'vm'
		})
		// -------------------------------------------------------------------------
		//
		// view a proposal, resolve the proposal data
		//
		// -------------------------------------------------------------------------
		.state('proposals.view', {
			url: '/:proposalId',
			params: {
				programId: null,
				projectId: null
			},
			templateUrl: '/modules/proposals/client/views/view-proposal.client.view.html',
			controller: 'ProposalViewController',
			controllerAs: 'vm',
			resolve: {
				proposal: function ($stateParams, ProposalsService) {
					return ProposalsService.get({
						proposalId: $stateParams.proposalId
					}).$promise;
				}
			},
			data: {
				pageTitle: 'Proposal: {{proposal.name}}'
			},
			ncyBreadcrumb: {
				label: '{{vm.proposal.name}}',
				parent: 'proposals.list'
			}
		})
		// -------------------------------------------------------------------------
		//
		// the base for editing
		//
		// -------------------------------------------------------------------------
		.state('proposaladmin', {
			abstract: true,
			url: '/proposaladmin',
			template: '<ui-view/>'
		})
		// -------------------------------------------------------------------------
		//
		// edit a proposal
		//
		// -------------------------------------------------------------------------
		.state('proposaladmin.edit', {
			url: '/:proposalId/edit',
			params: {
				programId: null,
				projectId: null
			},
			templateUrl: '/modules/proposals/client/views/edit-proposal.client.view.html',
			controller: 'ProposalEditController',
			controllerAs: 'vm',
			resolve: {
				proposal: function ($stateParams, ProposalsService) {
					return ProposalsService.get({
						proposalId: $stateParams.proposalId
					}).$promise;
				},
				programs: function (ProgramsService) {
					return ProgramsService.myadmin ().$promise;
				},
				projects: function (ProjectsService) {
					return ProjectsService.myadmin ().$promise;
				},
				editing: function () { return true; },
				previousState: function ($state) {
					return {
						name: $state.current.name,
						params: $state.params,
						url: $state.href($state.current.name, $state.params)
					};
				}
			},
			data: {
				roles: ['admin', 'gov'],
				pageTitle: 'Proposal: {{ proposal.name }}'
			},
			ncyBreadcrumb: {
				label: 'Edit Proposal',
				parent: 'proposals.list'
			}
		})
		// -------------------------------------------------------------------------
		//
		// create a new proposal and edit it
		//
		// -------------------------------------------------------------------------
		.state('proposaladmin.create', {
			url: '/create',
			params: {
				programId: null,
				programTitle: null,
				projectId: null,
				projectTitle: null,
				context: null
			},
			templateUrl: '/modules/proposals/client/views/edit-proposal.client.view.html',
			controller: 'ProposalEditController',
			controllerAs: 'vm',
			resolve: {
				proposal: function (ProposalsService) {
					return new ProposalsService();
				},
				projects: function (ProjectsService) {
					return ProjectsService.myadmin ().$promise;
				},
				editing: function () { return false; },
				previousState: function ($state) {
					return {
						name: $state.current.name,
						params: $state.params,
						url: $state.href($state.current.name, $state.params)
					};
				}
			},
			data: {
				roles: ['admin', 'gov'],
				pageTitle: 'New Proposal'
			},
			ncyBreadcrumb: {
				label: 'New Proposal',
				parent: 'proposals.list'
			}
		})
		;
	}]);
}());

