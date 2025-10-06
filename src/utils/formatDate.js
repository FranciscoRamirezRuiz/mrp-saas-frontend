// src/utils/formatDate.js
export const formatDate = (dateString, options = { year: 'numeric', month: 'short', day: 'numeric' }) => {
    try {
        const date = new Date(dateString);
        // Corrige el problema de zona horaria para fechas sin hora
        if (dateString.length <= 10) {
            date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
        }
        if (isNaN(date.getTime())) return dateString;
        return date.toLocaleDateString('es-ES', options);
    } catch {
        return dateString;
    }
};