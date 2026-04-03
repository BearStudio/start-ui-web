import type { Preview } from '@storybook/react-vite';
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { useDarkMode } from '@vueless/storybook-dark-mode';
import type { ReactNode } from 'react';
import {
  createContext,
  StrictMode,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { useTranslation } from 'react-i18next';
import { StoryContext } from 'storybook/internal/csf';

import '@/styles/app.css';
import './preview.css';

import {
  AVAILABLE_LANGUAGES,
  DEFAULT_LANGUAGE_KEY,
} from '../src/lib/i18n/constants';
import i18nGlobal from '../src/lib/i18n/index';
import { Providers } from '../src/providers';

const StorybookStorySlotContext = createContext<ReactNode>(null);

function StorybookStorySlotRoot() {
  const slot = useContext(StorybookStorySlotContext);
  return <>{slot}</>;
}

/** Minimal router so components using useRouter() work in Storybook. */
function StorybookTanStackRouter({ children }: { children: ReactNode }) {
  const router = useMemo(() => {
    const rootRoute = createRootRoute({
      component: StorybookStorySlotRoot,
    });
    const routeTree = rootRoute.addChildren([]);
    return createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ['/'] }),
    });
  }, []);

  return (
    <StorybookStorySlotContext.Provider value={children}>
      <RouterProvider router={router} />
    </StorybookStorySlotContext.Provider>
  );
}

const DocumentationWrapper = ({
  children,
  context,
}: {
  children: ReactNode;
  context: StoryContext;
}) => {
  const { i18n } = useTranslation();

  // Update language
  useEffect(() => {
    i18n.changeLanguage(context.globals.locale);
    const languageConfig = AVAILABLE_LANGUAGES.find(
      ({ key }) => key === context.globals.locale
    );
    if (languageConfig) {
      document.documentElement.lang = languageConfig.key;
      document.documentElement.dir = languageConfig.dir ?? 'ltr';
      document.documentElement.style.fontSize = `${(languageConfig.fontScale ?? 1) * 100}%`;
    }
  }, [context.globals.locale, i18n]);

  return <div id="preview-container">{children}</div>;
};

const preview: Preview = {
  parameters: {
    layout: 'padded',
    backgrounds: {
      disable: true,
    },
    darkMode: {
      stylePreview: true,
    },
    docs: {
      codePanel: true,
    },
  },
  initialGlobals: {
    locale: DEFAULT_LANGUAGE_KEY,
  },
  globalTypes: {
    locale: {
      name: 'Locale',
      description: 'Internationalization locale',
      toolbar: {
        icon: 'globe',
        items: AVAILABLE_LANGUAGES.map(({ key }) => ({
          value: key,
          title: i18nGlobal.t(`common:languages.values.${String(key)}`, {
            lng: 'en',
          }),
        })),
      },
    },
  },
  decorators: [
    (story, context) => {
      const isDarkMode = useDarkMode();
      return (
        <Providers forcedTheme={isDarkMode ? 'dark' : 'light'}>
          <StrictMode>
            <StorybookTanStackRouter>
              <DocumentationWrapper context={context}>
                {/* Calling as a function to avoid errors. Learn more at:
                 * https://github.com/storybookjs/storybook/issues/15223#issuecomment-1092837912
                 */}
                {story(context)}
              </DocumentationWrapper>
            </StorybookTanStackRouter>
          </StrictMode>
        </Providers>
      );
    },
  ],
};

export default preview;
