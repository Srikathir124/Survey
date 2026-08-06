export const trackEvent = (eventName, params = {}) => {
  if (window.gtag) {
    window.gtag("event", eventName, params);
  }
};

export const trackPageView = (pageName) => {
  if (window.gtag) {
    window.gtag("event", "page_view", {
      page_title: pageName,
    });
  }
};
