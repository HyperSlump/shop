'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconTruck, IconMapPin, IconLoader2, IconAlertTriangle } from '@tabler/icons-react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

export interface ShippingAddress {
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    state_code: string;
    country_code: string;
    zip: string;
}

interface ShippingFormProps {
    address?: ShippingAddress | null;
    onAddressSelected: (address: ShippingAddress) => void;
    isDark: boolean;
    isCalculating?: boolean;
}

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || '';

export default function ShippingForm({ address: initialAddress, onAddressSelected, isDark, isCalculating }: ShippingFormProps) {
    const [address, setAddress] = useState<ShippingAddress>(initialAddress || {
        firstName: '',
        lastName: '',
        address1: '',
        address2: '',
        city: '',
        state_code: '',
        country_code: 'US',
        zip: '',
    });

    // Sync local state with initialAddress prop
    useEffect(() => {
        if (initialAddress) {
            setAddress(prev => {
                // Only update if actually different to avoid cycles
                if (JSON.stringify(prev) === JSON.stringify(initialAddress)) return prev;
                return { ...prev, ...initialAddress };
            });
        }
    }, [initialAddress]);

    const [placesLoaded, setPlacesLoaded] = useState(false);
    const [placesError, setPlacesError] = useState(false);

    const autocompleteInputRef = useRef<HTMLInputElement>(null);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const hasInitialized = useRef(false);

    // Load Google Places API
    useEffect(() => {
        if (hasInitialized.current) return;
        hasInitialized.current = true;

        if (!GOOGLE_API_KEY) {
            console.warn('[ShippingForm] No Google Places API key, using manual input');
            setPlacesError(true);
            return;
        }

        console.log('[ShippingForm] Loading Google Places API...');
        setOptions({ key: GOOGLE_API_KEY, v: 'weekly', libraries: ['places'] });

        importLibrary('places').then(() => {
            console.log('[ShippingForm] Google Places loaded successfully');
            setPlacesLoaded(true);
        }).catch((err: Error) => {
            console.error('[ShippingForm] Google Places failed to load:', err);
            setPlacesError(true);
        });
    }, []);

    // Parse Google Places address_components into our structured format
    function parseAddressComponents(components: google.maps.GeocoderAddressComponent[]) {
        const get = (type: string) => components.find(c => c.types.includes(type));

        const streetNumber = get('street_number')?.long_name || '';
        const route = get('route')?.long_name || '';
        const city = get('locality')?.long_name || get('sublocality_level_1')?.long_name || get('administrative_area_level_2')?.long_name || '';
        const state = get('administrative_area_level_1')?.short_name || '';
        const country = get('country')?.short_name || 'US';
        const zip = get('postal_code')?.long_name || '';

        return {
            address1: `${streetNumber} ${route}`.trim(),
            city,
            state_code: state,
            country_code: country,
            zip,
        };
    }

    // Initialize autocomplete via ref callback when input mounts
    const initAutocomplete = useCallback((inputElement: HTMLInputElement | null) => {
        autocompleteInputRef.current = inputElement;
        if (!inputElement || !placesLoaded || autocompleteRef.current) return;

        console.log('[ShippingForm] Initializing autocomplete on input element');
        const autocomplete = new google.maps.places.Autocomplete(inputElement, {
            types: ['address'],
            fields: ['address_components', 'formatted_address'],
        });

        autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            console.log('[ShippingForm] Place selected:', place.formatted_address);
            if (!place.address_components) return;

            const parsed = parseAddressComponents(place.address_components);

            setAddress(prev => {
                const newAddress: ShippingAddress = {
                    ...prev,
                    address1: parsed.address1,
                    address2: '',
                    city: parsed.city,
                    state_code: parsed.state_code,
                    country_code: parsed.country_code,
                    zip: parsed.zip,
                };

                return newAddress;
            });
        });

        autocompleteRef.current = autocomplete;
    }, [placesLoaded]);

    // Trigger address selection whenever any field changes
    useEffect(() => {
        const timer = setTimeout(() => {
            onAddressSelected(address);
        }, 800);
        return () => clearTimeout(timer);
    }, [address, onAddressSelected]);

    const inputClass = `w-full h-11 px-3 rounded-md text-sm outline-none transition-all duration-150 border ${isDark
        ? 'bg-card border-border/40 focus:border-primary focus:ring-1 focus:ring-primary/20 shadow-sm text-foreground placeholder:text-muted/50'
        : 'bg-white border-border focus:border-primary focus:ring-1 focus:ring-primary/20 shadow-sm text-foreground'
        }`;

    const labelClass = "block text-sm font-medium text-foreground mb-1.5";

    return (
        <div className="space-y-6 font-sans">
            <div>
                <h2 className="text-xl font-semibold text-foreground tracking-tight mb-1">Shipping Details</h2>
            </div>

            {placesError && (
                <div className="p-3 rounded bg-alert/10 border border-alert/30 text-alert text-sm font-medium flex items-center gap-2">
                    <IconAlertTriangle size={16} />
                    <span>Address autocomplete unavailable. Using manual entry.</span>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>First name</label>
                    <input
                        required
                        type="text"
                        id="shipping-first-name"
                        name="shipping_first_name"
                        autoComplete="shipping given-name"
                        className={inputClass}
                        value={address.firstName}
                        onChange={(e) => setAddress({ ...address, firstName: e.target.value })}
                    />
                </div>
                <div>
                    <label className={labelClass}>Last name</label>
                    <input
                        required
                        type="text"
                        id="shipping-last-name"
                        name="shipping_last_name"
                        autoComplete="shipping family-name"
                        className={inputClass}
                        value={address.lastName}
                        onChange={(e) => setAddress({ ...address, lastName: e.target.value })}
                    />
                </div>
            </div>

            <div className="space-y-4">
                {placesLoaded && !placesError && (
                    <div>
                        <label className={labelClass}>
                            Address Search
                        </label>
                        <div className="relative">
                            <input
                                ref={initAutocomplete}
                                type="text"
                                id="location-lookup"
                                name="location_lookup"
                                placeholder="Start typing your address..."
                                className={inputClass}
                                autoComplete="off"
                                inputMode="search"
                                autoCorrect="off"
                                spellCheck={false}
                                data-form-type="other"
                                data-lpignore="true"
                            />
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Address</label>
                        <input
                            required
                            type="text"
                            id="shipping-address-line1"
                            name="shipping_address_line1"
                            autoComplete="shipping address-line1"
                            className={inputClass}
                            value={address.address1}
                            onChange={(e) => setAddress({ ...address, address1: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>
                            Apt, suite, etc. <span className="text-muted-foreground font-normal">(optional)</span>
                        </label>
                        <input
                            type="text"
                            id="shipping-address-line2"
                            name="shipping_address_line2"
                            autoComplete="shipping address-line2"
                            className={inputClass}
                            value={address.address2 || ''}
                            onChange={(e) => setAddress({ ...address, address2: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>City</label>
                        <input
                            required
                            type="text"
                            id="shipping-city"
                            name="shipping_city"
                            autoComplete="shipping address-level2"
                            className={inputClass}
                            value={address.city}
                            onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>State / Province</label>
                        <input
                            required
                            type="text"
                            id="shipping-state"
                            name="shipping_state"
                            autoComplete="shipping address-level1"
                            maxLength={2}
                            className={inputClass}
                            value={address.state_code}
                            onChange={(e) => setAddress({ ...address, state_code: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className={labelClass}>ZIP / Postal Code</label>
                        <input
                            required
                            type="text"
                            id="shipping-postal-code"
                            name="shipping_postal_code"
                            autoComplete="shipping postal-code"
                            className={inputClass}
                            value={address.zip}
                            onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                        />
                    </div>
                    {/* Hidden Country Code Input */}
                    <input
                        type="hidden"
                        name="shipping_country"
                        autoComplete="shipping country"
                        value={address.country_code}
                    />
                </div>
            </div>
        </div>
    );
}
