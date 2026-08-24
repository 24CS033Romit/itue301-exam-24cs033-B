import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/api/v1';

function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState(null);

  const { member, token } = useAuth();

  useEffect(() => {
    fetchMyBookings();
  }, [token]);

  const fetchMyBookings = async () => {
    if (!token) return;

    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/bookings/my`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (res.ok && data.bookings) {
        setBookings(data.bookings);
      } else if (Array.isArray(data)) {
        setBookings(data);
      } else {
        setError(data.message || 'Failed to load bookings.');
      }
    } catch (err) {
      setError('Failed to load bookings. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (id, className) => {
    if (!window.confirm(`Are you sure you want to cancel your booking for "${className}"?`)) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/bookings/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'cancelled'
        })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: `Booking for "${className}" has been cancelled.` });
        setBookings((prev) =>
          prev.map((b) => (b._id === id || b.id === id ? { ...b, status: 'cancelled' } : b))
        );
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to cancel booking.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to cancel booking. Please try again.' });
    }
  };

  const formatDate = (dateVal) => {
    if (!dateVal) return 'Upcoming';
    try {
      const d = new Date(dateVal);
      return isNaN(d.getTime()) ? dateVal : d.toLocaleDateString();
    } catch {
      return dateVal;
    }
  };

  // Calculate booking metrics
  const activeBookingsCount = bookings.filter((b) => b.status === 'booked').length;
  const attendedBookingsCount = bookings.filter((b) => b.status === 'attended').length;
  const cancelledBookingsCount = bookings.filter((b) => b.status === 'cancelled').length;

  return (
    <div className="container">
      {/* Member Dashboard Header */}
      <div className="page-hero">
        <h1 className="page-title">My Fitness Journey</h1>
        <p className="page-subtitle">
          Welcome back, {member?.name || member?.email || 'Member'} 👋 Here are your upcoming and past training sessions.
        </p>
      </div>

      {message && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          <span>{message.type === 'success' ? '✅' : '⚠️'}</span>
          {message.text}
        </div>
      )}

      {/* KPI Metric Summary Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">Active Bookings</span>
          <span className="kpi-value" style={{ color: '#2563eb' }}>
            {activeBookingsCount}
          </span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Attended Classes</span>
          <span className="kpi-value" style={{ color: '#16a34a' }}>
            {attendedBookingsCount}
          </span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Cancelled Sessions</span>
          <span className="kpi-value" style={{ color: '#64748b' }}>
            {cancelledBookingsCount}
          </span>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="empty-state-box">
          <span className="empty-state-icon">⏳</span>
          <h3 className="empty-state-title">Loading your bookings...</h3>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="empty-state-box">
          <span className="empty-state-icon">⚠️</span>
          <h3 className="empty-state-title">Unable to Load Bookings</h3>
          <p className="empty-state-text">{error}</p>
          <button onClick={fetchMyBookings} className="btn btn-primary btn-sm">
            Try Again 🔄
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && bookings.length === 0 && (
        <div className="empty-state-box">
          <span className="empty-state-icon">🏋️</span>
          <h3 className="empty-state-title">No Bookings Yet</h3>
          <p className="empty-state-text">
            Your next fitness milestone is waiting. Explore our scheduled classes and reserve a spot with your favorite coach.
          </p>
          <Link to="/classes" className="btn btn-primary btn-md">
            Explore & Book Classes →
          </Link>
        </div>
      )}

      {/* Bookings Table */}
      {!loading && !error && bookings.length > 0 && (
        <div className="section">
          <div className="section-header">
            <div>
              <h2 className="section-title">Reserved Sessions ({bookings.length})</h2>
              <p className="section-subtitle">Manage, view details, and track your scheduled workout classes</p>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Class Name</th>
                  <th>Trainer</th>
                  <th>Specialization</th>
                  <th>Date</th>
                  <th>Time Slot</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => {
                  const bookingId = b._id || b.id;
                  const trainerName = b.trainerId?.name || b.trainer || 'Assigned Coach';
                  const trainerSpec = b.trainerId?.specialization || b.trainerSpecialization || 'General Fitness';
                  const isCancelled = b.status === 'cancelled';
                  const isAttended = b.status === 'attended';

                  return (
                    <tr key={bookingId}>
                      <td>
                        <strong style={{ color: '#0f172a', fontSize: '14.5px' }}>{b.className}</strong>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{trainerName}</span>
                      </td>
                      <td>
                        <span style={{ color: '#64748b', fontSize: '13px' }}>{trainerSpec}</span>
                      </td>
                      <td>{formatDate(b.date)}</td>
                      <td>{b.timeSlot || b.time}</td>
                      <td>
                        <span
                          className={`badge ${
                            isCancelled
                              ? 'badge-full'
                              : isAttended
                              ? 'badge-open'
                              : 'badge-open'
                          }`}
                        >
                          ● {b.status || 'booked'}
                        </span>
                      </td>
                      <td>
                        {isCancelled ? (
                          <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>Cancelled</span>
                        ) : (
                          <button
                            onClick={() => handleCancelBooking(bookingId, b.className)}
                            className="btn btn-danger btn-sm"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyBookingsPage;
