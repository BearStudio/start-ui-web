import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const DemoWelcome = () => {
  const { t } = useTranslation(['demo']);
  return (
    <Card className="border-transparent bg-transparent">
      <CardHeader>
        <CardTitle>{t('demo:welcome.title')}</CardTitle>
        <CardDescription className="max-w-prose">
          {t('demo:welcome.description')}
        </CardDescription>
      </CardHeader>
      <CardFooter className="pt-2">
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
      </CardFooter>
    </Card>
  );
};
