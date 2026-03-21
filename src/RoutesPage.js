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
    const start = flightRoute.transportations[0]?.from?.name || '';
    const mid = flightRoute.transportations[0]?.to?.name || '';
    const end =
      flightRoute.transportations[1]?.to?.name ||
      flightRoute.transportations[0]?.to?.name ||
      '';

    const popup = window.open('', 'RouteMap', 'width=900,height=600');
    if (!popup) return;

    popup.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Route Finder: Road + Plane</title>
        <style>
          #map { height: 500px; width: 100%; }
          body { font-family: Arial; padding: 20px; }
          input { padding: 8px; margin: 5px; width: 200px; }
          button { padding: 8px 15px; }
        </style>
      </head>
      <body>
        <h2>Route Finder: A → B (Car) + B → C (Plane)</h2>
        <input id="start" value="${start}" placeholder="Start location (A)">
        <input id="mid" value="${mid}" placeholder="Mid location (B)">
        <input id="end" value="${end}" placeholder="End location (C)">
        <button onclick="calculateRoute()">Go</button>
        <div id="map"></div>

        <script>
          let map;
          let directionsService;
          let directionsRenderer;
          let planeLine;

          window.initMap = function() {
            map = new google.maps.Map(document.getElementById("map"), {
              center: { lat: 41.0082, lng: 28.9784 },
              zoom: 4
            });
            directionsService = new google.maps.DirectionsService();
            directionsRenderer = new google.maps.DirectionsRenderer({ suppressPolylines: false });
            directionsRenderer.setMap(map);
          };

          function drawPlaneRoute(startLatLng, endLatLng) {
            const latMid = (startLatLng.lat() + endLatLng.lat()) / 2 + 5;
            const lngMid = (startLatLng.lng() + endLatLng.lng()) / 2;
            const planePath = new google.maps.Polyline({
              path: [startLatLng, { lat: latMid, lng: lngMid }, endLatLng],
              geodesic: true,
              strokeColor: "#FF0000",
              strokeOpacity: 0.8,
              strokeWeight: 3,
              icons: [{
                icon: { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW },
                offset: '100%'
              }]
            });
            planePath.setMap(map);
            return planePath;
          }

          function calculateRoute() {
            const start = document.getElementById("start").value;
            const mid = document.getElementById("mid").value;
            const end = document.getElementById("end").value;

            if (!start || !mid || !end) { alert("Please enter all three locations!"); return; }

            directionsService.route({ origin: start, destination: mid, travelMode: 'DRIVING' },
              (result, status) => {
                if (status === 'OK') {
                  directionsRenderer.setDirections(result);

                  const geocoder = new google.maps.Geocoder();
                  geocoder.geocode({ address: end }, (endResults, status2) => {
                    if (status2 === 'OK') {
                      const midLatLng = result.routes[0].legs[0].end_location;
                      const endLatLng = endResults[0].geometry.location;
                      if (planeLine) planeLine.setMap(null);
                      planeLine = drawPlaneRoute(midLatLng, endLatLng);

                      const bounds = new google.maps.LatLngBounds();
                      bounds.extend(result.routes[0].legs[0].start_location);
                      bounds.extend(endLatLng);
                      map.fitBounds(bounds);
                    } else { alert('Could not find location C: ' + status2); }
                  });

                } else { alert('Error with driving route: ' + status); }
              });
          }

          // Optional: auto-run the route immediately
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