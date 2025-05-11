import { GoogleMap, InfoWindow, LoadScript, Marker } from '@react-google-maps/api';
import { useState } from 'react';

interface LocationMapProps {
    location: {
        lat: number;
        lng: number;
        address?: string;
    };
    height?: string;
    width?: string;
    zoom?: number;
    onLocationSelect?: (location: { lat: number; lng: number }) => void;
}

const defaultCenter = {
    lat: 10.762622,
    lng: 106.660172,
};

export default function LocationMap({
    location,
    height = '400px',
    width = '100%',
    zoom = 15,
    onLocationSelect,
}: LocationMapProps) {
    const [selectedLocation, setSelectedLocation] = useState(location);
    const [showInfoWindow, setShowInfoWindow] = useState(false);

    const mapContainerStyle = {
        width,
        height,
    };

    const handleMapClick = (e: google.maps.MapMouseEvent) => {
        if (e.latLng && onLocationSelect) {
            const newLocation = {
                lat: e.latLng.lat(),
                lng: e.latLng.lng(),
            };
            setSelectedLocation(newLocation);
            onLocationSelect(newLocation);
        }
    };

    return (
        <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}>
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={selectedLocation || defaultCenter}
                zoom={zoom}
                onClick={handleMapClick}
            >
                {selectedLocation && (
                    <Marker
                        position={selectedLocation}
                        onClick={() => setShowInfoWindow(true)}
                    />
                )}

                {showInfoWindow && selectedLocation && (
                    <InfoWindow
                        position={selectedLocation}
                        onCloseClick={() => setShowInfoWindow(false)}
                    >
                        <div>
                            <p className="font-medium">Vị trí đã chọn</p>
                            {selectedLocation.address && (
                                <p className="text-sm text-gray-600">{selectedLocation.address}</p>
                            )}
                            <p className="text-sm text-gray-600">
                                {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                            </p>
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>
        </LoadScript>
    );
} 