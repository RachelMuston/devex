(function (app) {
  'use strict';

  // Start by defining the main module and adding the module dependencies
  angular
    .module(app.applicationModuleName, app.applicationModuleVendorDependencies);

  // Setting HTML5 Location Mode
  angular
    .module(app.applicationModuleName)
    .config(bootstrapConfig);

  bootstrapConfig.$inject = ['$compileProvider', '$locationProvider', '$httpProvider', '$logProvider', '$uiViewScrollProvider', '$translateProvider'];

  function bootstrapConfig($compileProvider, $locationProvider, $httpProvider, $logProvider, $uiViewScrollProvider, $translateProvider) {
    $locationProvider.html5Mode({
      enabled: true,
      requireBase: false
    }).hashPrefix('!');

    $httpProvider.interceptors.push('authInterceptor');

    // Disable debug data for production environment
    // @link https://docs.angularjs.org/guide/production
    $compileProvider.debugInfoEnabled(app.applicationEnvironment !== 'production');
    $logProvider.debugEnabled(app.applicationEnvironment !== 'production');

    $uiViewScrollProvider.useAnchorScroll();

    $translateProvider.translations('en', {
      TITLE: 'Government of Canada Developers Exchange',
      ABOUT_TITLE: 'About GC DevEx',
      ABOUT_P1: 'The Government of Canada Developers Exchange (GC DevEx) offers opportunities to developers and designers across Canada to co-create improved digital engagement tools with public servants.',
      ABOUT_P2: 'The DevEx is an open source platform based on the Province of British Columbia <a href="https://bcdevexchange.org/" target="_blank">Developers’ Exchange</a>. The code has been copied (forked) into a repository on GitHub and is being adapted to meet Treasury Board of Canada Secretariat (TBS) Web Standards and the <em>Official Languages Act</em>.',
      CHANGE_LANGUAGE: 'Français'
    })
    .translations('fr', {
      TITLE: 'Le Carrefour des développeurs du gouvernement du Canada',
      ABOUT_TITLE: 'Au sujet de CarrefourProgGC',
      ABOUT_P1: 'Le Carrefour des développeurs du gouvernement du Canada (CarrefourProgGC bêta) offre la possibilité aux développeurs et aux concepteurs de l’ensemble du Canada de créer, en collaboration avec des fonctionnaires, des outils d’engagement numérique améliorés.',
      ABOUT_P2: 'CarrefourProgGC est une plateforme de source ouverte fondée sur la plateforme <a href="https://bcdevexchange.org/" target="_blank">Developers’ Exchange</a> de la Colombie-Britannique. Le code a été copié (bifurqué) vers un dépôt sur GitHub et est adapté pour satisfaire aux normes Web du Secrétariat du Conseil du Trésor et à la <em>Loi sur les langues officielles</em>.',
      CHANGE_LANGUAGE: 'English'
    })
    .preferredLanguage('en');
  }


  // Then define the init function for starting up the application
  angular.element(document).ready(init);

  function init() {
    // Fixing facebook bug with redirect
    if (window.location.hash && window.location.hash === '#_=_') {
      if (window.history && history.pushState) {
        window.history.pushState('', document.title, window.location.pathname);
      } else {
        // Prevent scrolling by storing the page's current scroll offset
        // var scroll = {
        //   top: document.body.scrollTop,
        //   left: document.body.scrollLeft
        // };
        // window.location.hash = '';
        // // Restore the scroll offset, should be flicker free
        // document.body.scrollTop = scroll.top;
        // document.body.scrollLeft = scroll.left;
      }
    }

    // Then init the app
    angular.bootstrap(document, [app.applicationModuleName]);
  }
}(ApplicationConfiguration));
