(function () {
	'use strict';
	angular.module ('proposals')
	// -------------------------------------------------------------------------
	//
	// directive for listing proposals
	//
	// -------------------------------------------------------------------------
	.directive ('proposalList', function () {
		return {
			restrict     : 'E',
			controllerAs : 'vm',
			scope        : {
				project: '=',
				program: '=',
				title: '@',
				context: '@'
			},
			templateUrl  : '/modules/proposals/client/views/list.proposals.directive.html',
			controller   : function ($scope, ProposalsService, Authentication, Notification, modalService, $q) {
				var rightNow = new Date ();
				var vm     = this;
				var isUser = Authentication.user;
				vm.isUser = isUser;
				vm.isAdmin = isUser && !!~Authentication.user.roles.indexOf ('admin');
				vm.isGov   = isUser && !!~Authentication.user.roles.indexOf ('gov');
				vm.canApplyGeneral = isUser && !vm.isAdmin && !vm.isGov;
				vm.project = $scope.project;
				vm.program = $scope.program;
				vm.context = $scope.context;
				if (vm.context === 'project') {
					vm.programId    = vm.program._id;
					vm.programTitle = vm.program.title;
					vm.projectId    = vm.project._id;
					vm.projectTitle = vm.project.name;
					vm.title         = 'Proposals for '+vm.projectTitle;
					vm.userCanAdd    = vm.project.userIs.admin || vm.isAdmin;
					vm.proposals = ProposalsService.forProject ({
						projectId: vm.projectId
					});
					vm.columnCount   = 1;
				} else if (vm.context === 'program') {
					vm.programId    = vm.program._id;
					vm.programTitle = vm.program.title;
					vm.projectId    = null;
					vm.projectTitle = null;
					vm.title         = 'Proposals for '+vm.programTitle;
					vm.userCanAdd    = (vm.isAdmin || vm.isGov);
					vm.proposals = ProposalsService.forProgram ({
						programId: vm.programId
					});
					vm.columnCount   = 1;
				} else {
					vm.programId    = null;
					vm.programTitle = null;
					vm.projectId    = null;
					vm.projectTitle = null;
					vm.title         = 'All Proposals';
					vm.userCanAdd    = (vm.isAdmin || vm.isGov);
					vm.proposals = ProposalsService.query ();
					vm.columnCount   = 1;
				}
				if ($scope.title) vm.title = $scope.title;
				vm.publish = function (proposal, state) {
					var publishedState = proposal.isPublished;
					var t = state ? 'Published' : 'Un-Published'
					proposal.isPublished = state;

					proposal.doNotNotify = false;
					var modalOptions = {
			        closeButtonText: 'Do Not Send Notification',
			        actionButtonText: 'Send Notification',
			        headerText: 'Publish Proposal',
			        bodyText: 'You are re-publishing this proposal. Would you like to re-notify all subscribed users?'
			    };
			    var promise;
			    //
			    // Bypass the modal if first time publishing OR if unpublishing
			    //
			    if ((proposal.isPublished && !proposal.lastPublished) ||
			    			!proposal.isPublished) {
			    	promise = $q.resolve();
			    }
			    else {
			    	promise = modalService.showModal({}, modalOptions)
		        .then(function sendNotification (result) {
		        		proposal.doNotNotify = false;
		        		console.log('send notify callback')
		        },
		        function doNotSendNotificaiton (result) {
		        	proposal.doNotNotify = true;
		        	console.log('do not send notify callback')
		        })
			    }

	        //
					// success, notify and return to list
					//
	        promise.then(function() {
	        	return proposal.createOrUpdate();
	        })
					.then (function (res) {
						Notification.success ({
							message : '<i class="glyphicon glyphicon-ok"></i> Proposal '+t+' Successfully!'
						});
					})
					//
					// fail, notify and stay put
					//
					.catch (function (res) {
						proposal.isPublished = publishedState;
						Notification.error ({
							message : res.data.message,
							title   : '<i class=\'glyphicon glyphicon-remove\'></i> Proposal '+t+' Error!'
						});
					});
				};
				vm.request = function (proposal) {
					ProposalsService.makeRequest({
						proposalId: proposal._id
					}).$promise.then (function () {
						proposal.userIs.request = true;
						Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Successfully Applied!' });
					})
					.catch (function (res) {
						Notification.error ({
							message : res.data.message,
							title   : '<i class=\'glyphicon glyphicon-remove\'></i> Membership Request Error!'
						});
					});
				};
				vm.closing = function (proposal) {
					var ret = 'CLOSED';
					var d = (new Date(proposal.deadline)) - rightNow;
					if (d > 0) {
						var dd = Math.floor(d / 86400000); // days
						var dh = Math.floor((d % 86400000) / 3600000); // hours
						var dm = Math.round(((d % 86400000) % 3600000) / 60000); // minutes
						ret = dm+' minutes';
						if (dd > 0) ret = dd+' days '+dh+' hours '+dm+' minutes';
						else if (dh > 0) ret = dh+' hours '+dm+' minutes';
						else ret = dm+' minutes';
					}
					return ret;
				};
			}
		}
	})
	;
}());
