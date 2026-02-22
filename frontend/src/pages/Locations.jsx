import React, { useEffect, useState, useRef } from 'react'
import { locationsAPI, committeesAPI } from '../services/membershipAPI'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Locations() {
  const { user } = useAuth()
  const [locations, setLocations] = useState([])
  const [clubs, setClubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    phone: '',
    email: '',
    capacity: '',
    amenities: '',
    notes: '',
    lat: '',
    lng: ''
  })

  const mapRef = useRef(null)

  useEffect(() => {
    loadLocations()
  }, [])

  useEffect(() => {
    // Only initialize map if locations are loaded and we have a container
    if (loading || !mapRef.current) return;

    // Use global L from CDN
    const L = window.L;

    if (!L) {
      console.error("Leaflet not loaded");
      return;
    }

    // Explicitly define icon to ensure it renders
    const customIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    const map = L.map(mapRef.current).setView([31.1471, 75.3412], 8); // Punjab Center

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    locations.forEach(loc => {
      if (loc.coordinates && loc.coordinates.lat && loc.coordinates.lng) {

        // Find linked clubs
        const clubsAtLocation = clubs.filter(c =>
          (c.location && loc.address && c.location.toLowerCase().includes(loc.address.toLowerCase())) ||
          (c.location && loc.city && c.location.toLowerCase().includes(loc.city.toLowerCase()))
        );

        // Construct Popup DOM Element (better than string for React Router interaction, but vanilla JS links work too)
        let popupContent = `
                <div style="text-align: center; min-width: 200px;">
                    <h3 style="color: #442D1C; margin: 0 0 5px 0; font-size: 16px;"><b>${loc.name}</b></h3>
                    <p style="margin: 0; color: #555; font-size: 13px;">${loc.city}, ${loc.state}</p>
            `;

        if (clubsAtLocation.length > 0) {
          popupContent += `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee;">
                    <p style="margin: 0 0 5px 0; font-size: 10px; text-transform: uppercase; color: #888; font-weight: bold;">Home of</p>`;

          clubsAtLocation.forEach(club => {
            // Using standard href for navigation - causes full reload but simplest for vanilla HTML inside popup
            // For SPA navigation we would need ReactDOM.render into the popup node, but this is efficient enough.
            popupContent += `<a href="/club/${club._id}" style="display: block; color: #b91c1c; font-weight: bold; text-decoration: none; margin-bottom: 4px; font-size: 14px;">${club.name}</a>`;
          });
          popupContent += `</div>`;
        }

        popupContent += `<p style="margin-top: 6px; font-size: 11px; color: #999;">${loc.address}</p></div>`;


        L.marker([loc.coordinates.lat, loc.coordinates.lng], { icon: customIcon })
          .addTo(map)
          .bindPopup(popupContent)
          .bindTooltip(`${loc.city}, ${loc.state}`, {
            direction: 'bottom',
            offset: [0, 10],
            opacity: 0.9
          });
      }
    });

    // Cleanup
    return () => {
      map.remove();
    }

  }, [locations, clubs, loading]);

  const loadLocations = async () => {
    try {
      const { data } = await locationsAPI.list()
      const clubsRes = await committeesAPI.list()

      setLocations(data.locations || [])
      setClubs(clubsRes.data.committees || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
        alert("Please enter a valid 10-digit phone number.")
        return
      }
      const payload = {
        ...formData,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        amenities: formData.amenities ? formData.amenities.split(',').map(a => a.trim()) : [],
        coordinates: (formData.lat && formData.lng) ? {
          lat: parseFloat(formData.lat),
          lng: parseFloat(formData.lng)
        } : undefined
      }
      await locationsAPI.create(payload)
      setShowForm(false)
      setFormData({
        name: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA',
        phone: '',
        email: '',
        capacity: '',
        amenities: '',
        notes: '',
        lat: '',
        lng: ''
      })
      loadLocations()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create location')
    }
  }

  const toggleLocationStatus = async (id, currentStatus) => {
    try {
      await locationsAPI.update(id, { isActive: !currentStatus })
      loadLocations()
    } catch (err) {
      alert('Failed to update location')
    }
  }

  if (loading) return <div className="text-center py-8">Loading locations...</div>

  // Center map on Punjab roughly
  const defaultCenter = [31.1471, 75.3412]

  const clubBackgrounds = {
    'Cozy and Lifestyle Club': 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=1000',
    'Academic Club': 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=1000',
    'Creative and Fun Club': 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=80&w=1000',
    'Social and Community Club': 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=1000',
    'Tech and Skill Club': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1000',
    'Mental Health Awareness Club': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1000'
  }

  return (
    <div className="fade-in space-y-6">
      <div className="mb-12 py-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-6xl md:text-7xl font-thin font-outfit text-[#442D1C] tracking-[0.05em] drop-shadow-sm mb-4 leading-tight">
            Club Locations
          </h1>
          <p className="text-xl md:text-2xl text-[#442D1C]/70 italic font-light tracking-wide">
            Explore our physical spaces and gathering hubs
          </p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowForm(!showForm)}
            className={`px-8 py-4 rounded-xl font-bold font-outfit tracking-wider transition-all transform hover:scale-105 shadow-lg ${showForm ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20' : 'bg-[#442D1C] text-white hover:bg-[#5D3E26] hover:shadow-[0_0_20px_rgba(68,45,28,0.4)]'}`}
          >
            {showForm ? 'Cancel' : '+ Add Location'}
          </button>
        )}
      </div>

      {/* Map Section */}
      <div
        ref={mapRef}
        className="h-[450px] w-full rounded-3xl overflow-hidden shadow-2xl border border-white/10 z-0 relative"
      >
        <div className="absolute inset-0 bg-[#442D1C]/5 pointer-events-none" />
      </div>

      {showForm && (
        <div className="bg-[#442D1C] p-10 rounded-3xl shadow-2xl mb-12 slide-in-up relative overflow-hidden border border-white/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />

          <h3 className="font-thin text-4xl mb-8 text-white font-outfit tracking-widest uppercase">Add New Location</h3>
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-white/70 mb-2 uppercase tracking-tighter">Location Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-[#84592B]/50 focus:border-[#84592B]/50 transition-all font-outfit"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/70 mb-2 uppercase tracking-tighter">Capacity</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-[#84592B]/50 focus:border-[#84592B]/50 transition-all font-outfit"
                />
              </div>
            </div>

            {/* Coordinates Inputs */}
            <div className="grid md:grid-cols-2 gap-6 p-6 rounded-2xl bg-black/10 border border-white/5">
              <div>
                <label className="block text-sm font-semibold text-white/50 mb-2 uppercase tracking-tighter">Latitude</label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 30.7333"
                  value={formData.lat}
                  onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-white/10 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/50 mb-2 uppercase tracking-tighter">Longitude</label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 76.7794"
                  value={formData.lng}
                  onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-white/10 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/70 mb-2 uppercase tracking-tighter">Address *</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-[#84592B]/50 transition-all"
              />
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-white/70 mb-2 uppercase tracking-tighter">City *</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/70 mb-2 uppercase tracking-tighter">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/70 mb-2 uppercase tracking-tighter">Zip Code</label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none transition-all"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-white/70 mb-2 uppercase tracking-tighter">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setFormData({ ...formData, phone: val })
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none transition-all"
                  placeholder="10-digit Mobile Number"
                  pattern="[0-9]{10}"
                  maxLength="10"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/70 mb-2 uppercase tracking-tighter">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-white/70 mb-2 uppercase tracking-tighter">Amenities (comma-separated)</label>
              <input
                type="text"
                placeholder="WiFi, Parking, Kitchen, etc."
                value={formData.amenities}
                onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white/70 mb-2 uppercase tracking-tighter">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows="3"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              className="w-full px-8 py-4 bg-[#84592B] text-[#442D1C] rounded-xl font-bold font-outfit tracking-wider shadow-lg hover:bg-[#A67C52] hover:shadow-[0_0_25px_rgba(132,89,43,0.5)] transition-all transform hover:scale-[1.02]"
            >
              Create Location
            </button>
          </form>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {locations.map((location) => {
          // Determine background image based on name match (fuzzy or exact)
          let bgImage = 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=1000' // Default fallback
          const locName = location.name.trim()

          if (clubBackgrounds[locName]) {
            bgImage = clubBackgrounds[locName]
          } else {
            // Try to find a partial match
            const match = Object.keys(clubBackgrounds).find(key => locName.includes(key) || key.includes(locName))
            if (match) bgImage = clubBackgrounds[match]
          }

          return (
            <div
              key={location._id}
              className="group relative overflow-hidden rounded-3xl bg-[#442D1C] shadow-lg hover:shadow-2xl transition-all duration-500 h-[320px] flex flex-col"
            >
              {/* Background Image with Brown Tint */}
              <div
                className="absolute inset-0 z-0 transition-transform duration-700 group-hover:scale-110 opacity-40 mix-blend-multiply"
                style={{
                  backgroundImage: `url(${bgImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />

              {/* Dark Gradient Overlay for Readability */}
              <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#442D1C]/90 via-[#442D1C]/60 to-transparent group-hover:from-[#442D1C]/95 transition-all duration-500" />

              {/* Content Content - now z-20 and white text */}
              <div className="relative z-20 p-8 flex flex-col h-full justify-between">

                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold text-white font-outfit tracking-tight drop-shadow-md group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.8)] transition-all duration-300">{location.name}</h3>
                </div>

                <div className="space-y-3 text-sm text-white font-medium group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">📍</span>
                    <span className="truncate">{location.address}</span>
                  </div>
                  <div className="pl-8 text-white/70 text-xs italic font-light">
                    {location.city}{location.state ? `, ${location.state}` : ''} {location.zipCode}
                  </div>

                  {location.capacity && (
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-lg">👥</span>
                      <span className="tracking-wide">Capacity: {location.capacity}</span>
                    </div>
                  )}

                  {location.phone && <div className="text-xs opacity-60 flex items-center gap-3 mt-2"><span className="text-lg opacity-100">📞</span> {location.phone}</div>}
                </div>


              </div>
            </div>
          )
        })}
      </div>

      {locations.length === 0 && !loading && (
        <div className="text-center py-24 bg-[#442D1C] rounded-3xl shadow-2xl relative overflow-hidden border border-white/5">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-50" />
          <div className="relative z-10">
            <div className="text-6xl mb-6 opacity-20">📍</div>
            <p className="text-white text-2xl font-thin font-outfit tracking-wider mb-2">No locations found</p>
            <p className="text-white/40 text-sm italic font-light">Add your first location to get started!</p>
          </div>
        </div>
      )}
    </div>
  )
}



