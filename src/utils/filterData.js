export const filterData = (data, searchTerm, keys) => {
    if (!searchTerm.trim()) {
        return data; 
    }

    const lowerCaseTerm = searchTerm.toLowerCase();

    return data.filter((item) =>
        keys.some((key) =>
            item[key]?.toString().toLowerCase().includes(lowerCaseTerm)
        )
    );
};