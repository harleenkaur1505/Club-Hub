import React, { useEffect, useState } from 'react'
import { locationsAPI } from '../services/membershipAPI'
import { Link } from 'react-router-dom'

export default function Locations() {
  const [locations, setLocations] = useState([])
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
    notes: ''
  })

  useEffect(() => {
    loadLocations()
  }, [])

  const loadLocations = async () => {
    try {
      const { data } = await locationsAPI.list()
      setLocations(data.locations || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        amenities: formData.amenities ? formData.amenities.split(',').map(a => a.trim()) : []
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
        notes: ''
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

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold gradient-text">Locations</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #800020 0%, #A0002A 50%, #C9A961 100%)' }}
        >
          {showForm ? 'Cancel' : '+ Add Location'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6 slide-in-up">
          <h3 className="text-xl font-semibold mb-4">Add New Location</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Location Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Capacity</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-primary-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Address *</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-primary-500"
              />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">City *</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Zip Code</label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-primary-500"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-primary-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Amenities (comma-separated)</label>
              <input
                type="text"
                placeholder="WiFi, Parking, Kitchen, etc."
                value={formData.amenities}
                onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows="3"
                className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-primary-500"
              />
            </div>
            <button
              type="submit"
              className="w-full text-white p-3 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
              style={{ background: 'linear-gradient(135deg, #800020 0%, #A0002A 50%, #C9A961 100%)' }}
            >
              Create Location
            </button>
          </form>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map((location) => (
          <div key={location._id} className="bg-white p-6 rounded-lg shadow-lg slide-in-up hover:shadow-xl transition-all">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold">{location.name}</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                location.isActive 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {location.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p>📍 {location.address}</p>
              <p>{location.city}{location.state ? `, ${location.state}` : ''} {location.zipCode}</p>
              {location.phone && <p>📞 {location.phone}</p>}
              {location.email && <p>✉️ {location.email}</p>}
              {location.capacity && <p>👥 Capacity: {location.capacity}</p>}
              {location.amenities && location.amenities.length > 0 && (
                <p className="mt-2">
                  <span className="font-semibold">Amenities:</span> {location.amenities.join(', ')}
                </p>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => toggleLocationStatus(location._id, location.isActive)}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                  location.isActive
                    ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                {location.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {locations.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-lg">
          <p className="text-gray-500 text-lg">No locations found. Add your first location to get started!</p>
        </div>
      )}
    </div>
  )
}



