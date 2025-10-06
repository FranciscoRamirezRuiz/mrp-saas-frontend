// src/components/common/SearchableSelect.js
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

const SearchableSelect = ({ options, value, onChange, placeholder = "Seleccionar...", disabled = false }) => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [filters, setFilters] = useState({ item_type: '', unit_of_measure: '' });
    const wrapperRef = useRef(null);
    
    const selectedOption = options.find(opt => opt.sku === value);

    const uniqueTypes = useMemo(() => [...new Set(options.map(opt => opt.item_type).filter(Boolean))], [options]);
    const uniqueUnits = useMemo(() => [...new Set(options.map(opt => opt.unit_of_measure).filter(Boolean))], [options]);

    const filteredOptions = useMemo(() => {
        return options.filter(opt =>
            (query === '' || opt.sku.toLowerCase().includes(query.toLowerCase()) || opt.name.toLowerCase().includes(query.toLowerCase())) &&
            (filters.item_type === '' || opt.item_type === filters.item_type) &&
            (filters.unit_of_measure === '' || opt.unit_of_measure === filters.unit_of_measure)
        );
    }, [query, filters, options]);

    const handleSelect = (sku) => {
        onChange(sku);
        setIsOpen(false);
        setQuery('');
        setFilters({ item_type: '', unit_of_measure: '' });
    };
    
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full p-2 border rounded-lg text-left flex justify-between items-center ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
            >
                {selectedOption ? (
                    <div className="text-sm">
                        <span className="font-semibold text-gray-800">{selectedOption.name}</span>
                        <span className="text-gray-500 ml-2">({selectedOption.sku})</span>
                    </div>
                ) : <span className="text-gray-500">{placeholder}</span>}
                <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                    <div className="p-2 border-b">
                        <input
                            type="text"
                            placeholder="Buscar por SKU o nombre..."
                            className="w-full p-2 border rounded-lg mb-2"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <div className="flex gap-2 text-xs">
                            <select 
                                value={filters.item_type} 
                                onChange={e => setFilters(f => ({...f, item_type: e.target.value}))}
                                className="w-1/2 p-1 border rounded"
                            >
                                <option value="">Todo tipo</option>
                                {uniqueTypes.map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                            <select 
                                value={filters.unit_of_measure}
                                onChange={e => setFilters(f => ({...f, unit_of_measure: e.target.value}))}
                                className="w-1/2 p-1 border rounded"
                            >
                                <option value="">Toda unidad</option>
                                {uniqueUnits.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                            </select>
                        </div>
                    </div>
                    <ul>
                        {filteredOptions.length > 0 ? filteredOptions.map(opt => (
                            <li
                                key={opt.sku}
                                onClick={() => handleSelect(opt.sku)}
                                className="p-3 hover:bg-indigo-50 cursor-pointer text-sm"
                            >
                                <div className="font-semibold text-gray-800">{opt.name} ({opt.sku})</div>
                                <div className="text-xs text-gray-500 mt-1">
                                    Tipo: <span className="font-medium">{opt.item_type}</span> | Unidad: <span className="font-medium">{opt.unit_of_measure}</span>
                                </div>
                            </li>
                        )) : <li className="p-3 text-sm text-gray-500">No se encontraron ítems.</li>}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default SearchableSelect;