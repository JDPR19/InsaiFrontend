import React from 'react';
import Select from 'react-select';


const customSelectStyles = {
    control: (provided, state) => ({
        ...provided,
        backgroundColor: '#ffffff',
        borderColor: '#ccc',
        borderRadius: 8,
        minHeight: 38,
        maxWidth: '100%',
        boxSizing: 'border-box',
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
    placeholder: (provided) => ({
        ...provided,
        color: '#adb5bd',
        fontFamily: "'Poppins', sans-serif",
        fontSize: 14,
    }),
    menu: (provided) => ({
        ...provided,
        backgroundColor: '#dfdfdfd6',
        borderRadius: 8,
        zIndex: 20,
        // minWidth: 120,
        // maxWidth: 180,
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
    singleValue: (provided) => ({
        ...provided,
        maxWidth: 180, 
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        display: 'block',
    }),
    };

    const SingleSelect = ({
    options,
    value,
    onChange,
    placeholder = "Selecciona...",
    isClearable = true,
    ...props
    }) => (
    <Select
        isMulti={false}
        options={options}
        value={options.find(opt => String(opt.value) === String(value)) || null}
        onChange={selected => onChange(selected ? selected.value : '')}
        placeholder={placeholder}
        classNamePrefix="react-select"
        styles={customSelectStyles}
        isClearable={isClearable}
        menuPortalTarget={document.body}
        {...props}
    />
    );

export default SingleSelect;