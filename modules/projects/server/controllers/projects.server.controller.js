'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Project = mongoose.model('Project'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Project
 */
exports.create = function(req, res) {
	var project = new Project(req.body);
	project.user = req.user;

	var http = require('http');
	var github = require('octonode');
	var path = require('path'),
		config = require(path.resolve('./config/config'));

  // curl -u "dewolfe001:39c1cffc1008ed43189ecd27448bd903a75778eb" https://api.github.com/user/repos -d '{"name":"'helloGit'"}'

  var url = 'api.github.com';
  var user = 'abcde12345fghij67890'; // config.github.clientID;
  var secret = '25f94a2a5c7fbaf499c665bc73d67c1c87e496da8985131633ee0a95819db2e8'; // config.github.clientSecret;

    var options = {
      host: 'api.github.com',
      path: '/user/repos?clientID=' + user + '&clientSecret=' + secret,
      port: 443,
      method: 'POST',
      json: { name: project.name.toString(), description: project.description.toString() },
      headers: { 'User-Agent': 'github-app' }
    };

    var request = http.request(options, function(response){
      var body = '';
      response.on("data", function(chunk){ body+=chunk.toString("utf8"); });

      response.on("end", function(){
        var json = JSON.parse(body);
        console.log(json);
      });
    });

    request.end();

  // var GitHubApi = require('github');
  //
  // var github = new GitHubApi({
  //   // optional
  //   debug: true,
  //   protocol: "https",
  //   host: url, // should be api.github.com for GitHub
  //   headers: {
  //     "user-agent": "BCDevex" // GitHub is happy with a unique user agent
  //   },
  //   Promise: require('bluebird'),
  //   followRedirects: false, // default: true; there's currently an issue with non-get redirects, so allow ability to disable follow-redirects
  //   timeout: 5000
  // });
  //
  // github.authenticate({
  //   type: "oauth",
  //   key: user,
  //   secret: secret
  // });
  //
  // github.repos.create({
  //   name: project.name.toString(),
  //   description: project.description.toString()
  // });


  // var client = github.client({
  //   id: user,
  //   secret: secret
  // });
  // var ghme = client.me();
  //
  // project.github = ghme.repo({
  // 	name: project.name.toString(),
  // 	description : project.description.toString()
	// },  function (err, data) {
	// 	if (err) {
	// 		return console.error(err + "\n" + data);
	// 	}
	// 	else {
	// 		return data.html_url;
	// 	}
	// }
  // );

  project.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(project);
    }
  });
};

/**
 * Show the current Project
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var project = req.project ? req.project.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  project.isCurrentUserOwner = req.user && project.user && project.user._id.toString() === req.user._id.toString();

  res.jsonp(project);
};

/**
 * Update a Project
 */
exports.update = function(req, res) {
  var project = req.project;

  project = _.extend(project, req.body);

  project.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(project);
    }
  });
};

/**
 * Delete an Project
 */
exports.delete = function(req, res) {
  var project = req.project;

  project.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(project);
    }
  });
};

/**
 * List of Projects
 */
exports.list = function(req, res) {
  Project.find().sort('-created').populate('user', 'displayName').exec(function(err, projects) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(projects);
    }
  });
};

/**
 * Project middleware
 */
exports.projectByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Project is invalid'
    });
  }

  Project.findById(id).populate('user', 'displayName').exec(function (err, project) {
    if (err) {
      return next(err);
    } else if (!project) {
      return res.status(404).send({
        message: 'No Project with that identifier has been found'
      });
    }
    req.project = project;
    next();
  });
};
