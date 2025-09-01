import React from 'react';

function SearchBar({ value, onSearch, placeholder = "Buscar...", disabled = false }) {
    const handleChange = (event) => {
        if (!disabled) onSearch(event.target.value);
    };

    return (
        <input
            type="search"
            className="search"
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            title="Buscar"
            disabled={disabled}
        />
    );
}

export default SearchBar;