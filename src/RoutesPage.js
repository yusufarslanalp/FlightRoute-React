import React, { useState, useEffect } from 'react';
import apiClient from './apiClient';
import { FaMapMarkedAlt } from 'react-icons/fa'; // Map icon

const RoutesPage = () => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [flightRoutes, setFlightRoutes] = useState([]);
  const [expandedFlightRouteId, setExpandedFlightRouteId] = useState(null);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    apiClient
      .get('/location')
      .then((response) => setLocations(response.data))
      .catch((error) => console.error('Error fetching locations:', error));
  }, []);

  const handleSearch = () => {
    apiClient
      .get(`/route?fromId=${origin}&toId=${destination}`)
      .then((response) => setFlightRoutes(response.data))
      .catch((error) => {
        console.error('Error fetching routes:', error);
        setFlightRoutes([]);
      });
  };

  const handleFlightRouteClick = (flightRouteId) => {
    setExpandedFlightRouteId((prev) => (prev === flightRouteId ? null : flightRouteId));
  };

  const handleMapClick = (flightRoute) => {
    // Build ordered stop list: first transportation's `from`, then every `to`
    const stops = [];
    flightRoute.transportations.forEach((t, i) => {
      if (i === 0) stops.push(t.from?.name || '');
      stops.push(t.to?.name || '');
    });
  
    // Transport type per leg (index i = leg from stops[i] → stops[i+1])
    const legTypes = flightRoute.transportations.map((t) => t.type || '');
  
    const popup = window.open('', 'RouteMap', 'width=900,height=650');
    if (!popup) return;
  
    const inputsHtml = stops
      .map(
        (name, i) =>
          `<div style="display:flex;align-items:center;margin:4px 0;">
            <span style="width:24px;font-weight:bold;color:#555;">${String.fromCharCode(65 + i)}</span>
            <input id="stop_${i}" value="${name}" placeholder="Location ${String.fromCharCode(65 + i)}"
              style="padding:8px;margin:0 5px;width:220px;border:1px solid #ccc;border-radius:4px;" />
          </div>`
      )
      .join('');
  
    popup.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Route Map</title>
        <style>
          #map { height: 460px; width: 100%; margin-top: 12px; border-radius: 8px; }
          body { font-family: Arial; padding: 16px; background: #f5f5f5; }
          h2 { margin: 0 0 12px; font-size: 16px; color: #333; }
          button { padding: 8px 18px; background: #2196F3; color: #fff; border: none;
                   border-radius: 4px; cursor: pointer; margin-top: 8px; font-size: 14px; }
          button:hover { background: #1976D2; }
        </style>
      </head>
      <body>
        <h2>Route Map (${stops.length} stops)</h2>
        ${inputsHtml}
        <div id="map"></div>
  
        <script>
          const STOP_COUNT = ${stops.length};
          const LEG_TYPES = ${JSON.stringify(legTypes)};
          let map, geocoder;
          const drawnPolylines = [];
          const drawnMarkers = [];
  
          window.initMap = function () {
            map = new google.maps.Map(document.getElementById('map'), {
              center: { lat: 41.0082, lng: 28.9784 },
              zoom: 4,
            });
            geocoder = new google.maps.Geocoder();
            calculateRoute();
          };
  
          function clearMap() {
            drawnPolylines.forEach(p => p.setMap(null));
            drawnPolylines.length = 0;
            drawnMarkers.forEach(m => m.setMap(null));
            drawnMarkers.length = 0;
          }
  
          function getStopValues() {
            const vals = [];
            for (let i = 0; i < STOP_COUNT; i++) {
              vals.push(document.getElementById('stop_' + i).value.trim());
            }
            return vals;
          }
  
          function geocodeAddress(address) {
            return new Promise((resolve, reject) => {
              geocoder.geocode({ address }, (results, status) => {
                if (status === 'OK') resolve(results[0].geometry.location);
                else reject(new Error('Could not find: ' + address + ' (' + status + ')'));
              });
            });
          }
  
          function isFlightLeg(type) {
            return type && type.toUpperCase().includes('FLIGHT');
          }
  
          function drawLeg(from, to, type) {
            const flight = isFlightLeg(type);
            const path = flight
              ? [from, { lat: (from.lat() + to.lat()) / 2 + 4, lng: (from.lng() + to.lng()) / 2 }, to]
              : [from, to];
            const poly = new google.maps.Polyline({
              path,
              geodesic: true,
              strokeColor: flight ? '#E53935' : '#1E88E5',
              strokeOpacity: 0.85,
              strokeWeight: flight ? 2 : 4,
              icons: [{ icon: { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 3 }, offset: '100%' }],
            });
            poly.setMap(map);
            drawnPolylines.push(poly);
          }
  
          function placeMarker(latLng, label) {
            const marker = new google.maps.Marker({
              position: latLng,
              map,
              label: { text: label, color: '#fff', fontWeight: 'bold' },
              title: label,
            });
            drawnMarkers.push(marker);
          }
  
          async function calculateRoute() {
            clearMap();
            const stopValues = getStopValues();
            if (stopValues.some(v => !v)) { alert('Please fill in all location fields.'); return; }
  
            try {
              const latLngs = await Promise.all(stopValues.map(geocodeAddress));
              const bounds = new google.maps.LatLngBounds();
  
              latLngs.forEach((ll, i) => {
                bounds.extend(ll);
                placeMarker(ll, String.fromCharCode(65 + i));
              });
  
              for (let i = 0; i < latLngs.length - 1; i++) {
                drawLeg(latLngs[i], latLngs[i + 1], LEG_TYPES[i]);
              }
  
              map.fitBounds(bounds);
            } catch (err) {
              alert(err.message);
            }
          }
  
          window.onload = calculateRoute;
        </script>
  
        <script async
          src="https://maps.googleapis.com/maps/api/js?key=API_KEY&libraries=geometry&callback=initMap">
        </script>
      </body>
      </html>
    `);
  
    popup.document.close();
  };

  return (
    <div style={{ margin: '20px' }}>
      <h3>Search for Routes</h3>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
        <label htmlFor="origin" style={{ marginRight: '10px' }}>Origin</label>
        <select id="origin" value={origin} onChange={(e) => setOrigin(e.target.value)}
          style={{ padding: '5px', marginRight: '20px' }}>
          <option value="">Select Origin</option>
          {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
        </select>

        <label htmlFor="destination" style={{ marginRight: '10px' }}>Destination</label>
        <select id="destination" value={destination} onChange={(e) => setDestination(e.target.value)}
          style={{ padding: '5px', marginRight: '20px' }}>
          <option value="">Select Destination</option>
          {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
        </select>

        <button onClick={handleSearch} style={{
          padding: '5px 15px', backgroundColor: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer'
        }}>Search</button>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h4>Flight Routes</h4>
        {flightRoutes.length === 0 && <div>No flight routes available</div>}
        {flightRoutes.map(flightRoute => (
          Array.isArray(flightRoute.transportations) && flightRoute.transportations.length > 0 && (
            <div key={flightRoute.id} style={{ marginBottom: '10px', width: '800px' }}>
              <div onClick={() => handleFlightRouteClick(flightRoute.id)} style={{
                padding: '10px', border: '1px solid #ddd', borderRadius: '5px', cursor: 'pointer',
                backgroundColor: '#f9f9f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div>
                  {flightRoute.transportations[flightRoute.flightIndex].from.name} &nbsp;&nbsp;&nbsp;
                  {flightRoute.transportations[flightRoute.flightIndex].from.locationCode}
                </div>
                <div style={{
                  fontSize: '18px',
                  transition: 'transform 0.2s',
                  transform: expandedFlightRouteId === flightRoute.id ? 'rotate(90deg)' : 'rotate(0deg)'
                }}>▶</div>
              </div>

              {expandedFlightRouteId === flightRoute.id && (
                <div style={{
                  marginTop: '10px', padding: '10px', backgroundColor: '#f1f1f1',
                  border: '1px solid #ddd', borderRadius: '5px', display: 'flex', flexDirection: 'column'
                }}>
                  <strong>Flight Route Details:</strong>
                  <p>O {flightRoute.transportations[0].from.name}</p>
                  <p>|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{flightRoute.transportations[0].type}</p>
                  <p>O {flightRoute.transportations[0].to.name}</p>

                  {flightRoute.transportations.length > 1 && <>
                    <p>|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{flightRoute.transportations[1].type}</p>
                    <p>O {flightRoute.transportations[1].to.name}</p>
                  </>}

                  {flightRoute.transportations.length > 2 && <>
                    <p>|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{flightRoute.transportations[2].type}</p>
                    <p>O {flightRoute.transportations[2].to.name}</p>
                  </>}

                  <button onClick={() => handleMapClick(flightRoute)} style={{
                    marginTop: '10px', padding: '8px 12px', backgroundColor: '#2196F3',
                    color: 'white', border: 'none', borderRadius: '5px', display: 'flex',
                    alignItems: 'center', cursor: 'pointer'
                  }}>
                    <FaMapMarkedAlt style={{ marginRight: '5px' }} /> View on Map
                  </button>
                </div>
              )}
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default RoutesPage;