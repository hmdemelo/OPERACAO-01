export function generateWhatsAppLink(message: string): string {
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/5563999462065?text=${encodedMessage}`;
}
