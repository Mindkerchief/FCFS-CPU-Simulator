let currentProcesses = [];

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('add-btn').addEventListener('click', async () => {
    const arrival = document.getElementById('arrival-time').value;
    const burst = document.getElementById('burst-time').value;

    try {
      const res = await fetch('/add', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ arrival_time: arrival, burst_time: burst })
      });
      if (!res.ok) throw await res.json();
      const processes = await res.json();
      renderTable(processes);
      clearFormAndAverages();
    } catch (err) {
      alert(err.error || 'Invalid input');
    }
  });

  document.getElementById('start-btn').addEventListener('click', async () => {
    const res = await fetch('/compute');
    const data = await res.json();
    renderTable(data.processes, true);
    document.getElementById('avg-tat').textContent = data.average_tat.toFixed(2);
    document.getElementById('avg-wait').textContent = data.average_wait.toFixed(2);
  });

  document.getElementById('clear-btn').addEventListener('click', async () => {
    await fetch('/clear', { method: 'POST' });
    renderTable([]);
    document.getElementById('avg-tat').textContent = '';
    document.getElementById('avg-wait').textContent = '';
  });
});

function clearFormAndAverages() {
  document.getElementById('arrival-time').value = '';
  document.getElementById('burst-time').value = '';
  document.getElementById('avg-tat').textContent = '';
  document.getElementById('avg-wait').textContent = '';
}

function sortTable(key) {
  const sorted = [...currentProcesses].sort((a, b) => a[key] - b[key]);
  const computed = sorted.some(p => 'completion_time' in p);
  renderTable(sorted, computed);
}

function renderTable(processes, computed = false) {
  currentProcesses = [...processes];
  const tbody = document.querySelector('#process-table tbody');
  tbody.innerHTML = '';
  processes.forEach(p => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="border px-4 py-2">${p.pid}</td>
      <td class="border px-4 py-2">${p.arrival_time}</td>
      <td class="border px-4 py-2">${p.burst_time}</td>
      <td class="border px-4 py-2">${computed ? p.completion_time : ''}</td>
      <td class="border px-4 py-2">${computed ? p.turnaround_time : ''}</td>
      <td class="border px-4 py-2">${computed ? p.waiting_time : ''}</td>
    `;
    tbody.appendChild(row);
  });
}
