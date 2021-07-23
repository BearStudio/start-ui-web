import dayjs from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/fr';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import relativeTime from 'dayjs/plugin/relativeTime';

import { DEFAULT_LANGUAGE } from '@/constants/i18n';

dayjs.locale(DEFAULT_LANGUAGE);
dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);
