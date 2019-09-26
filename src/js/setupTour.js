import Shepherd from 'shepherd.js';
import jump from 'jump.js';
import isMobile from './utils/is-mobile';

function setupTour() {
  const tour = new Shepherd.Tour({
    defaultStepOptions: {
      classes: 'custom-tour',
      scrollToHandler: function scrollTo(element) {
        const relevantVerbs = ['crave', 'kill'];

        jump(element, {
          duration: 1000,
          offset: -d3.select('.fixed-search-bar').node().offsetHeight,
        });

        const currentVerbText = d3
          .select(element)
          .select('.verb-name')
          .text();

        if (relevantVerbs.includes(element.id)) {
          d3.select('.choices__item--selectable').text(element.id);
          d3.select('.search-verb__input')
            .select('option')
            .text(element.id);
        } else if (relevantVerbs.includes(currentVerbText)) {
          console.log(currentVerbText);
          d3.select('.choices__item--selectable').text(currentVerbText);
          d3.select('.search-verb__input')
            .select('option')
            .text(currentVerbText);
        }
      },
    },
    useModalOverlay: true,
  });

  tour.addStep({
    scrollTo: true,
    scrollToHandler: function scrollTo(element) {
      const relevantVerbs = ['crave', 'kill'];

      jump(element, {
        duration: 1000,
        offset: -d3.select('.fixed-search-bar').node().offsetHeight,
      });

      const currentVerbText = d3.select(element).text();
      d3.select('.choices__item--selectable').text(currentVerbText);
      d3.select('.search-verb__input')
        .select('option')
        .text(currentVerbText);
    },
    id: 'tour-step-01',
    text:
      'Here is a list of everything millennials have killed, according to the media.',
    attachTo: {
      element: '#kill',
      on: 'top',
    },
    cancelIcon: {
      enabled: true,
    },
    classes: 'example-step-extra-class',
    buttons: [
      {
        text: 'Next',
        action: tour.next,
      },
    ],
  });

  tour.addStep({
    id: 'tour-step-02',
    scrollTo: true,
    scrollToHandler: function scrollTo(element) {
      const currentVerbText = d3
        .select(element)
        .select('.verb-name')
        .text();

      jump(element, {
        duration: 1000,
        offset: -(2 * d3.select('.fixed-search-bar').node().offsetHeight),
      });

      d3.select('.choices__item--selectable').text(currentVerbText);
      d3.select('.search-verb__input')
        .select('option')
        .text(currentVerbText);
    },
    text:
      'This includes everything from American cheese slices (🧀⚰️) to your favorite Christmas traditions.',
    attachTo: {
      element: '.verb-container-kill',
      on: 'bottom',
    },
    cancelIcon: {
      enabled: true,
    },
    classes: 'example-step-extra-class',
    buttons: [
      //   {
      //     text: 'Back',
      //     action: tour.back,
      //   },
      {
        text: 'Next',
        action: tour.next,
      },
    ],
  });

  tour.addStep({
    id: 'tour-step-03',
    scrollTo: false,
    scrollToHandler: function scrollTo(element) {
      const relevantVerbs = ['crave', 'kill'];

      jump(element, {
        duration: 1000,
        offset: -d3.select('.fixed-search-bar').node().offsetHeight,
      });

      const currentVerbText = d3
        .select(element)
        .select('.verb-name')
        .text();

      d3.select('.choices__item--selectable').text(currentVerbText);
      d3.select('.search-verb__input')
        .select('option')
        .text(currentVerbText);
    },
    text:
      'In fact, there are 85 things that our text analysis has found millennials may be killing.',
    attachTo: {
      element: '.verb-container-kill',
      on: 'top',
    },
    cancelIcon: {
      enabled: true,
    },
    classes: 'example-step-extra-class',
    buttons: [
      //   {
      //     text: 'Back',
      //     action: tour.back,
      //   },
      {
        text: 'Next',
        action: tour.next,
      },
    ],
  });

  tour.addStep({
    id: 'tour-step-04',
    scrollTo: true,
    text:
      'Still, it isn’t all negative. According to the media, there are certain things millennials absolutely crave, like human financial advisers, adventure, and cold coffee.',
    attachTo: {
      element: '.verb-container-crave',
      on: 'bottom',
    },
    cancelIcon: {
      enabled: true,
    },
    classes: 'example-step-extra-class',
    buttons: [
      //   {
      //     text: 'Back',
      //     action: tour.back,
      //   },
      {
        text: 'Next',
        action: tour.next,
      },
    ],
  });

  tour.addStep({
    id: 'tour-step-05',
    scrollTo: false,
    text:
      'You can search for things millennials supposedly do here. We recommend "love," "blame," and "drink."',
    attachTo: {
      element: '.search-verb',
      on: 'bottom',
    },
    cancelIcon: {
      enabled: true,
    },
    classes: 'example-step-extra-class',
    buttons: [
      //   {
      //     text: 'Back',
      //     action: tour.back,
      //   },
      {
        text: 'Next',
        action: tour.next,
      },
    ],
  });

  tour.addStep({
    id: 'tour-step-06',
    scrollTo: false,
    text:
      "You can search for the objects of millenials's actions here (e.g., 🥑).",
    attachTo: {
      element: '.search-noun__input',
      on: 'right',
    },
    classes: 'example-step-extra-class',
    cancelIcon: {
      enabled: true,
    },
    buttons: [
      //   {
      //     text: 'Back',
      //     action: tour.back,
      //   },
      {
        text: 'End',
        action: tour.complete,
      },
    ],
  });

  d3.select('#content').on('click', tour.complete);

  return tour;
}

export default {
  setupTour,
};
