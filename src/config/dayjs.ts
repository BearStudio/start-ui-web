import dayjs from 'dayjs';
import 'dayjs/locale/en';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.locale('en');
dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);
