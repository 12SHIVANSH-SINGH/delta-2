const evtSource = new EventSource('http://localhost:8000/traffic_feed');
evtSource.onopen = () => document.getElementById('status').innerText = 'Live';
evtSource.onerror = () => document.getElementById('status').innerText = 'Disconnected';
evtSource.onmessage = e => {
  const { lanes, signal_times, timestamp } = JSON.parse(e.data);
  const container = document.getElementById('lanes');
  container.innerHTML = '';
  for (let lane in lanes) {
    const div = document.createElement('div');
    div.className = 'lane';
    div.innerHTML = `<strong>${lane}</strong>: ${lanes[lane].count} vehicles ` +
                    `(Green: ${signal_times[lane]}s)`;
    container.appendChild(div);
  }
  document.getElementById('status').innerText = `Updated: ${timestamp}`;
};