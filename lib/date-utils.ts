import { startOfWeek, parseISO, format, addMinutes } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

const TIMEZONE = 'America/Araguaina'; // GMT-3 permanente

/**
 * Retorna o início da semana (Domingo) no fuso de Araguaína.
 */
export function getAraguainaStartOfWeek(date: Date | string): Date {
    // Normaliza para string yyyy-mm-dd para evitar confusão de fuso no parsing inicial
    const datePart = typeof date === 'string' ? date.split('T')[0] : format(date, 'yyyy-MM-dd');

    // Cria a data diretamente no fuso de Araguaina às 12:00 (meio-dia)
    // Usar meio-dia evita que qualquer oscilação de fuso (-3, -2, etc) mude o dia
    const zonedDate = toZonedTime(`${datePart}T12:00:00`, TIMEZONE);

    const sunday = startOfWeek(zonedDate, { weekStartsOn: 0 });
    sunday.setHours(0, 0, 0, 0); // Garante início do dia

    // Retorna o equivalente UTC para comparação segura no banco (03:00Z)
    return fromZonedTime(sunday, TIMEZONE);
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
