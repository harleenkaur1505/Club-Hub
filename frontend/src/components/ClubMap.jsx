import React from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icon in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Specific coordinates for the 6 clubs
const clubLocations = [
    { id: 1, name: 'Cozy and Lifestyle Hub', lat: 30.7333, lng: 76.7794, city: 'Chandigarh' },
    { id: 2, name: 'Academic Club', lat: 30.9010, lng: 75.8573, city: 'Ludhiana' },
    { id: 3, name: 'Creative and Fun Club', lat: 31.6340, lng: 74.8723, city: 'Amritsar' },
    { id: 4, name: 'Social and Community Club', lat: 31.3260, lng: 75.5762, city: 'Jalandhar' },
    { id: 5, name: 'Tech and Skill Club', lat: 30.7046, lng: 76.7179, city: 'Mohali' },
    { id: 6, name: 'Mental Health Awareness Club', lat: 30.3398, lng: 76.3869, city: 'Patiala' }
]

export default function ClubMap() {
    // Center of Punjab roughly
    const center = [31.1471, 75.3412]

    return (
        <div className="h-[400px] w-full rounded-xl overflow-hidden shadow-lg border-2 border-white/50 relative z-0">
            <MapContainer
                center={center}
                zoom={8}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {clubLocations.map(club => (
                    <Marker key={club.id} position={[club.lat, club.lng]}>
                        <Popup>
                            <div className="text-center">
                                <h3 className="font-bold text-red-900">{club.name}</h3>
                                <p className="text-sm">{club.city}</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    )
}
