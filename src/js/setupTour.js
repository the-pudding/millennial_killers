import Shepherd from 'shepherd.js';

function setupTour() {
  const tour = new Shepherd.Tour({
    defaultStepOptions: {
      classes: 'custom-tour',
      scrollTo: true,
    },
  });

  tour.addStep({
    id: 'tour-step-1',
    text: 'Search for things millennials do here',
    attachTo: {
      element: '.search-verb',
      on: 'bottom',
    },
    classes: 'example-step-extra-class',
    buttons: [
      {
        text: 'Close',
        action: tour.complete,
      },
      {
        text: 'Next',
        action: tour.next,
      },
    ],
  });

  tour.addStep({
    id: 'tour-step-2',
    text: "You can search for the objects of millenials's actions here",
    attachTo: {
      element: '.search-noun__input',
      on: 'bottom',
    },
    classes: 'example-step-extra-class',
    buttons: [
      {
        text: 'Close',
        action: tour.complete,
      },
      {
        text: 'Next',
        action: tour.next,
      },
    ],
  });

  tour.addStep({
    id: 'tour-step-2',
    text: 'Scroll to things millenials feel 👍 and 👎 about',
    attachTo: {
      element: '.button-container',
      on: 'bottom',
    },
    classes: 'example-step-extra-class',
    buttons: [
      {
        text: 'Close',
        action: tour.destroy,
      },
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
