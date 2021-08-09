import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import relativeTime from 'dayjs/plugin/relativeTime';

import { DEFAULT_LANGUAGE_KEY } from '@/constants/i18n';

dayjs.locale(DEFAULT_LANGUAGE_KEY);
dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);
