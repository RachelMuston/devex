(function () {
  'use strict';

  angular
    .module('core.admin.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('admin', {
        abstract: true,
        url: '/{lang:(?:fr|en)}/admin',
        template: '<ui-view autoscroll="true"/>',
        data: {
          roles: ['admin']
        },
        params: {
          lang: 'en'
        }
      });
  }
}());
