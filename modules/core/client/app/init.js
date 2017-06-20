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
      TEAMS: 'Teams',
      PROJECTS: 'Projects',
      OPPORTUNITIES: 'Opportunities',
      SIGNUP: 'Sign Up',
      SIGNIN: 'Sign In',
      HOME: 'Home',
      BETA_DESC: 'The term “beta” in software development refers to a development phase within its lifecycle that provides opportunities to conduct proofing and testing often with users from outside of the project team (general public).  This allows the project team to adjust the product according to new test data. The distribution of a beta release can be as limiting or vast as project resources allow. The goal of a beta release is to garner feedback on, but not exclusively to, the design, process, and demand by collecting user experience comments and statistics. A beta is ephemeral in nature, and moves into official production status once the proofing and testing is successful.',
      CHANGE_LANGUAGE: 'Français',
      HEADER_FIP: 'Government of Canada',
      TITLE: 'Government of Canada Developers Exchange',
      ABOUT_TITLE: 'About GC DevEx',
      ABOUT_P1: 'The Government of Canada Developers Exchange (GC DevEx) offers opportunities to developers and designers across Canada to co-create improved digital engagement tools with public servants.',
      ABOUT_P2: 'The DevEx is an open source platform based on the Province of British Columbia <a href="https://bcdevexchange.org/" target="_blank">Developers\' Exchange</a>. The code has been copied (forked) into a repository on GitHub and is being adapted to meet Treasury Board of Canada Secretariat (TBS) Web Standards and the <em>Official Languages Act</em>.',
      WHY_TITLE: 'Why was it established?',
      WHY_P1: 'The intent of the GC DevEx beta is to use it to compensate developers and designers to co-create a library of digital tools that makes it easy to share, adapt and reuse fit-for-purpose solutions for governments and citizens to engage online. Additional emphasis on open source technologies encourages copying (forking) to further enhance collaboration. Together, we will make a common set of tools available for public engagement.',
      WHY_P2: 'By focusing on small scale opportunities, we hope to increase the amount of government contracts to small and medium sized enterprises, civic technology community groups and entrepreneurs, in a way that adds value and encourages collaborative innovation within Canada.',
      WHY_P3: 'This initiative fulfills a commitment under <a href="http://open.canada.ca/en/content/third-biennial-plan-open-government-partnership#toc5-4-2" target="_blank">Canada\'s participation in the Open Government Partnership (OGP)</a>.',
      DEPTS_TITLE: 'Participating government departments',
      DEPTS_P1: 'GC DevEx beta was started by Privy Council Office (PCO), and Treasury Board of Canada Secretariat (TBS).These departments are responsible for managing the beta site and evaluating the initiative.',
      DEPTS_P2: 'Other federal departments can use the GC DevEx beta by contacting <a href="mailto:consultation@pco-bcp.gc.ca">consultation@pco-bcp.gc.ca</a>. After this initiative has been evaluated, the GC DevEx may be expanded to more departments within the Government of Canada.',
      DEPTS_P3: 'Other governments can re-use the code and concept for this initiative. With the exception of the federal identifier (AKA Canada logo), all parts of this website is licensed for re-use through the <a href="http://www.apache.org/licenses/">Apache License</a>. Whether you are part of a provincial, municipal, or national government elsewhere, you can copy (fork) the code on GitHub and set-up your own micro-procurement platform to work with developers in your community.',
      IMG_CAP1: '',
      IMG_CAP2: '',
      IMG_CAP3: '',
      VID_TITLE: 'Government collaboration at CodeFest',
      VID_P1: 'Highlights from the 2<sup>nd</sup> CodeFest held in August 2013.',
      LINKS_TITLE1: 'Work With Us',
      LINKS_A1: '<a href="https://beta.gcdevexchange.org/about">About the Developer Exchange</a>',
      LINKS_A2: '<a href="https://github.com/canada-ca/welcome">Canada on GitHub</a>',
      LINKS_A3: '<a href="https://www.canada.ca/en/treasury-board-secretariat/topics/government-communications.html">Web Standards Policies</a>',
      LINKS_TITLE2: 'Open Source in Canada\'s Governments',
      LINKS_B1: '<a href="http://wet-boew.github.io/wet-boew/index.html">Web Experience Toolkit</a>',
      LINKS_B2: '<a href="https://github.com/gctools-outilsgc">GC 2.0 Tools on GitHub</a>',
      LINKS_B3: '<a href="https://bcdevexchange.org">B.C. Developers Exchange</a>',
      LINKS_B4: '<a href="https://government.github.com/community#canada">Canadian Government Accounts on GitHub</a>',
      SUBFOOTER_TITLE: 'About government',
      SUBFOOTER_LINK1: '<a href="https://www.canada.ca/en/contact.html">Contact us</a>',
      SUBFOOTER_LINK2: '<a href="https://www.canada.ca/en/government/dept.html">Departments and agencies</a>',
      SUBFOOTER_LINK3: '<a href="https://www.canada.ca/en/government/publicservice.html">Public service and military</a>',
      SUBFOOTER_LINK4: '<a href="https://www.canada.ca/en/news.html">News</a>',
      SUBFOOTER_LINK5: '<a href="https://www.canada.ca/en/government/system/laws.html">Treaties, laws and regulations</a>',
      SUBFOOTER_LINK6: '<a href="https://www.canada.ca/en/transparency/reporting.html">Government-wide reporting</a>',
      SUBFOOTER_LINK7: '<a href="http://pm.gc.ca/eng">Prime Minister</a>',
      SUBFOOTER_LINK8: '<a href="https://www.canada.ca/en/government/system.html">How government works</a>',
      SUBFOOTER_LINK9: '<a href="http://open.canada.ca/en/">Open government</a>',
      FOOTER_TITLE: 'About this site',
      FOOTER_LINK1: '<a href="https://www.canada.ca/en/social.html">Social media</a>',
      FOOTER_LINK2: '<a href="https://www.canada.ca/en/mobile.html">Mobile applications</a>',
      FOOTER_LINK3: '<a href="https://www1.canada.ca/en/newsite.html">About Canada.ca</a>',
      FOOTER_LINK4: '<a href="https://www.canada.ca/en/transparency/terms.html">Terms and conditions</a>',
      FOOTER_LINK5: '<a href="https://www.canada.ca/en/transparency/privacy.html">Privacy</a>',
      FOOTER_TOP: 'Top of Page <span class="glyphicon glyphicon-chevron-up"></span>',
      FOOTER_FIP: 'Symbol of the Government of Canada',
      TEAMS_TITLE: 'All Teams',
      TEAMS_P1: 'The following table contains a list of all programs participating in GC DevEx beta. Filter the list by typing the name of a team or organization or sort a column using the arrows.',
      TEAMS_P2: 'This is not a full list of all GC programs. A full list of all GC services or information is available on <a href="https://www.canada.ca/en/services.html">canada.ca</a>.',
      TEAMS_TH1: 'Team Title',
      TEAMS_TH2: 'Description',
      TEAMS_TH3: 'Department',
      PROG_TITLE: 'Teams List',
      PROG_ALL: 'All teams',
      PROJ_TITLE: 'Projects List',
      PROJ_ALL: 'All projects',
      OPP_TITLE: 'Opportunities List',
      OPP_ALL: 'All opportunities',
      OPP_CTA: 'Want to get notified when new opportunities are posted?'
    })
    .translations('fr', {
      TEAMS: 'Équipes',
      PROJECTS: 'Projets',
      OPPORTUNITIES: 'Possibilités',
      SIGNUP: 'S\'inscrire',
      SIGNIN: 'Se connecter',
      HOME: 'Accueil',
      BETA_DESC: 'Dans le cadre du développement de logiciels, le terme « bêta » renvoie à une étape de son cycle de vie qui offre la possibilité de faire des examens et des essais, souvent auprès d\'utilisateurs de l\'extérieur de l\'équipe de projet (le grand public). L\'équipe de projet peut ainsi rajuster le projet en fonction des nouvelles données mises à l\'essai. La diffusion d\'une version bêta peut être aussi restreinte ou aussi vaste que le permettent les ressources du projet. La version bêta vise à obtenir de la rétroaction sur notamment la conception, le processus et la demande en recueillant des commentaires sur l\'expérience des utilisateurs ainsi que des statistiques. Une version bêta est de nature éphémère et arrive à l\'étape de production officielle une fois que les examens et les essais sont concluants.',
      CHANGE_LANGUAGE: 'English',
      HEADER_FIP: 'Gouvernement du Canada',
      TITLE: 'Le Carrefour des développeurs du gouvernement du Canada',
      ABOUT_TITLE: 'Au sujet de CarrefourProgGC',
      ABOUT_P1: 'Le Carrefour des développeurs du gouvernement du Canada (CarrefourProgGC) offre la possibilité aux développeurs et aux concepteurs de l\'ensemble du Canada de créer, en collaboration avec des fonctionnaires, des outils d\'engagement numérique améliorés.',
      ABOUT_P2: 'CarrefourProgGC est une plateforme de source ouverte fondée sur la plateforme <a href="https://bcdevexchange.org/" target="_blank">Developers\' Exchange</a> de la Colombie-Britannique. Le code a été copié (bifurqué) vers un dépôt sur GitHub et est adapté pour satisfaire aux normes Web du Secrétariat du Conseil du Trésor et à la <em>Loi sur les langues officielles</em>.',
      WHY_TITLE: 'Bien-fondé de sa création',
      WHY_P1: 'CarrefourProgGC bêta vise à indemniser les développeurs et les concepteurs en vue de la création en collaboration d\'un répertoire d\'outils numériques qui facilite l\'échange, l\'adaptation et la réutilisation de solutions adaptées aux besoins et permettant aux gouvernements et aux citoyens de se mobiliser en ligne. L\'accent supplémentaire mis sur les technologies de source ouverte encourage la copie (bifurcation) pour accroître la collaboration. Ensemble, nous établirons un ensemble commun d\'outils propices à la mobilisation du public.',
      WHY_P2: 'En ciblant des occasions à petite échelle, nous espérons accroître le nombre de contrats gouvernementaux attribués aux petites et moyennes entreprises, aux groupes communautaires de technologie civique et aux entrepreneurs, de manière à ajouter de la valeur et à encourager l\'innovation axée sur la collaboration au Canada.',
      WHY_P3: 'Cette initiative respecte un engagement pris en vertu de la <a href="http://ouvert.canada.ca/fr/contenu/troisieme-plan-biannuel-partenariat-gouvernement-ouvert#toc5-4-2" target="_blank">participation du Canada au Partenariat pour un Gouvernement Ouvert</a>.',
      DEPTS_TITLE: 'Ministères participants',
      DEPTS_P1: 'L\'élaboration de CarrefourProgGC bêta a été entreprise au Bureau du Conseil privé et au Secrétariat du Conseil du Trésor du Canada. Ces ministères sont chargés de gérer le site bêta et d\'évaluer l\'initiative.',
      DEPTS_P2: 'D\'autres ministères fédéraux peuvent se servir de CarrefourProgGC bêta en envoyant un courriel à <a href="mailto:consultation@pco-bcp.gc.ca">consultation@pco-bcp.gc.ca</a>. Une fois que l\'initiative aura été évaluée, CarrefourProgGC pourrait être diffusé au sein d\'un plus grand nombre de ministères du gouvernement du Canada. ',
      DEPTS_P3: 'D\'autres gouvernements peuvent réutiliser le code et le concept de l\'initiative. À l\'exception de l\'identificateur fédéral (c.-à-d. le logo du Canada), le code du site Web peut être réutilisé au moyen d\'une <a href="http://www.apache.org/licenses/">Apache License</a>. Que vous fassiez partie d\'un gouvernement provincial, d\'une administration municipale ou d\'un gouvernement national à l\'étranger, vous pouvez copier (bifurquer) le code de GitHub et établir votre propre plateforme de microapprovisionnement afin de travailler avec les développeurs de votre communauté.',
      IMG_CAP1: '',
      IMG_CAP2: '',
      IMG_CAP3: '',
      VID_TITLE: 'Collaboration gouvernementale à CodeFest',
      VID_P1: 'Faits saillants de la 2<sup>ème</sup> CodeFest tenue en août 2013.',
      LINKS_TITLE1: 'Travailler avec nous',
      LINKS_A1: '<a href="https://beta.gcdevexchange.org/about">Au sujet de CarrefourProgGC</a>',
      LINKS_A2: '<a href="https://github.com/canada-ca/welcome">Le Canada et GitHub</a>',
      LINKS_A3: '<a href="https://www.canada.ca/fr/secretariat-conseil-tresor/sujets/communications-gouvernementales.html">Politiques sur les normes Web</a>',
      LINKS_TITLE2: 'Source ouverte des gouvernements du Canada',
      LINKS_B1: '<a href="http://wet-boew.github.io/wet-boew/index.html">Boîte à outils de l\'expérience Web</a>',
      LINKS_B2: '<a href="https://github.com/gctools-outilsgc">Outils GC 2.0 sur GitHub</a>',
      LINKS_B3: '<a href="https://bcdevexchange.org">B.C. Developers Exchange</a>',
      LINKS_B4: '<a href="https://government.github.com/community#canada">Comptes du gouvernement canadien sur GitHub</a>',
      SUBFOOTER_TITLE: 'Au sujet du gouvernement',
      SUBFOOTER_LINK1: '<a href="https://www.canada.ca/fr/contact.html">Contactez-nous</a>',
      SUBFOOTER_LINK2: '<a href="https://www.canada.ca/fr/gouvernement/min.html">Ministères et organismes</a>',
      SUBFOOTER_LINK3: '<a href="https://www.canada.ca/fr/gouvernement/fonctionpublique.html">Fonction publique et force militaire</a>',
      SUBFOOTER_LINK4: '<a href="https://www.canada.ca/fr/nouvelles.html">Nouvelles</a>',
      SUBFOOTER_LINK5: '<a href="https://www.canada.ca/fr/gouvernement/systeme/lois.html">Traités, lois et règlements</a>',
      SUBFOOTER_LINK6: '<a href="https://www.canada.ca/fr/transparence/rapports.html">Rapports à l\'échelle du gouvernement</a>',
      SUBFOOTER_LINK7: '<a href="http://pm.gc.ca/fra">Premier ministre</a>',
      SUBFOOTER_LINK8: '<a href="https://www.canada.ca/fr/gouvernement/systeme.html">Comment le gouvernement fonctionne</a>',
      SUBFOOTER_LINK9: '<a href="http://ouvert.canada.ca/">Gouvernement ouvert</a>',
      FOOTER_TITLE: 'À propos du site',
      FOOTER_LINK1: '<a href="https://www.canada.ca/fr/sociaux.html">Médias sociaux</a>',
      FOOTER_LINK2: '<a href="https://www.canada.ca/fr/mobile.html">Applications mobiles</a>',
      FOOTER_LINK3: '<a href="https://www1.canada.ca/fr/nouveausite.html">À propos de Canada.ca</a>',
      FOOTER_LINK4: '<a href="https://www.canada.ca/fr/transparence/avis.html">Avis</a>',
      FOOTER_LINK5: '<a href="https://www.canada.ca/fr/transparence/confidentialite.html">Confidentialité</a>',
      FOOTER_TOP: 'Haut de la page <span class="glyphicon glyphicon-chevron-up"></span>',
      FOOTER_FIP: 'Symbole du gouvernement du Canada',
      TEAMS_TITLE: 'Toutes les équipes',
      TEAMS_P1: 'Le tableau suivant contient une liste de tous les programmes qui participent à CarrefourProgGC bêta. Filtrez la liste en inscrivant le nom d\'une équipe ou d\'une organisation ou triez une colonne au moyen des flèches.',
      TEAMS_P2: 'Ceci n\'est pas une liste complète de tous les programmes du gouvernement du Canada. Pour obtenir la liste complète de tous les services du gouvernement du Canada ou des renseignements à ce sujet, allez à canada.ca.',
      TEAMS_TH1: 'Nom de l’équipe',
      TEAMS_TH2: 'Description',
      TEAMS_TH3: 'Ministère',
      PROG_TITLE: 'Liste des équipes',
      PROG_ALL: 'Toutes les équipes',
      PROJ_TITLE: 'Liste des projets',
      PROJ_ALL: 'Toutes les projets',
      OPP_TITLE: 'Liste des possibilités',
      OPP_ALL: 'Toutes les possibilités',
      OPP_CTA: 'Voulez-vous recevoir un avis quand de nouvelles possibilités sont affichées?'
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
