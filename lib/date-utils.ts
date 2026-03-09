import { startOfWeek, parseISO, format, addMinutes } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

const TIMEZONE = 'America/Araguaina'; // GMT-3 permanente

/**
 * Retorna o início da semana (Domingo) no fuso de Araguaína.
 */
export function getAraguainaStartOfWeek(date: Date | string): Date {
    const d = typeof date === 'string' ? parseISO(date.split('T')[0]) : date;
    const zonedDate = toZonedTime(d, TIMEZONE);
    const sunday = startOfWeek(zonedDate, { weekStartsOn: 0 });
    return sunday;
}

/**
 * Formata uma data para o banco de dados (ISO) garantindo que as horas 
 * sejam zeradas no fuso de Araguaína.
 */
export function formatToDatabaseDate(date: Date): Date {
    const zonedDate = toZonedTime(date, TIMEZONE);
    zonedDate.setHours(0, 0, 0, 0);
    return fromZonedTime(zonedDate, TIMEZONE);
}

/**
 * Converte uma data vinda do banco (UTC) para a exibição correta no Browser 
 * ignorando o fuso local do dispositivo.
 */
export function parseFromDatabase(dateStr: string | Date): Date {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    // O banco salva 2026-03-08T03:00:00Z (00h em Araguaína)
    // Queremos que no browser ele continue sendo 08/03 e não 07/03 às 21h se o fuso local for diferente
    return toZonedTime(date, TIMEZONE);
}
