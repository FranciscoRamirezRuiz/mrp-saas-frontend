// src/utils/parseCSV.js
export const parseCSV = (csvText) => {
    const lines = csvText.trim().split(/\r\n|\n/);
    if (lines.length === 0) return { headers: [], data: [] };
    const headers = lines[0].split(',').map(h => h.trim());
    const data = lines.slice(1).map(line => {
        const values = line.split(',');
        return headers.reduce((obj, header, index) => {
            obj[header] = values[index] ? values[index].trim() : '';
            return obj;
        }, {});
    });
    return { headers, data };
};