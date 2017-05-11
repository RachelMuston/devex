(function () {
	'use strict';
	angular.module('proposals')
	// =========================================================================
	//
	// Controller for the master list of programs
	//
	// =========================================================================
	.controller('ProposalsListController', function (ProposalsService, Authentication) {
		var vm      = this;
		vm.proposals = ProposalsService.query();
		var isUser = Authentication.user;
		vm.isUser = isUser;
	})
	// =========================================================================
	//
	// Controller the view of the proposal page
	//
	// =========================================================================
	.controller('ProposalViewController', function ($scope, $state, $stateParams, $sce, proposal, Authentication, ProposalsService, Notification, modalService, $q) {
		var vm                    = this;

		vm.projectId              = $stateParams.projectId;
		vm.proposal            = proposal;
		vm.pageViews              = proposal.views;
		vm.proposal.deadline   = new Date (vm.proposal.deadline);
		vm.proposal.assignment = new Date (vm.proposal.assignment);
		vm.proposal.start      = new Date (vm.proposal.start);
		vm.authentication         = Authentication;
		vm.ProposalsService   = ProposalsService;
		vm.idString               = 'proposalId';
		vm.display                = {};
		vm.display.description    = $sce.trustAsHtml(vm.proposal.description);
		vm.display.evaluation     = $sce.trustAsHtml(vm.proposal.evaluation);
		vm.display.criteria       = $sce.trustAsHtml(vm.proposal.criteria);
		//
		// what can the user do here?
		//
		var isUser                 = Authentication.user;
		var isAdmin                = isUser && !!~Authentication.user.roles.indexOf ('admin');
		var isGov                  = isUser && !!~Authentication.user.roles.indexOf ('gov');
		var isMemberOrWaiting      = proposal.userIs.member || proposal.userIs.request;
		vm.loggedIn                = isUser;
		vm.canRequestMembership    = isGov && !isMemberOrWaiting;
		vm.canApply                = isUser && !isAdmin && !isGov && !isMemberOrWaiting;
		vm.canEdit                 = isAdmin || proposal.userIs.admin;
		var rightNow               = new Date ();
		vm.closing = 'CLOSED';
		var d                      = vm.proposal.deadline - rightNow;
		if (d > 0) {
			var dd = Math.floor(d / 86400000); // days
			var dh = Math.floor((d % 86400000) / 3600000); // hours
			var dm = Math.round(((d % 86400000) % 3600000) / 60000); // minutes
			vm.closing = dm+' minutes';
			if (dd > 0) vm.closing = dd+' days '+dh+' hours '+dm+' minutes';
			else if (dh > 0) vm.closing = dh+' hours '+dm+' minutes';
			else vm.closing = dm+' minutes';
		}
		var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
		var dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
		var dt = vm.proposal.deadline;
		vm.deadline = dt.getHours()+':00 PST, '+dayNames[dt.getDay()]+', '+monthNames[dt.getMonth()]+' '+dt.getDate()+', '+dt.getFullYear();
		dt = vm.proposal.assignment;
		vm.assignment = dt.getHours()+':00 PST, '+dayNames[dt.getDay()]+', '+monthNames[dt.getMonth()]+' '+dt.getDate()+', '+dt.getFullYear();
		dt = vm.proposal.start;
		vm.start = dayNames[dt.getDay()]+', '+monthNames[dt.getMonth()]+' '+dt.getDate()+', '+dt.getFullYear();
		// -------------------------------------------------------------------------
		//
		// issue a request for membership
		//
		// -------------------------------------------------------------------------
		vm.request = function () {
			ProposalsService.makeRequest ({
				proposalId: proposal._id
			}).$promise.then (function () {
				Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Successfully Applied!' });
			})
		};
		// -------------------------------------------------------------------------
		//
		// publish or un publish the proposal
		//
		// -------------------------------------------------------------------------
		vm.publish = function (state) {
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
        },
        function doNotSendNotificaiton (result) {
        	proposal.doNotNotify = true;
        })
	    }

      //
			// success, notify and return to list
			//
      promise.then(function() {
      	return proposal.createOrUpdate();
      })
			//
			// success, notify and return to list
			//
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
		// -------------------------------------------------------------------------
		//
		// sign in and apply
		//
		// -------------------------------------------------------------------------
		vm.signInAndApply = function () {
			$state.go('authentication.signin').then(function () {
				$state.previous = {
					state: 'proposals.view',
					params: {proposalId:proposal.code},
					href: $state.href('proposals.view', {proposalId:proposal.code})
				};
            });
		}
	})
	// =========================================================================
	//
	// Controller the view of the proposal page
	//
	// =========================================================================
	.controller('ProposalEditController', function ($scope, $state, $stateParams, $window, $sce, proposal, editing, projects, Authentication, Notification, previousState, dataService, modalService, $q) {
		var rightNow                          = new Date();
		var vm                                = this;
		vm.previousState                      = previousState;
		//
		// what can the user do here?
		//
		var isUser                            = Authentication.user;
		vm.isAdmin                            = isUser && !!~Authentication.user.roles.indexOf ('admin');
		vm.isGov                              = isUser && !!~Authentication.user.roles.indexOf ('gov');
		vm.projects                           = projects;
		// console.log ('projects             = ', projects);
		// console.log ('stateParams          = ', $stateParams);
		vm.editing                            = editing;
		vm.proposal                        = proposal;
		vm.proposal.deadline               = new Date (vm.proposal.deadline);
		vm.proposal.assignment             = new Date (vm.proposal.assignment);
		vm.proposal.start                  = new Date (vm.proposal.start)		;
		vm.authentication                     = Authentication;
		vm.form                               = {};
		vm.proposal.skilllist              = vm.proposal.skills ? vm.proposal.skills.join (', ') : '';
		vm.proposal.taglist                = vm.proposal.tags   ? vm.proposal.tags.join (', ')   : '';
		//
		// if the user doesn't have the right access then kick them out
		//
		if (editing && !vm.isAdmin && !proposal.userIs.admin) $state.go('forbidden');
		//
		// do we have existing contexts for program and project ?
		// deal with all that noise right here
		//
		vm.projectLink            = true;
		vm.context                = $stateParams.context || 'allproposals';
		vm.programId              = $stateParams.programId || null;
		vm.programTitle           = $stateParams.programTitle || null;
		vm.projectId              = $stateParams.projectId || null;
		vm.projectTitle           = $stateParams.projectTitle || null;
		//
		// cities list
		//
		vm.cities = dataService.cities;
		//
		// if editing, set from existing
		//
		// console.log ('editing', vm.editing);
		// console.log ('programId', vm.programId);
		// console.log ('programTitle', vm.programTitle);
		// console.log ('projectId', vm.projectId);
		// console.log ('projectTitle', vm.projectTitle);
		// console.log ('context', vm.context);
		if (vm.editing) {
			vm.programId    = proposal.program._id;
			vm.programTitle = proposal.program.title;
			vm.projectId    = proposal.project._id;
			vm.projectTitle = proposal.project.name;
		}
		else {
			if (vm.context === 'allproposals') {
				vm.projectLink  = false;
			}
			else if (vm.context === 'program') {
				vm.projectLink         = false;
				vm.proposal.program = vm.programId;
				var projects           = [];
				vm.projects.forEach (function (o) {
					if (o.program._id === vm.programId) projects.push (o);
				});
				vm.projects = projects;
			}
			else if (vm.context === 'project') {
				vm.projectLink         = true;
				vm.proposal.project = vm.projectId;
				vm.proposal.program = vm.programId;
			}
		}
		//
		// if there are no available projects then post a warning and kick the user back to
		// where they came from
		//
		if (vm.projects.length === 0) {
			alert ('You do not have a project for which you are able to create an proposal. Please browse to or create a project to put the new proposal under.');
			$state.go (previousState.name, previousState.params);
		}
		//
		// if there is only one available project just force it
		//
		else if (vm.projects.length === 1) {
			vm.projectLink         = true;
			vm.projectId           = vm.projects[0]._id;
			vm.projectTitle        = vm.projects[0].name;
			vm.proposal.project = vm.projectId;
			vm.programId           = vm.projects[0].program._id;
			vm.programTitle        = vm.projects[0].program.title;
			vm.proposal.program = vm.programId;
		}
		vm.tinymceOptions = {
			resize      : true,
			width       : '100%',  // I *think* its a number and not '400' string
			height      : 100,
			menubar     :'',
			elementpath : false,
			plugins     : 'textcolor lists advlist link',
			toolbar     : 'undo redo | styleselect | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link | forecolor backcolor'
		};
		// -------------------------------------------------------------------------
		//
		// this is used when we are setting the entire hierarchy from the project
		// select box
		//
		// -------------------------------------------------------------------------
		vm.updateProgramProject = function (selected) {
			// console.log ('selected', vm.projectobj);
			vm.projectId    = vm.projectobj._id;
			vm.projectTitle = vm.projectobj.name;
			vm.programId    = vm.projectobj.program._id;
			vm.programTitle = vm.projectobj.program.title;
		};
		// -------------------------------------------------------------------------
		//
		// remove the proposal with some confirmation
		//
		// -------------------------------------------------------------------------
		vm.remove = function () {
			if ($window.confirm('Are you sure you want to delete?')) {
				vm.proposal.$remove(function() {
					$state.go('proposals.list');
					Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> proposal deleted successfully!' });
				});
			}
		};
		// -------------------------------------------------------------------------
		//
		// save the proposal, could be added or edited (post or put)
		//
		// -------------------------------------------------------------------------
		vm.saveme = function () {
			this.save (true);
		};
		vm.save = function (isValid) {
			vm.form.proposalForm.$setPristine ();
			// console.log ('saving form', vm.proposal);
			if (!isValid) {
				// console.log ('form is not valid');
				$scope.$broadcast('show-errors-check-validity', 'vm.form.proposalForm');
				return false;
			}
			// vm.proposal.tags   = vm.proposal.taglist.split(/ *, */);
			// vm.proposal.skills = vm.proposal.skilllist.split(/ *, */);
			if (vm.proposal.taglist !== '') {
				vm.proposal.tags = vm.proposal.taglist.split(/ *, */);
			} else {
				vm.proposal.tags = [];
			}
			if (vm.proposal.skilllist !== '') {
				vm.proposal.skills = vm.proposal.skilllist.split(/ *, */);
			} else {
				vm.proposal.skills = [];
			}
			//
			// if any context pieces were being set then copy in to the
			// right place here (only when adding)
			//
			if (!vm.editing) {
				if (vm.context === 'allproposals') {
					vm.proposal.project = vm.projectobj._id;
					vm.proposal.program = vm.projectobj.program._id;
				}
				else if (vm.context === 'program') {
					vm.proposal.project = vm.projectId;
				}
			}
			//
			// set the time on the 2 dates that care about it
			//
			vm.proposal.deadline.setHours(16);
			vm.proposal.assignment.setHours(16);

			vm.proposal.doNotNotify = false;
			var modalOptions = {
	        closeButtonText: 'Do Not Send Notification',
	        actionButtonText: 'Send Notification',
	        headerText: 'Update Proposal',
	        bodyText: 'You are updating the properties of a published proposal. Would you like to re-notify all subscribed users?'
	    };
	    var promise;
	    //
	    // Bypass the modal if first time publishing OR if unpublishing
	    //
	    if ((vm.proposal.isPublished && !vm.proposal.lastPublished) ||
	    			!vm.proposal.isPublished) {
	    	promise = $q.resolve();
	    }
	    else {
	    	promise = modalService.showModal({}, modalOptions)
        .then(function sendNotification (result) {
        		vm.proposal.doNotNotify = false;
        },
        function doNotSendNotificaiton (result) {
        	vm.proposal.doNotNotify = true;
        })
	    }

      //
			// Create a new proposal, or update the current instance
			//
      promise.then(function() {
      	return vm.proposal.createOrUpdate();
      })
			//
			// success, notify and return to list
			//
			.then (function (res) {
				vm.form.proposalForm.$setPristine ();
				// console.log ('now saved the new proposal, redirect user');
				vm.proposal.deadline   = new Date (vm.proposal.deadline);
				vm.proposal.assignment = new Date (vm.proposal.assignment);
				vm.proposal.start      = new Date (vm.proposal.start);
				Notification.success ({
					message : '<i class="glyphicon glyphicon-ok"></i> proposal saved successfully!'
				});
				if (editing) {
					$state.go('proposals.view', {proposalId:proposal.code});
				} else {
					$state.go('proposals.view', {proposalId:proposal.code});
					// $state.go('proposals.list');
				}
			})
			//
			// fail, notify and stay put
			//
			.catch (function (res) {
				Notification.error ({
					message : res.data.message,
					title   : '<i class=\'glyphicon glyphicon-remove\'></i> proposal save error!'
				});
			});
		};
		vm.popoverCache = {};
		vm.displayHelp = {};
		vm.popoverContent       = function(field) {
			if (! field) return;
			if (! vm.popoverCache[field]) {
				var help = $('#proposalForm').find('.input-help[data-field='+field+']');
				var	html = (help.length) ? help.html () : '';
				vm.popoverCache[field] = $sce.trustAsHtml(html);
			}
			return vm.popoverCache[field];
		};
		vm.toggleHelp = function(field) {
			vm.displayHelp[field] = ! vm.displayHelp[field];
		};
	})
	;
}());
