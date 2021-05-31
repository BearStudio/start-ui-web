import '@testing-library/jest-dom/extend-expect';
import mediaQuery from 'css-mediaquery';

window.scrollTo = () => undefined;

global.matchMedia =
  global.matchMedia ||
  function (query) {
    const instance = {
      matches: mediaQuery.match(query, {
        width: window.innerWidth,
        height: window.innerHeight,
      }),
      media: query,
      onchange: null,
      addListener: jest.fn(), // Deprecated
      removeListener: jest.fn(), // Deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    };

    // Listen to resize events from window.resizeTo and update the instance's match
    window.addEventListener('resize', () => {
      const change = mediaQuery.match(query, {
        width: window.innerWidth,
        height: window.innerHeight,
      });

      // eslint-disable-next-line
      if (change != instance.matches) {
        instance.matches = change;
        instance.dispatchEvent('change');
      }
    });

    return instance;
  };

// Mock window.resizeTo's impl.
Object.defineProperty(window, 'resizeTo', {
  value: (width, height) => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: width,
    });
    Object.defineProperty(window, 'outerWidth', {
      configurable: true,
      writable: true,
      value: width,
    });
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      writable: true,
      value: height,
    });
    Object.defineProperty(window, 'outerHeight', {
      configurable: true,
      writable: true,
      value: height,
    });
    window.dispatchEvent(new Event('resize'));
  },
});
