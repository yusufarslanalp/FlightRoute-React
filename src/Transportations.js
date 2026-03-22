import React, { useEffect, useState } from 'react';
import apiClient from './apiClient';

const Transportations = () => {
  const [locations, setLocations] = useState([]);
  const [fromId, setFromId] = useState(null);
  const [toId, setToId] = useState(null);
  const [type, setType] = useState('');
  const [transportations, setTransportations] = useState([]);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTransportation, setEditTransportation] = useState(null);

  const ALL_DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

  const [selectedDays, setSelectedDays] = useState({
    MONDAY: true,
    TUESDAY: true,
    WEDNESDAY: true,
    THURSDAY: true,
    FRIDAY: true,
    SATURDAY: true,
    SUNDAY: true,
  });

  useEffect(() => {
    apiClient.get('/location')
      .then((response) => setLocations(response.data))
      .catch((error) => console.error('Error fetching locations:', error));

    apiClient.get('/transportation')
      .then((response) => setTransportations(response.data))
      .catch((error) => console.error('Error fetching transportations:', error));
  }, []);

  const handleCreate = () => {
    const selectedDaysList = Object.keys(selectedDays).filter((day) => selectedDays[day]);
    const transportationData = { fromId, toId, type, days: selectedDaysList };
    
    apiClient.post('/transportation', transportationData)
      .then((response) => {
        setTransportations([...transportations, response.data]);
      })
      .catch((error) => console.error('Error creating transportation:', error));
  };

  const handleEdit = (id) => {
    const transportationToEdit = transportations.find((t) => t.id === id);
    setEditTransportation(transportationToEdit);
    setType(transportationToEdit.type);

    const daysMap = {
      MONDAY: false, TUESDAY: false, WEDNESDAY: false, THURSDAY: false,
      FRIDAY: false, SATURDAY: false, SUNDAY: false,
    };
    transportationToEdit.days.forEach((day) => { daysMap[day] = true; });
    setSelectedDays(daysMap);

    setIsEditModalOpen(true);
  };

  const handleUpdate = () => {
    const selectedDaysList = Object.keys(selectedDays).filter((day) => selectedDays[day]);
    const updatedData = { type, days: selectedDaysList };

    apiClient.put(`/transportation/${editTransportation.id}`, updatedData)
      .then((response) => {
        setTransportations(transportations.map((t) =>
          t.id === editTransportation.id ? { ...t, ...response.data } : t
        ));
        setIsEditModalOpen(false);
      })
      .catch((error) => console.error('Error updating transportation:', error));
  };

  const handleCancel = () => {
    setIsEditModalOpen(false);
  };

  const handleDelete = (id) => {
    apiClient.delete(`/transportation/${id}`)
      .then(() => {
        setTransportations(transportations.filter((transportation) => transportation.id !== id));
      })
      .catch((error) => console.error('Error deleting transportation:', error));
  };

  const handleCheckboxChange = (day) => {
    setSelectedDays(prevState => ({
      ...prevState,
      [day]: !prevState[day],
    }));
  };

  return (
    <div style={{ margin: '20px' }}>
      <h3>Transportation Creation</h3>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <label htmlFor="from" style={{ marginRight: '10px' }}>From</label>
        <select
          id="from"
          value={fromId || ''}
          onChange={(e) => setFromId(Number(e.target.value))}
          style={{ padding: '5px', marginRight: '20px' }}
        >
          <option value="">Select Location</option>
          {locations.map((location) => (
            <option key={location.id} value={location.id}>{location.name}</option>
          ))}
        </select>

        <label htmlFor="to" style={{ marginRight: '10px' }}>To</label>
        <select
          id="to"
          value={toId || ''}
          onChange={(e) => setToId(Number(e.target.value))}
          style={{ padding: '5px', marginRight: '20px' }}
        >
          <option value="">Select Location</option>
          {locations.map((location) => (
            <option key={location.id} value={location.id}>{location.name}</option>
          ))}
        </select>

        <label htmlFor="type" style={{ marginRight: '10px' }}>Type</label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={{ padding: '5px', marginRight: '20px' }}
        >
          <option value="">Select Type</option>
          <option value="FLIGHT">Flight</option>
          <option value="BUS">Bus</option>
          <option value="SUBWAY">Subway</option>
          <option value="UBER">Uber</option>
        </select>
      </div>

      {/* Checkbox row for days of the week */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        {ALL_DAYS.map((day) => (
          <div key={day} style={{ marginRight: '15px' }}>
            <input
              type="checkbox"
              id={day}
              checked={selectedDays[day]}
              onChange={() => handleCheckboxChange(day)}
            />
            <label htmlFor={day} style={{ marginLeft: '5px' }}>{day.slice(0, 3)}</label>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '20px' }}>
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
      </div>

      <h3 style={{ marginTop: '40px' }}>Existing Transportations</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>From</th>
            <th>To</th>
            <th>Type</th>
            <th>Days</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {transportations.map((transportation) => (
            <tr key={transportation.id}>
              <td>{transportation.id}</td>
              <td>{transportation.from}</td>
              <td>{transportation.to}</td>
              <td>{transportation.type}</td>
              <td>{transportation.days.map((d) => d.slice(0, 3)).join(', ')}</td>
              <td>
                <button
                  onClick={() => handleEdit(transportation.id)}
                  style={{ marginRight: '10px', cursor: 'pointer' }}
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(transportation.id)}
                  style={{ cursor: 'pointer' }}
                >
                  🗑️ Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isEditModalOpen && (
        <div style={{ position: 'fixed', top: '0', left: '0', right: '0', bottom: '0', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '5px', minWidth: '360px' }}>
            <h3>Edit Transportation</h3>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label htmlFor="edit-from">From</label>
              <input
                id="edit-from"
                value={editTransportation ? editTransportation.from : ''}
                readOnly
                style={{ padding: '5px', marginBottom: '10px', backgroundColor: '#f0f0f0' }}
              />

              <label htmlFor="edit-to">To</label>
              <input
                id="edit-to"
                value={editTransportation ? editTransportation.to : ''}
                readOnly
                style={{ padding: '5px', marginBottom: '10px', backgroundColor: '#f0f0f0' }}
              />

              <label htmlFor="edit-type">Type</label>
              <select
                id="edit-type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                style={{ padding: '5px', marginBottom: '15px' }}
              >
                <option value="">Select Type</option>
                <option value="FLIGHT">Flight</option>
                <option value="BUS">Bus</option>
                <option value="SUBWAY">Subway</option>
                <option value="UBER">Uber</option>
              </select>

              <label style={{ marginBottom: '8px' }}>Days</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
                {ALL_DAYS.map((day) => (
                  <div key={day} style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      id={`edit-${day}`}
                      checked={selectedDays[day]}
                      onChange={() => handleCheckboxChange(day)}
                    />
                    <label htmlFor={`edit-${day}`} style={{ marginLeft: '5px' }}>{day.slice(0, 3)}</label>
                  </div>
                ))}
              </div>

              <div>
                <button
                  onClick={handleUpdate}
                  style={{ padding: '5px 15px', backgroundColor: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                  Update
                </button>
                <button
                  onClick={handleCancel}
                  style={{ padding: '5px 15px', marginLeft: '10px', backgroundColor: '#f44336', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transportations;
