import React from 'react';
import Select from 'react-select';


    const customSelectStyles = {
    control: (provided, state) => ({
        ...provided,
        backgroundColor: '#ffffff',
        borderColor: '#ccc',
        borderRadius: 8,
        minHeight: 38,
        boxShadow: state.isFocused ? '0 0 5px rgba(152, 199, 154, 0.5)' : 'none',
        transition: 'all 0.3s ease',
        fontFamily: "'Poppins', sans-serif",
        fontSize: 15,
        color: '#242424',
        '&:hover': {
        borderColor: '#80b183',
        },
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected
        ? '#a5cfa7'
        : state.isFocused
        ? '#b8dabac1'
        : '#f8fff4',
        color: '#242424',
        fontFamily: "'Poppins', sans-serif",
        fontSize: 15,
        cursor: 'pointer',
        padding: 8,
    }),
    multiValue: (provided) => ({
        ...provided,
        backgroundColor: '#c5e2c796',
        borderRadius: 8,
        color: '#242424',
        fontFamily: "'Poppins', sans-serif",
        fontSize: 14,
        maxWidth: 140, 
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    }),
    multiValueLabel: (provided) => ({
        ...provided,
        color: '#242424',
        fontFamily: "'Poppins', sans-serif",
        fontSize: 14,
        maxWidth: 110, // Limita el ancho del texto
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        display: 'inline-block',
    }),
    multiValueRemove: (provided) => ({
        ...provided,
        color: '#89b48b',
        borderRadius: 8,
        ':hover': {
        backgroundColor: '#89b48b',
        color: '#fff',
        },
    }),
    placeholder: (provided) => ({
        ...provided,
        color: '#adb5bd',
        fontFamily: "'Poppins', sans-serif",
        fontSize: 14,
    }),
    menu: (provided) => ({
        ...provided,
        backgroundColor: '#dfdfdfcf',
        borderRadius: 8,
        zIndex: 20,
    }),
    menuList: (provided) => ({
        ...provided,
        maxHeight: 160, 
        overflowY: 'auto'
    }),
    menuPortal: base => ({
        ...base,
        zIndex: 9999, 
    }),
    input: (provided) => ({
        ...provided,
        color: '#242424',
        fontFamily: "'Poppins', sans-serif",
        fontSize: 15,
    }),
    };

    const MultiSelect = ({
    options,
    value,
    onChange,
    placeholder = "Selecciona...",
    isMulti = true,
    ...props
    }) => (
    <Select
        isMulti={isMulti}
        options={options}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        classNamePrefix="react-select"
        styles={customSelectStyles}
        menuPortalTarget={document.body}
        {...props}
    />
    );

export default MultiSelect;