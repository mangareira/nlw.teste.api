import localized from 'dayjs/plugin/localizedFormat'
import 'dayjs/locale/pt-br'
import dayjs from "dayjs";

dayjs.locale('pt-br')
dayjs.extend(localized)

export { dayjs }