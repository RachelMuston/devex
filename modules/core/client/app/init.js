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
      WHY_TITLE: 'Why was it established?',
      WHY_P1: 'The intent of the GC DevEx beta is to use it to compensate developers and designers to co-create a library of digital tools that makes it easy to share, adapt and reuse fit-for-purpose solutions for governments and citizens to engage online. Additional emphasis on open source technologies encourages copying (forking) to further enhance collaboration. Together, we will make a common set of tools available for public engagement.',
      WHY_P2: 'By focusing on small scale opportunities, we hope to increase the amount of government contracts to small and medium sized enterprises, civic technology community groups and entrepreneurs, in a way that adds value and encourages collaborative innovation within Canada.',
      WHY_P3: 'This initiative fulfills a commitment under <a href="http://open.canada.ca/en/content/third-biennial-plan-open-government-partnership#toc5-4-2" target="_blank">Canada’s participation in the Open Government Partnership (OGP)</a>.',
      DEPTS_TITLE: 'Participating government departments',
      DEPTS_P1: 'GC DevEx beta was started by Privy Council Office (PCO), and Treasury Board of Canada Secretariat (TBS).These departments are responsible for managing the beta site and evaluating the initiative.',
      DEPTS_P2: 'Other federal departments can use the GC DevEx beta by contacting <a href="mailto:consultation@pco-bcp.gc.ca">consultation@pco-bcp.gc.ca</a>. After this initiative has been evaluated, the GC DevEx may be expanded to more departments within the Government of Canada.',
      DEPTS_P3: 'Other governments can re-use the code and concept for this initiative. With the exception of the federal identifier (AKA Canada logo), all parts of this website is licensed for re-use through the <a href="http://www.apache.org/licenses/">Apache License</a>. Whether you are part of a provincial, municipal, or national government elsewhere, you can copy (fork) the code on GitHub and set-up your own micro-procurement platform to work with developers in your community.',
      CHANGE_LANGUAGE: 'Français'
    })
    .translations('fr', {
      TITLE: 'Le Carrefour des développeurs du gouvernement du Canada',
      ABOUT_TITLE: 'Au sujet de CarrefourProgGC',
      ABOUT_P1: 'Le Carrefour des développeurs du gouvernement du Canada (CarrefourProgGC) offre la possibilité aux développeurs et aux concepteurs de l’ensemble du Canada de créer, en collaboration avec des fonctionnaires, des outils d’engagement numérique améliorés.',
      ABOUT_P2: 'CarrefourProgGC est une plateforme de source ouverte fondée sur la plateforme <a href="https://bcdevexchange.org/" target="_blank">Developers’ Exchange</a> de la Colombie-Britannique. Le code a été copié (bifurqué) vers un dépôt sur GitHub et est adapté pour satisfaire aux normes Web du Secrétariat du Conseil du Trésor et à la <em>Loi sur les langues officielles</em>.',
      WHY_TITLE: 'Bien-fondé de sa création',
      WHY_P1: 'CarrefourProgGC bêta vise à indemniser les développeurs et les concepteurs en vue de la création en collaboration d’un répertoire d’outils numériques qui facilite l’échange, l’adaptation et la réutilisation de solutions adaptées aux besoins et permettant aux gouvernements et aux citoyens de se mobiliser en ligne. L’accent supplémentaire mis sur les technologies de source ouverte encourage la copie (bifurcation) pour accroître la collaboration. Ensemble, nous établirons un ensemble commun d’outils propices à la mobilisation du public.',
      WHY_P2: 'En ciblant des occasions à petite échelle, nous espérons accroître le nombre de contrats gouvernementaux attribués aux petites et moyennes entreprises, aux groupes communautaires de technologie civique et aux entrepreneurs, de manière à ajouter de la valeur et à encourager l’innovation axée sur la collaboration au Canada.',
      WHY_P3: 'Cette initiative respecte un engagement pris en vertu de la <a href="http://ouvert.canada.ca/fr/contenu/troisieme-plan-biannuel-partenariat-gouvernement-ouvert#toc5-4-2" target="_blank">participation du Canada au Partenariat pour un Gouvernement Ouvert</a>.',
      DEPTS_TITLE: 'Ministères participants',
      DEPTS_P1: 'L’élaboration de CarrefourProgGC bêta a été entreprise au Bureau du Conseil privé et au Secrétariat du Conseil du Trésor du Canada. Ces ministères sont chargés de gérer le site bêta et d’évaluer l’initiative.',
      DEPTS_P2: 'D’autres ministères fédéraux peuvent se servir de CarrefourProgGC bêta en envoyant un courriel à <a href="mailto:consultation@pco-bcp.gc.ca">consultation@pco-bcp.gc.ca</a>. Une fois que l’initiative aura été évaluée, CarrefourProgGC pourrait être diffusé au sein d’un plus grand nombre de ministères du gouvernement du Canada. ',
      DEPTS_P3: 'D’autres gouvernements peuvent réutiliser le code et le concept de l’initiative. À l’exception de l’identificateur fédéral (c.-à-d. le logo du Canada), le code du site Web peut être réutilisé au moyen d’une <a href="http://www.apache.org/licenses/">Apache License</a>. Que vous fassiez partie d’un gouvernement provincial, d’une administration municipale ou d’un gouvernement national à l’étranger, vous pouvez copier (bifurquer) le code de GitHub et établir votre propre plateforme de microapprovisionnement afin de travailler avec les développeurs de votre communauté.',
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
