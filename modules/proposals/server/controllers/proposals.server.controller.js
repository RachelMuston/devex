'use strict';
/*

Notes about proposals

Roles:
------
Membership in a proposal is defined by the user having various roles attached to their
user record. There are only three possible states: admin, member, or request.
When a user requests membership they get the request role only, once accepted that
simply gets changed to the member role. Roles are simply the proposal code with suffixes.

member  : <code>
admin   : <code>-admin
request : <code>-request

*/

/**
 * Module dependencies.
 */
var path = require('path'),
	mongoose = require('mongoose'),
	Proposal = mongoose.model('Proposal'),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
	helpers = require(path.resolve('./modules/core/server/controllers/core.server.helpers')),
	_ = require('lodash'),
	notifier = require(path.resolve('./modules/core/server/controllers/core.server.notifier.js')).notifier,
	fs = require('fs'),
	markdown = require('helper-markdown'),
	// HandlebarsIntl = require('handlebars-intl'),
	Handlebars = require('handlebars'),
	htmlToText = require('html-to-text');

var oppEmailNotifier = notifier('proposals', 'email');

Handlebars.registerHelper('markdown', markdown({ breaks: true, xhtmlOut: false}));
// HandlebarsIntl.registerWith(Handlebars);
var emailBodyTemplateHtml = Handlebars.compile(fs.readFileSync(path.resolve('./modules/proposals/server/email_templates/message_body.hbs.md'), 'utf8'));
var emailSubjectTemplate = Handlebars.compile(fs.readFileSync(path.resolve('./modules/proposals/server/email_templates/subject.hbs.md'), 'utf8'));

