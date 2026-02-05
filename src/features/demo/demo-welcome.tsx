import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';

export const DemoWelcome = () => {
  const { t } = useTranslation(['demo']);
  return (
    <div className="flex flex-col gap-3 py-3">
      <div className="flex flex-col gap-1">
        <h2 className="leading-none font-semibold">
          {t('demo:welcome.title')}
        </h2>
        <p className="max-w-prose text-sm text-muted-foreground">
          {t('demo:welcome.description')}
        </p>
      </div>
      <div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            size="xs"
            render={<a href="https://github.com/BearStudio/start-ui-web" />}
            nativeButton={false}
          >
            GitHub
          </Button>
          <Button
            variant="secondary"
            size="xs"
            render={<a href="https://docs.web.start-ui.com/" />}
            nativeButton={false}
          >
            {t('demo:welcome.documentation')}
          </Button>
          <Button
            variant="secondary"
            size="xs"
            render={
              <a href="https://github.com/BearStudio/start-ui/issues/new" />
            }
            nativeButton={false}
          >
            {t('demo:welcome.openIssue')}
          </Button>
        </div>
      </div>
    </div>
  );
};
