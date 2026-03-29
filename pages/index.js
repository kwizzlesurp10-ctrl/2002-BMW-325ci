import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  const [tab, setTab] = useState('history');
  const [history, setHistory] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [intervals, setIntervals] = useState([]);
  const [mileage, setMileage] = useState(150000);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/intervals')
      .then((r) => r.json())
      .then(setIntervals);
    fetchHistory();
  }, []);

  useEffect(() => {
    if (tab === 'upcoming') fetchUpcoming();
  }, [tab, mileage]);

  function fetchHistory() {
    fetch('/api/history')
      .then((r) => r.json())
      .then(setHistory);
  }

  function fetchUpcoming() {
    setLoading(true);
    fetch(`/api/upcoming?mileage=${mileage}`)
      .then((r) => r.json())
      .then((data) => {
        setUpcoming(data);
        setLoading(false);
      });
  }

  function addRecord(e) {
    e.preventDefault();
    const form = e.target;
    const data = {
      serviceId: form.serviceId.value,
      serviceName: form.serviceName.value,
      mileage: parseInt(form.mileage.value, 10),
      date: form.date.value,
      notes: form.notes.value,
    };
    fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then((r) => r.json())
      .then(() => {
        fetchHistory();
        form.reset();
        alert('Record added!');
      });
  }

  return (
    <>
      <Head>
        <title>2002 BMW 325ci Maintenance Tracker</title>
        <meta name="description" content="Track BMW E46 maintenance history and upcoming services" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='0.9em' font-size='90'>🔧</text></svg>" />
      </Head>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 20, fontFamily: 'system-ui, sans-serif' }}>
        <h1 style={{ textAlign: 'center', margin: '20px 0' }}>🔧 2002 BMW 325ci Maintenance Tracker</h1>
        
        <div style={{ display: 'flex', gap: 10, borderBottom: '2px solid #ddd', marginBottom: 20 }}>
          <button
            onClick={() => setTab('history')}
            style={{
              padding: '10px 20px',
              border: 'none',
              background: tab === 'history' ? '#007bff' : 'transparent',
              color: tab === 'history' ? 'white' : '#333',
              cursor: 'pointer',
              fontWeight: 'bold',
              borderRadius: '5px 5px 0 0',
            }}
          >
            Service History
          </button>
          <button
            onClick={() => setTab('upcoming')}
            style={{
              padding: '10px 20px',
              border: 'none',
              background: tab === 'upcoming' ? '#007bff' : 'transparent',
              color: tab === 'upcoming' ? 'white' : '#333',
              cursor: 'pointer',
              fontWeight: 'bold',
              borderRadius: '5px 5px 0 0',
            }}
          >
            Upcoming Services
          </button>
          <button
            onClick={() => setTab('add')}
            style={{
              padding: '10px 20px',
              border: 'none',
              background: tab === 'add' ? '#28a745' : 'transparent',
              color: tab === 'add' ? 'white' : '#333',
              cursor: 'pointer',
              fontWeight: 'bold',
              borderRadius: '5px 5px 0 0',
            }}
          >
            + Add Record
          </button>
        </div>

        {tab === 'history' && (
          <div>
            <h2>Service History</h2>
            {history.length === 0 ? (
              <p>No records yet. Add your first service record!</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                    <th style={{ padding: 10, textAlign: 'left' }}>Date</th>
                    <th style={{ padding: 10, textAlign: 'left' }}>Mileage</th>
                    <th style={{ padding: 10, textAlign: 'left' }}>Service</th>
                    <th style={{ padding: 10, textAlign: 'left' }}>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((r) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                      <td style={{ padding: 10 }}>{r.date}</td>
                      <td style={{ padding: 10 }}>{r.mileage.toLocaleString()} mi</td>
                      <td style={{ padding: 10, fontWeight: 'bold' }}>{r.serviceName}</td>
                      <td style={{ padding: 10, fontSize: '0.9em', color: '#666' }}>{r.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === 'upcoming' && (
          <div>
            <h2>Upcoming Services</h2>
            <label style={{ display: 'block', marginBottom: 15 }}>
              <strong>Current Mileage:</strong>
              <input
                type="number"
                value={mileage}
                onChange={(e) => setMileage(parseInt(e.target.value, 10) || 0)}
                style={{ marginLeft: 10, padding: 5, width: 120 }}
              />
            </label>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                    <th style={{ padding: 10, textAlign: 'left' }}>Service</th>
                    <th style={{ padding: 10, textAlign: 'left' }}>Last Done</th>
                    <th style={{ padding: 10, textAlign: 'left' }}>Miles Until Due</th>
                    <th style={{ padding: 10, textAlign: 'left' }}>Days Until Due</th>
                    <th style={{ padding: 10, textAlign: 'left' }}>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {upcoming.map((s) => (
                    <tr
                      key={s.serviceId}
                      style={{
                        borderBottom: '1px solid #dee2e6',
                        background: s.overdue ? '#ffe6e6' : s.dueSoon ? '#fff4e6' : 'white',
                      }}
                    >
                      <td style={{ padding: 10, fontWeight: 'bold' }}>
                        {s.serviceName}
                        {s.overdue && <span style={{ color: 'red', marginLeft: 5 }}>[OVERDUE]</span>}
                        {s.dueSoon && !s.overdue && <span style={{ color: 'orange', marginLeft: 5 }}>[DUE SOON]</span>}
                      </td>
                      <td style={{ padding: 10 }}>{s.lastServiceDate || 'Never'}</td>
                      <td style={{ padding: 10 }}>
                        {s.milesUntilDue !== null
                          ? s.milesUntilDue <= 0
                            ? `OVERDUE by ${Math.abs(s.milesUntilDue).toLocaleString()} mi`
                            : `${s.milesUntilDue.toLocaleString()} mi`
                          : '—'}
                      </td>
                      <td style={{ padding: 10 }}>
                        {s.daysUntilDue !== null
                          ? s.daysUntilDue <= 0
                            ? `OVERDUE by ${Math.abs(s.daysUntilDue)} days`
                            : `${s.daysUntilDue} days`
                          : '—'}
                      </td>
                      <td style={{ padding: 10, fontSize: '0.85em', color: '#666' }}>{s.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === 'add' && (
          <div>
            <h2>Add Maintenance Record</h2>
            <form onSubmit={addRecord} style={{ maxWidth: 600 }}>
              <label style={{ display: 'block', marginBottom: 15 }}>
                <strong>Service Type:</strong>
                <select name="serviceId" required style={{ display: 'block', width: '100%', padding: 8, marginTop: 5 }}>
                  <option value="">Select a service...</option>
                  {intervals.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                  <option value="custom">Custom Service</option>
                </select>
              </label>
              <label style={{ display: 'block', marginBottom: 15 }}>
                <strong>Service Name (if custom):</strong>
                <input name="serviceName" type="text" style={{ display: 'block', width: '100%', padding: 8, marginTop: 5 }} />
              </label>
              <label style={{ display: 'block', marginBottom: 15 }}>
                <strong>Mileage:</strong>
                <input name="mileage" type="number" required style={{ display: 'block', width: '100%', padding: 8, marginTop: 5 }} />
              </label>
              <label style={{ display: 'block', marginBottom: 15 }}>
                <strong>Date (YYYY-MM-DD):</strong>
                <input name="date" type="date" required style={{ display: 'block', width: '100%', padding: 8, marginTop: 5 }} />
              </label>
              <label style={{ display: 'block', marginBottom: 15 }}>
                <strong>Notes (optional):</strong>
                <textarea name="notes" rows={3} style={{ display: 'block', width: '100%', padding: 8, marginTop: 5 }} />
              </label>
              <button type="submit" style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer' }}>
                Add Record
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
