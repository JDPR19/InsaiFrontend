export const filterData = (data, searchTerm, keys) => {
    if (!searchTerm.trim()) {
        return data; // Si no hay término de búsqueda, devuelve los datos originales
    }

    const lowerCaseTerm = searchTerm.toLowerCase();

    return data.filter((item) =>
        keys.some((key) =>
            item[key]?.toString().toLowerCase().includes(lowerCaseTerm)
        )
    );
};