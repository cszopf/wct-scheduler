
import React, { useEffect, useRef, useState } from 'react';
import { loadGoogleMapsPlaces, getLastMapsLoadError } from '../lib/googleMapsLoader';

export interface StructuredAddress {
  formattedAddress: string;
  street1: string;
  street2: string;
  city: string;
  state: string;
  postalCode: string;
  county: string;
  country: string;
  placeId: string;
  lat: number;
  lng: number;
}

interface Props {
  value: string;
  onValueChange: (value: string) => void;
  onSelect: (address: StructuredAddress) => void;
  disabled?: boolean;
}

const AddressAutocomplete: React.FC<Props> = ({ value, onValueChange, onSelect, disabled }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [showDebug, setShowDebug] = useState<boolean>(false);

  useEffect(() => {
    loadGoogleMapsPlaces()
      .then(() => {
        // Hard assert the library exists
        if (!(window as any).google?.maps?.places?.Autocomplete) {
          throw new Error("Places library missing after load");
        }
        initAutocomplete();
        setLoadError(null);
      })
      .catch((err) => {
        setLoadError(getLastMapsLoadError() || err.message);
      })
      .finally(() => {
        setIsInitializing(false);
      });
  }, []);

  const initAutocomplete = () => {
    if (!inputRef.current) return;

    autocompleteRef.current = new (window as any).google.maps.places.Autocomplete(inputRef.current, {
      types: ['address'],
      componentRestrictions: { country: 'us' },
      fields: ['address_components', 'formatted_address', 'geometry', 'place_id'],
    });

    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current?.getPlace();
      if (!place || !place.address_components) return;

      const address: StructuredAddress = {
        formattedAddress: place.formatted_address || '',
        street1: '',
        street2: '',
        city: '',
        state: '',
        postalCode: '',
        county: '',
        country: '',
        placeId: place.place_id || '',
        lat: place.geometry?.location?.lat() || 0,
        lng: place.geometry?.location?.lng() || 0,
      };

      let streetNumber = '';
      let route = '';

      place.address_components.forEach((component: any) => {
        const types = component.types;
        if (types.includes('street_number')) streetNumber = component.long_name;
        if (types.includes('route')) route = component.long_name;
        if (types.includes('subpremise')) address.street2 = component.long_name;
        if (types.includes('locality')) address.city = component.long_name;
        if (types.includes('administrative_area_level_1')) address.state = component.short_name;
        if (types.includes('postal_code')) address.postalCode = component.long_name;
        if (types.includes('administrative_area_level_2')) address.county = component.long_name;
        if (types.includes('country')) address.country = component.short_name;
      });

      address.street1 = `${streetNumber} ${route}`.trim();
      
      onValueChange(address.formattedAddress);
      onSelect(address);
    });
  };

  const getMaskedKey = () => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
    if (key.length <= 10) return "Key too short or missing";
    return `${key.substring(0, 6)}...${key.substring(key.length - 4)}`;
  };

  if (loadError) {
    return (
      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Property Address *</label>
        <input
          type="text"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          className="w-full border border-red-200 bg-red-50 rounded-lg p-2.5 text-sm focus:border-brand-blue outline-none transition-colors"
          placeholder="Enter address manually..."
          required
          disabled={disabled}
        />
        <div className="flex flex-col space-y-1">
          <p className="text-[9px] text-red-500 font-medium">Autocomplete unavailable. Please enter full address manually.</p>
          <button 
            type="button" 
            onClick={() => setShowDebug(!showDebug)}
            className="text-[9px] text-slate-400 underline text-left hover:text-slate-600"
          >
            {showDebug ? 'Hide' : 'Show'} technical diagnostic info
          </button>
        </div>

        {showDebug && (
          <div className="bg-slate-900 text-slate-300 p-3 rounded-lg text-[9px] font-mono leading-relaxed border border-slate-700">
            <p className="text-brand-teal mb-1 font-bold">Diagnostic Information:</p>
            <p><span className="text-slate-500">Hostname:</span> {window.location.hostname}</p>
            <p><span className="text-slate-500">Key Exists:</span> {!!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? 'Yes' : 'No'}</p>
            <p><span className="text-slate-500">Key Masked:</span> {getMaskedKey()}</p>
            <p className="mt-1 text-red-400"><span className="text-slate-500">Error:</span> {loadError}</p>
            <div className="mt-2 pt-2 border-t border-slate-800 text-slate-400 italic">
              Check billing, API enablement (Maps JS + Places), and HTTP referrer restrictions in Google Cloud Console.
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Property Address *</label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          disabled={disabled || isInitializing}
          className={`w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:border-brand-blue outline-none transition-colors ${isInitializing ? 'bg-slate-50 cursor-wait' : ''}`}
          placeholder={isInitializing ? "Initializing Places..." : "Start typing property address..."}
          required
        />
        {isInitializing && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-3 h-3 border-t-2 border-brand-blue rounded-full animate-spin"></div>
          </div>
        )}
      </div>
      <p className="text-[10px] text-slate-400 italic">Start typing and pick a suggestion.</p>
    </div>
  );
};

export default AddressAutocomplete;
