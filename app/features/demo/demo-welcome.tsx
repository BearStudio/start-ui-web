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
          <Button asChild variant="secondary" size="xs">
            <a href="https://github.com/BearStudio/start-ui-web">GitHub</a>
          </Button>
          <Button asChild variant="secondary" size="xs">
            <a href="https://docs.web.start-ui.com/">
              {t('demo:welcome.documentation')}
            </a>
          </Button>
          <Button asChild variant="secondary" size="xs">
            <a href="https://github.com/BearStudio/start-ui/issues/new">
              {t('demo:welcome.openIssue')}
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};
