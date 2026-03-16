import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Locations = () => {
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [locationCode, setLocationCode] = useState('');
  const [locations, setLocations] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    axios
      .get('http://localhost:8080/location')
      .then((response) => {
        setLocations(response.data);
      })
      .catch((error) => {
        console.error('Error fetching locations:', error);
      });
  }, []);

  const handleCreate = () => {
    const newLocation = {
      name,
      country,
      city,
      locationCode,
    };

    axios
      .post('http://localhost:8080/location', newLocation)
      .then((response) => {
        console.log('Location created successfully:', response.data);
        setLocations([...locations, response.data]);
        setName('');
        setCountry('');
        setCity('');
        setLocationCode('');
      })
      .catch((error) => {
        console.error('Error creating location:', error);
      });
  };

  const handleEdit = (id) => {
    const locationToEdit = locations.find((location) => location.id === id);
    setSelectedLocation(locationToEdit);
    setName(locationToEdit.name);
    setCountry(locationToEdit.country);
    setCity(locationToEdit.city);
    setLocationCode(locationToEdit.locationCode);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    axios
      .delete(`http://localhost:8080/location/${id}`)
      .then((response) => {
        console.log('Location deleted:', response.data);
        setLocations(locations.filter((location) => location.id !== id));
      })
      .catch((error) => {
        console.error('Error deleting location:', error);
      });
  };

  const handleUpdate = () => {
    const updatedLocation = {
      id: selectedLocation.id,
      name,
      country,
      city,
      locationCode,
    };

    axios
      .put('http://localhost:8080/location', updatedLocation)
      .then((response) => {
        console.log('Location updated successfully:', response.data);
        setLocations(
          locations.map((location) =>
            location.id === selectedLocation.id ? response.data : location
          )
        );
        closeModal();
      })
      .catch((error) => {
        console.error('Error updating location:', error);
      });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedLocation(null);
    setName('');
    setCountry('');
    setCity('');
    setLocationCode('');
  };

  return (
    <div style={{ margin: '20px' }}>
      <h3>Create New Location</h3>

      <div style={{ display: 'flex', marginBottom: '20px' }}>
        <div style={{ marginRight: '20px', width: '200px' }}>
          <label htmlFor="name" style={{ display: 'block', width: '100%' }}>
            Name:
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ padding: '5px', width: '100%' }}
          />
        </div>

        <div style={{ width: '200px' }}>
          <label htmlFor="country" style={{ display: 'block', width: '100%' }}>
            Country:
          </label>
          <input
            type="text"
            id="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            style={{ padding: '5px', width: '100%' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', marginBottom: '20px' }}>
        <div style={{ marginRight: '20px', width: '200px' }}>
          <label htmlFor="city" style={{ display: 'block', width: '100%' }}>
            City:
          </label>
          <input
            type="text"
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            style={{ padding: '5px', width: '100%' }}
          />
        </div>

        <div style={{ width: '200px' }}>
          <label htmlFor="locationCode" style={{ display: 'block', width: '100%' }}>
            Location Code:
          </label>
          <input
            type="text"
            id="locationCode"
            value={locationCode}
            onChange={(e) => setLocationCode(e.target.value)}
            style={{ padding: '5px', width: '100%' }}
          />
        </div>
      </div>

      <button
        onClick={handleCreate}
        style={{
          padding: '5px 15px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        Create
      </button>

      <h3 style={{ marginTop: '40px' }}>Existing Locations</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>City</th>
            <th>Country</th>
            <th>Location Code</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {locations.map((location) => (
            <tr key={location.id}>
              <td>{location.id}</td>
              <td>{location.name}</td>
              <td>{location.city}</td>
              <td>{location.country}</td>
              <td>{location.locationCode}</td>
              <td>
                <button
                  onClick={() => handleEdit(location.id)}
                  style={{ marginRight: '10px', cursor: 'pointer' }}
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(location.id)}
                  style={{ cursor: 'pointer' }}
                >
                  🗑️ Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '5px',
              minWidth: '300px',
              textAlign: 'center',
            }}
          >
            <h3>Edit Location</h3>

            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="modalName">Name:</label>
              <input
                type="text"
                id="modalName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ padding: '5px', width: '100%' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="modalCountry">Country:</label>
              <input
                type="text"
                id="modalCountry"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                style={{ padding: '5px', width: '100%' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="modalCity">City:</label>
              <input
                type="text"
                id="modalCity"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                style={{ padding: '5px', width: '100%' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="modalLocationCode">Location Code:</label>
              <input
                type="text"
                id="modalLocationCode"
                value={locationCode}
                onChange={(e) => setLocationCode(e.target.value)}
                style={{ padding: '5px', width: '100%' }}
              />
            </div>

            <button
              onClick={handleUpdate}
              style={{
                padding: '5px 15px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                marginRight: '10px',
              }}
            >
              Update
            </button>
            <button
              onClick={closeModal}
              style={{
                padding: '5px 15px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Locations;
