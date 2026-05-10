import ReactGA from 'react-ga4';

const TRACKING_ID = "G-XXXXXXXXXX"; // Reemplazar con el ID de GA4 de recetasdepili

export const initGA = () => {
  ReactGA.initialize(TRACKING_ID);
};

export const logPageView = () => {
  ReactGA.send({ hitType: "pageview", page: window.location.pathname });
};

export const logEvent = (category, action, label) => {
  ReactGA.event({ category, action, label });
};