// -------------------------------------------------------------------------
//
// set a proposal role on a user
//
// -------------------------------------------------------------------------
var adminRole = function (proposal) {
	return proposal.code+'-admin';
};
var memberRole = function (proposal) {
	return proposal.code;
};
var requestRole = function (proposal) {
	return proposal.code+'-request';
};
var setProposalMember = function (proposal, user) {
	user.addRoles ([memberRole(proposal)]);
};
var setProposalAdmin = function (proposal, user) {
	user.addRoles ([memberRole(proposal), adminRole(proposal)]);
};
var setProposalRequest = function (proposal, user) {
	user.addRoles ([requestRole(proposal)]);
};
var unsetProposalMember = function (proposal, user) {
	user.removeRoles ([memberRole(proposal)]);
};
var unsetProposalAdmin = function (proposal, user) {
	user.removeRoles ([memberRole(proposal), adminRole(proposal)]);
};
var unsetProposalRequest = function (proposal, user) {
	// console.log ('remove role ', requestRole(proposal));
	user.removeRoles ([requestRole(proposal)]);
};
var ensureAdmin = function (proposal, user, res) {
	if (!~user.roles.indexOf (adminRole(proposal)) && !~user.roles.indexOf ('admin')) {
		// console.log ('NOT admin');
		res.status(422).send({
			message: 'User Not Authorized'
		});
		return false;
	} else {
		// console.log ('Is admin');
		return true;
	}
};
var searchTerm = function (req, opts) {
	opts = opts || {};
	var me = helpers.myStuff ((req.user && req.user.roles)? req.user.roles : null );
	if (!me.isAdmin) {
		opts['$or'] = [{isPublished:true}, {code: {$in: me.proposals.admin}}];
	}
	// console.log ('me = ', me);
	// console.log ('opts = ', opts);
	return opts;
};
// -------------------------------------------------------------------------
//
// this takes a proposal model, serializes it, and decorates it with what
// relationship the user has to the proposal, and returns the JSON
//
// -------------------------------------------------------------------------
var decorate = function (proposalModel, roles) {
	var proposal = proposalModel ? proposalModel.toJSON () : {};
	proposal.userIs = {
		admin   : !!~roles.indexOf (adminRole(proposal)),
		member  : !!~roles.indexOf (memberRole(proposal)),
		request : !!~roles.indexOf (requestRole(proposal)),
		gov     : !!~roles.indexOf ('gov')
	};
	return proposal;
};
// -------------------------------------------------------------------------
//
// decorate an entire list of proposals
//
// -------------------------------------------------------------------------
var decorateList = function (proposalModels, roles) {
	return proposalModels.map (function (proposalModel) {
		return decorate (proposalModel, roles);
	});
};
var opplist = function (query, req, callback) {
	Proposal.find (query)
	.sort([['deadline', -1],['name', 1]])
	.populate('createdBy', 'displayName')
	.populate('updatedBy', 'displayName')
	.populate('project', 'code name _id isPublished')
	.populate('program', 'code title _id logo isPublished')
	.exec(function (err, proposals) {
		if (err) {
			callback (err, null);
		} else {
			callback (null, decorateList (proposals, req.user ? req.user.roles : []));
		}
	});
}
var forProgram = function (id) {
	return new Promise (function (resolve, reject) {
		Proposal.find ({program:id}).exec ().then (resolve, reject);
	});
};
var forProject = function (id) {
	return new Promise (function (resolve, reject) {
		Proposal.find ({project:id}).exec ().then (resolve, reject);
	});
};
// -------------------------------------------------------------------------
//
// increment the number of views of an proposal
//
// -------------------------------------------------------------------------
var incrementViews = function (id) {
	Proposal.update ({ _id: id }, { $inc: { views: 1 }}).exec ();
};
// -------------------------------------------------------------------------
//
// get a list of all my proposals, but only ones I have access to as a normal
// member or admin, just not as request
//
// -------------------------------------------------------------------------
exports.my = function (req, res) {
	// var me = helpers.myStuff ((req.user && req.user.roles)? req.user.roles : null );
	// var search = me.isAdmin ? {} : { code: { $in: me.proposals.member } };
	Proposal.find (searchTerm (req))
	.select ('code name short')
	.exec (function (err, proposals) {
		if (err) {
			return res.status(422).send ({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json (proposals);
		}
	});
};
// -------------------------------------------------------------------------
//
// return a list of all proposal members. this means all members NOT
// including users who have requested access and are currently waiting
//
// -------------------------------------------------------------------------
exports.members = function (proposal, cb) {
	mongoose.model ('User')
	.find ({roles: memberRole(proposal)})
	.select ('isDisplayEmail username displayName updated created roles government profileImageURL email lastName firstName userTitle')
	.exec (cb);
};

// -------------------------------------------------------------------------
//
// return a list of all users who are currently waiting to be added to the
// proposal member list
//
// -------------------------------------------------------------------------
exports.requests = function (proposal, cb) {
	mongoose.model ('User')
	.find ({roles: requestRole(proposal)})
	.select ('isDisplayEmail username displayName updated created roles government profileImageURL email lastName firstName userTitle')
	.exec (cb);
};

/**
 * Create a Proposal
 */
// -------------------------------------------------------------------------
//
// create a new proposal. the user doing the creation will be set as the
// administrator
//
// -------------------------------------------------------------------------
exports.create = function(req, res) {
	// console.log ('Creating a new proposal');
	var proposal = new Proposal(req.body);
	//
	// set the code, this is used setting roles and other stuff
	//
	Proposal.findUniqueCode (proposal.name, null, function (newcode) {
		proposal.code = newcode;
		//
		// set the audit fields so we know who did what when
		//
		helpers.applyAudit (proposal, req.user)
		//
		// save and return
		//
		proposal.save(function (err) {
			if (err) {
				return res.status(422).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				setProposalAdmin (proposal, req.user);
				req.user.save ();
				res.json(proposal);
			}
		});
	});

/*

GITHUB related stuff

	var proposal = new Proposal(req.body);
	proposal.user = req.user;

	var http = require('http');
	var github = require('octonode');
	var config = require('/config/config.js');

	// curl -u "dewolfe001:39c1cffc1008ed43189ecd27448bd903a75778eb" https://api.github.com/user/repos -d '{"name":"'helloGit'"}'

	var url = 'https://api.github.com/user/repos';
	var user = config.github.clientID;  // 'dewolfe001';
	var secret = config.github.clientSecret; // '39c1cffc1008ed43189ecd27448bd903a75778eb';

	var client = github.client({
	id: user,
		secret: secret
	});

 //  proposal.github = client.repo({
	// 'name': proposal.name,
	// 'description' : proposal.description
	// },  function (err, data) {
	// 	if (err) {
	// 		return console.error(err);
	// 	}
	// 	else {
	// 		return data.html_url;
	// 	}
	// }
	// );

	proposal.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(proposal);
		}
	});
	*/
};

// -------------------------------------------------------------------------
//
// this just takes the already queried object and pass it back
//
// -------------------------------------------------------------------------
exports.read = function (req, res) {
	res.json (decorate (req.proposal, req.user ? req.user.roles : []));
	incrementViews (req.proposal._id);
};

// -------------------------------------------------------------------------
//
// update the document, make sure to apply audit. We don't mess with the
// code if they change the name as that would mean reworking all the roles
//
// -------------------------------------------------------------------------
exports.update = function (req, res) {
	if (ensureAdmin (req.proposal, req.user, res)) {
		//
		// doNotNotify is a non persistent flag from the UI. If not explicity
		// set we take the safer option set it to true.
		//
		var doNotNotify = _.isNil(req.body.doNotNotify) ? true : req.body.doNotNotify;
		//
		// copy over everything passed in. This will overwrite the
		// audit fields, but they get updated in the following step
		//
		var proposal = _.assign (req.proposal, req.body);

		proposal.wasPublished = proposal.isPublished;
		//
		// set the lastPublished date so we can later determine if the
		// proposal have been published at least once before
		//
		if (proposal.isPublished) {
			proposal.lastPublished = Date();
		}
		//
		// set the audit fields so we know who did what when
		//
		helpers.applyAudit (proposal, req.user)
		//
		// save
		//
		proposal.save(function (err) {
			if (err) {
				return res.status(422).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				if (proposal.isPublished && !doNotNotify) {
					proposal.link = 'https://'+(process.env.DOMAIN || 'localhost')+'/proposals/'+proposal.code;
					proposal.earn_f = helpers.formatMoney (proposal.earn, 2);
					proposal.deadline_d_f = helpers.formatDate (proposal.deadline);
					proposal.deadline_t_f = helpers.formatTime (proposal.deadline);
					var htmlBody = emailBodyTemplateHtml({proposal: proposal});
					var textBody = htmlToText.fromString(htmlBody, { wordwrap: 130 });
					console.log (htmlBody);
					oppEmailNotifier.notify({
						from: process.env.MAILER_FROM || '"BC Developers Exchange" <noreply@bcdevexchange.org>',
						subject: emailSubjectTemplate({proposal: proposal}),
						textBody: textBody,
						htmlBody: htmlBody
					})
					.catch(function(err) {
						console.log (err);
					})
					.then(function() {
						// res.json(proposal);
						res.json (decorate (proposal, req.user ? req.user.roles : []));
					});
				}
				else {
					res.json (decorate (proposal, req.user ? req.user.roles : []));
				}
			}
		});
	}
};

// -------------------------------------------------------------------------
//
// delete the proposal
//
// -------------------------------------------------------------------------
exports.delete = function (req, res) {
	// console.log ('Deleting');
	if (ensureAdmin (req.proposal, req.user, res)) {
		// console.log ('Deleting');

		var proposal = req.proposal;
		proposal.remove(function (err) {
			if (err) {
				return res.status(422).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.json(proposal);
			}
		});
	}
};
// -------------------------------------------------------------------------
//
// return a list of all proposals
//
// -------------------------------------------------------------------------
exports.list = function (req, res) {
	opplist (searchTerm (req), req, function (err, proposals) {
		if (err) {
			return res.status(422).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json (proposals);
		}
	});
	// Proposal.find (searchTerm (req))
	// .sort([['deadline', -1],['name', 1]])
	// .populate('createdBy', 'displayName')
	// .populate('updatedBy', 'displayName')
	// .populate('project', 'code name _id isPublished')
	// .populate('program', 'code title _id logo isPublished')
	// .exec(function (err, proposals) {
	// 	if (err) {
	// 		return res.status(422).send({
	// 			message: errorHandler.getErrorMessage(err)
	// 		});
	// 	} else {
	// 		res.json (decorateList (proposals, req.user ? req.user.roles : []));
	// 		// res.json(proposals);
	// 	}
	// });
};

// -------------------------------------------------------------------------
//
// this is the service front to the members call
//
// -------------------------------------------------------------------------
exports.listMembers = function (req, res) {
	exports.members (req.proposal, function (err, users) {
		if (err) {
			return res.status (422).send ({
				message: errorHandler.getErrorMessage (err)
			});
		} else {
			res.json (users);
		}
	});
};

// -------------------------------------------------------------------------
//
// this is the service front to the members call
//
// -------------------------------------------------------------------------
exports.listRequests = function (req, res) {
	exports.requests (req.proposal, function (err, users) {
		if (err) {
			return res.status (422).send ({
				message: errorHandler.getErrorMessage (err)
			});
		} else {
			res.json (users);
		}
	});
};

// -------------------------------------------------------------------------
//
// have the current user request access
//
// -------------------------------------------------------------------------
exports.request = function (req, res) {
	setProposalRequest (req.proposal, req.user);
	req.user.save ();
	res.json ({ok:true});
}

// -------------------------------------------------------------------------
//
// deal with members
//
// in the context of proposals, confirming a member is assigning them
// to the proposal. so, all others are rejected upon this action
//
// -------------------------------------------------------------------------
var assignMember = function (proposal, user) {
	return new Promise (function (resolve, reject) {
		unsetProposalRequest (proposal, user);
		setProposalMember (proposal, user);
		user.save ().then (resolve, reject);
	});
};
var unassignMember = function (proposal, user) {
	return new Promise (function (resolve, reject) {
		unsetProposalRequest (proposal, user);
		unsetProposalMember (proposal, user);
		user.save ().then (resolve, reject);
	});
};
exports.confirmMember = function (req, res) {
	var user = req.model;
	// console.log ('++++ confirm member ', user.username, user._id);
	var assignedMember;
	//
	// assign the member
	//
	assignMember (req.proposal, user)
	//
	// get the list of remaining applicants
	//
	.then (function (result) {
		assignedMember = result;
		return mongoose.model ('User').find ({roles: requestRole(req.proposal)}).exec();
	})
	//
	// make a promise array of those by running them through the
	// unassign method
	//
	.then (function (list) {
		return Promise.all (list.map (function (member) {
			return unassignMember (req.proposal, member);
		}));
	})
	//
	// all OK, return the assigned user
	//
	.then (function () {
		res.json (assignedMember);
	})
	//
	// not going very well, figure out the error
	//
	.catch (function (err) {
		res.status (422).send ({
			message: errorHandler.getErrorMessage (err)
		});
	});
};
exports.denyMember = function (req, res) {
	var user = req.model;
	// console.log ('++++ deny member ', user.username, user._id);
	unassignMember (req.proposal, user)
	.then (function (result) {
		res.json (result);
	})
	.catch (function (err) {
		res.status (422).send ({
			message: errorHandler.getErrorMessage (err)
		});
	});
};

// -------------------------------------------------------------------------
//
// get proposals under project
//
// -------------------------------------------------------------------------
exports.forProject = function (req, res) {
	opplist (searchTerm (req, {project:req.project._id}), req, function (err, proposals) {
		if (err) {
			return res.status(422).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json (proposals);
		}
	});
	// Proposal.find(searchTerm (req, {project:req.project._id})).sort('name')
	// .populate('createdBy', 'displayName')
	// .populate('updatedBy', 'displayName')
	// .exec(function (err, proposals) {
	// 	if (err) {
	// 		return res.status(422).send({
	// 			message: errorHandler.getErrorMessage(err)
	// 		});
	// 	} else {
	// 		res.json (decorateList (proposals, req.user ? req.user.roles : []));
	// 		// res.json(proposals);
	// 	}
	// });
};
// -------------------------------------------------------------------------
//
// get proposals under program
//
// -------------------------------------------------------------------------
exports.forProgram = function (req, res) {
	opplist (searchTerm (req, {program:req.program._id}), req, function (err, proposals) {
		if (err) {
			return res.status(422).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json (proposals);
		}
	});
	// Proposal.find(searchTerm (req, {program:req.program._id})).sort('name')
	// .populate('createdBy', 'displayName')
	// .populate('updatedBy', 'displayName')
	// .exec(function (err, proposals) {
	// 	if (err) {
	// 		return res.status(422).send({
	// 			message: errorHandler.getErrorMessage(err)
	// 		});
	// 	} else {
	// 		res.json (decorateList (proposals, req.user ? req.user.roles : []));
	// 		// res.json(proposals);
	// 	}
	// });
};

// -------------------------------------------------------------------------
//
// new empty proposal
//
// -------------------------------------------------------------------------
exports.new = function (req, res) {
	// console.log ('get a new proposal set up and return it');
	var p = new Proposal ();
	res.json(p);
};

// -------------------------------------------------------------------------
//
// magic that populates the proposal on the request
//
// -------------------------------------------------------------------------
exports.proposalByID = function (req, res, next, id) {
	if (id.substr (0, 3) === 'opp' ) {
		Proposal.findOne({code:id})
		.populate('createdBy', 'displayName')
		.populate('updatedBy', 'displayName')
		.populate('project', 'code name _id isPublished')
		.populate('program', 'code title _id logo isPublished')
		.exec(function (err, proposal) {
			if (err) {
				return next(err);
			} else if (!proposal) {
				return res.status(404).send({
					message: 'No proposal with that identifier has been found'
				});
			}
			req.proposal = proposal;
			next();
		});
	} else {

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).send({
				message: 'Proposal is invalid'
			});
		}

		Proposal.findById(id)
		.populate('createdBy', 'displayName')
		.populate('updatedBy', 'displayName')
		.populate('project', 'code name _id isPublished')
		.populate('program', 'code title _id logo isPublished')
		.exec(function (err, proposal) {
			if (err) {
				return next(err);
			} else if (!proposal) {
				return res.status(404).send({
					message: 'No proposal with that identifier has been found'
				});
			}
			req.proposal = proposal;
			next();
		});
	}
};
// -------------------------------------------------------------------------
//
// publish or unpublish whole sets of proposals by either program or
// project
//
// -------------------------------------------------------------------------
exports.rePublishProposals = function (programId, projectId) {
	return (projectId ? forProject (projectId) : forProgram (programId))
	.then (function (proposals) {
		return Promise.all (proposals.map (function (proposal) {
			proposal.isPublished = proposal.wasPublished;
			return proposal.save ();
		}));
	});
};
exports.unPublishProposals = function (programId, projectId) {
	return (projectId ? forProject (projectId) : forProgram (programId))
	.then (function (proposals) {
		return Promise.all (proposals.map (function (proposal) {
			proposal.wasPublished = proposal.isPublished;
			proposal.isPublished = false;
			return proposal.save ();
		}));
	});
};
