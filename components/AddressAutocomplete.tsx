
import React, { useEffect, useRef, useState } from 'react';

interface AddressData {
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
  onAddressSelect: (address: AddressData) => void;
  defaultValue?: string;
}

const AddressAutocomplete: React.FC<Props> = ({ onAddressSelect, defaultValue }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  // Fix for: Cannot find namespace 'google'. Using any to bypass missing type definitions for the Autocomplete instance.
  const autocompleteRef = useRef<any>(null);
  const [inputValue, setInputValue] = useState(defaultValue || '');

  useEffect(() => {
    // Load Google Maps script if not already present
    // Fix for: Property 'google' does not exist on type 'Window & typeof globalThis'. Using (window as any) for detection.
    if (!(window as any).google) {
      const apiKey = (window as any).process?.env?.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => initAutocomplete();
      document.head.appendChild(script);
    } else {
      initAutocomplete();
    }
  }, []);

  const initAutocomplete = () => {
    // Fix for: Property 'google' does not exist on type 'Window & typeof globalThis'.
    if (!inputRef.current || !(window as any).google) return;

    // Fix for: Cannot find name 'google'. Using window cast to access the global google constructor.
    autocompleteRef.current = new (window as any).google.maps.places.Autocomplete(inputRef.current, {
      types: ['address'],
      componentRestrictions: { country: 'us' },
      fields: ['address_components', 'formatted_address', 'geometry', 'place_id'],
    });

    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current?.getPlace();
      if (!place || !place.address_components) return;

      const address: AddressData = {
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
      setInputValue(address.formattedAddress);
      onAddressSelect(address);
    });
  };

  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Property Address *</label>
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:border-brand-blue outline-none transition-colors"
        placeholder="Start typing property address..."
        required
      />
      <p className="text-[10px] text-slate-400 italic">Start typing and pick a suggestion.</p>
    </div>
  );
};

export default AddressAutocomplete;
