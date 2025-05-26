import React, { useState } from 'react';

function SearchBar({ onSearch }) {
    const [query, setQuery] = useState('');

    const handleSearch = (event) => {
        const value = event.target.value;
        setQuery(value);
        onSearch(value); // Notificar al componente padre sobre el término de búsqueda
    };

    return (
        <input
            type="search"
            className="search"
            placeholder="Buscar..."
            value={query}
            onChange={handleSearch}
            title="Buscar"
        />
    );
}

export default SearchBar;