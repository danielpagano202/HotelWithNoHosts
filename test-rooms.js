// Test script to check rooms API
fetch('http://localhost:5177/api/rooms')
  .then(res => res.json())
  .then(data => console.log('Rooms:', data))
  .catch(err => console.error('Error:', err));