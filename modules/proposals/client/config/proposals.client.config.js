(function () {
	'use strict';

	angular.module('programs').run(['menuService', function (menuService) {
		menuService.addMenuItem ('topbar', {
			title: 'Proposals',
			state: 'proposals.list',
			roles: ['*'],
			icon: 'fa fa-usd',
			position: 5
		});
	}]);

	// angular
	// 	.module('proposals')
	// 	.run(menuConfig);

	// menuConfig.$inject = ['menuService'];

	// function menuConfig(menuService) {
	// 	// Set top bar menu items
	// 	menuService.addMenuItem('topbar', {
	// 		title: 'Proposals',
	// 		state: 'proposals',
	// 		type: 'dropdown',
	// 		roles: ['*']
	// 	});

	// 	// Add the dropdown list item
	// 	menuService.addSubMenuItem('topbar', 'proposals', {
	// 		title: 'List Proposals',
	// 		state: 'proposals.list'
	// 	});

	// 	// Add the dropdown create item
	// 	menuService.addSubMenuItem('topbar', 'proposals', {
	// 		title: 'Create Proposal',
	// 		state: 'proposals.create',
	// 		roles: ['user']
	// 	});
	// }
}());
