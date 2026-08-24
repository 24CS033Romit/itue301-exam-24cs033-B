import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/api/v1';

const DEFAULT_CLASSES = [
  {
    id: 'c-1',
    category: 'Yoga',
    name: 'Morning Yoga Flow',
    trainer: 'Priya Sharma',
    date: '2026-08-25',
    time: '07:00 AM – 08:00 AM',
    days: 'Mon, Wed, Fri',
    capacity: 15,
    bookedCount: 3,
    description: 'Gentle stretching, core balance exercises, and mindfulness for flexibility and vitality.'
  },
  {
    id: 'c-2',
    category: 'HIIT',
    name: 'HIIT Blast',
    trainer: 'Vikram Rathore',
    date: '2026-08-25',
    time: '08:30 AM – 09:15 AM',
    days: 'Mon, Tue, Wed, Thu, Fri',
    capacity: 20,
    bookedCount: 8,
    description: 'High intensity interval training designed for rapid calorie burn and cardiovascular endurance.'
  },
  {
    id: 'c-3',
    category: 'Strength',
    name: 'Strength & Conditioning',
    trainer: 'Amit Patel',
    date: '2026-08-26',
    time: '05:30 PM – 06:30 PM',
    days: 'Tue, Thu, Sat',
    capacity: 12,
    bookedCount: 6,
    description: 'Progressive barbell weightlifting and resistance movements to build lean muscle and power.'
  },
  {
    id: 'c-4',
    category: 'Zumba',
    name: 'Zumba Dance Fitness',
    trainer: 'Sneha Roy',
    date: '2026-08-25',
    time: '06:30 PM – 07:30 PM',
    days: 'Mon, Wed, Fri',
    capacity: 25,
    bookedCount: 12,
    description: 'High-energy dance workout set to upbeat tempo music for full-body aerobic fitness.'
  }
];

function AdminPanel() {
  const [bookings, setBookings] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState(null);

  // Class Management State (Persisted in localStorage for cross-page sync)
  const [classes, setClasses] = useState(() => {
    try {
      const saved = localStorage.getItem('fitzone_scheduled_classes');
      return saved ? JSON.parse(saved) : DEFAULT_CLASSES;
    } catch {
      return DEFAULT_CLASSES;
    }
  });

  // Data-driven time slots configuration
  const timeSlots = [
    '06:00 AM – 07:00 AM',
    '07:00 AM – 08:00 AM',
    '08:00 AM – 09:00 AM',
    '08:30 AM – 09:15 AM',
    '09:00 AM – 10:00 AM',
    '05:00 PM – 06:00 PM',
    '05:30 PM – 06:30 PM',
    '06:00 PM – 07:00 PM',
    '06:30 PM – 07:30 PM',
    '07:00 PM – 08:00 PM',
    '08:00 PM – 09:00 PM'
  ];

  const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const quickClassSuggestions = [
    'Strength Training',
    'Morning Yoga Flow',
    'HIIT Blast',
    'Cardio Kickboxing',
    'CrossFit Circuit',
    'Zumba Dance Fitness'
  ];

  const todayString = new Date().toISOString().split('T')[0];

  // Structured Form States
  const [name, setName] = useState('Strength Training');
  const [selectedTrainerId, setSelectedTrainerId] = useState('');
  const [classDate, setClassDate] = useState(todayString);
  const [time, setTime] = useState('07:00 AM – 08:00 AM');
  const [selectedDays, setSelectedDays] = useState(['Mon', 'Wed', 'Fri']);
  const [capacity, setCapacity] = useState(15);
  const [formErrors, setFormErrors] = useState({});

  const { token } = useAuth();

  // Fetch all bookings and trainers from API
  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch Bookings
      const bookingsRes = await fetch(`${API_URL}/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const bookingsData = await bookingsRes.json();
      if (bookingsRes.ok && bookingsData.bookings) {
        setBookings(bookingsData.bookings);
      } else if (Array.isArray(bookingsData)) {
        setBookings(bookingsData);
      }

      // 2. Fetch Trainers
      const trainersRes = await fetch(`${API_URL}/trainers`);
      const trainersData = await trainersRes.json();
      if (trainersRes.ok && trainersData.trainers) {
        setTrainers(trainersData.trainers);
        if (trainersData.trainers.length > 0) {
          setSelectedTrainerId((prev) => prev || trainersData.trainers[0]._id || trainersData.trainers[0].id);
        }
      }
    } catch (err) {
      setError('Unable to load dashboard data. Please verify server connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  // Sync classes state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('fitzone_scheduled_classes', JSON.stringify(classes));
    } catch (e) {
      console.error('Failed to persist classes to localStorage', e);
    }
  }, [classes]);

  // Handle Day Selection
  const toggleDay = (day) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length === 1) return; // Keep at least one day
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const applyDayPreset = (preset) => {
    if (preset === 'weekdays') {
      setSelectedDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
    } else if (preset === 'weekends') {
      setSelectedDays(['Sat', 'Sun']);
    } else if (preset === 'all') {
      setSelectedDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
    }
  };

  // Handle Stepper Capacity
  const handleCapacityChange = (delta) => {
    const newVal = Math.max(1, Math.min(100, (parseInt(capacity, 10) || 1) + delta));
    setCapacity(newVal);
  };

  // Client-side Validation
  const validateForm = () => {
    const errors = {};
    if (!name || !name.trim()) errors.name = 'Class name is required.';
    if (!classDate) errors.date = 'Please pick a scheduled date.';
    if (!time) errors.time = 'Please select a time slot.';
    if (selectedDays.length === 0) errors.days = 'Select at least one day.';
    if (!capacity || parseInt(capacity, 10) < 1) errors.capacity = 'Capacity must be at least 1 spot.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Class Scheduler
  const handleAddClass = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setMessage({ type: 'error', text: 'Please resolve the highlighted fields before scheduling.' });
      return;
    }

    setSubmitting(true);
    
    // Resolve trainer name
    const activeTrainerId = selectedTrainerId || (trainers.length > 0 ? (trainers[0]._id || trainers[0].id) : null);
    const selectedTrainerObj = trainers.find(
      (t) => (t._id || t.id) === activeTrainerId
    );
    const trainerName = selectedTrainerObj ? selectedTrainerObj.name : 'FitZone Coach';

    const newClass = {
      id: 'c-' + Date.now(),
      category: name.includes('Yoga') ? 'Yoga' : name.includes('HIIT') ? 'HIIT' : name.includes('Zumba') ? 'Zumba' : 'Strength',
      specialization: selectedTrainerObj?.specialization || (name.includes('Yoga') ? 'Yoga' : name.includes('HIIT') ? 'HIIT' : name.includes('Zumba') ? 'Zumba' : 'Strength'),
      name: name.trim(),
      trainer: trainerName,
      date: classDate,
      time,
      days: selectedDays.join(', '),
      capacity: parseInt(capacity, 10),
      bookedCount: 0,
      description: `High energy ${name.trim()} session guided by Coach ${trainerName}.`
    };

    // Update state & persist immediately
    setClasses((prev) => [newClass, ...prev]);
    setMessage({ 
      type: 'success', 
      text: `✓ Class "${name.trim()}" successfully scheduled and added to the roster!` 
    });
    setSubmitting(false);

    // Reset fields for next entry
    setName('HIIT Blast');
    setCapacity(15);
    setFormErrors({});

    // Smooth scroll to the existing classes table
    const tableEl = document.getElementById('manage-classes-section');
    if (tableEl) {
      tableEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleResetForm = () => {
    setName('');
    setClassDate(todayString);
    setSelectedDays(['Mon', 'Wed', 'Fri']);
    setCapacity(15);
    setFormErrors({});
    setMessage(null);
  };

  const handleDeleteClass = (id, className) => {
    setClasses((prev) => prev.filter((c) => c.id !== id));
    setMessage({ type: 'success', text: `Class "${className}" removed from schedule.` });
  };

  // Find selected trainer details for preview
  const currentTrainer = trainers.find((t) => (t._id || t.id) === selectedTrainerId) || trainers[0];

  const formatPreviewDate = (dateStr) => {
    if (!dateStr) return 'Not selected';
    if (dateStr === todayString) return 'Today (' + new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ')';
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // KPIs
  const totalBookingsCount = bookings.length;
  const activeBookingsCount = bookings.filter((b) => b.status === 'booked').length;
  const totalCapacity = classes.reduce((sum, c) => sum + (c.capacity || 0), 0);

  return (
    <div className="container">
      {/* Admin Portal Header */}
      <div className="page-hero">
        <h1 className="page-title">Gym Management Portal</h1>
        <p className="page-subtitle">
          Real-time overview of member class bookings, capacity utilization, and gym schedules
        </p>
      </div>

      {message && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          <span>{message.type === 'success' ? '✅' : '⚠️'}</span>
          {message.text}
        </div>
      )}

      {/* Admin KPI Summary Dashboard Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">Total Reservations</span>
          <span className="kpi-value" style={{ color: '#2563eb' }}>
            {totalBookingsCount}
          </span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Active Booked Members</span>
          <span className="kpi-value" style={{ color: '#16a34a' }}>
            {activeBookingsCount}
          </span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Scheduled Classes</span>
          <span className="kpi-value" style={{ color: '#0f172a' }}>
            {classes.length}
          </span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Total Spot Capacity</span>
          <span className="kpi-value" style={{ color: '#ea580c' }}>
            {totalCapacity}
          </span>
        </div>
      </div>

      {/* Class Bookings Table Section */}
      <div className="section" style={{ marginBottom: '40px' }}>
        <div className="section-header">
          <div>
            <h2 className="section-title">Live Class Bookings ({bookings.length})</h2>
            <p className="section-subtitle">Real-time records from MongoDB collection</p>
          </div>
          <button onClick={fetchDashboardData} className="btn btn-secondary btn-sm">
            Refresh 🔄
          </button>
        </div>

        {loading && (
          <div className="empty-state-box">
            <span className="empty-state-icon">⏳</span>
            <h3 className="empty-state-title">Loading bookings from MongoDB...</h3>
          </div>
        )}

        {!loading && error && (
          <div className="empty-state-box">
            <span className="empty-state-icon">⚠️</span>
            <h3 className="empty-state-title">Failed to Load Bookings</h3>
            <p className="empty-state-text">{error}</p>
            <button onClick={fetchDashboardData} className="btn btn-primary btn-sm">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && bookings.length === 0 && (
          <div className="empty-state-box">
            <span className="empty-state-icon">📋</span>
            <h3 className="empty-state-title">No Bookings Found</h3>
            <p className="empty-state-text">No member has booked a class session yet in MongoDB.</p>
          </div>
        )}

        {!loading && !error && bookings.length > 0 && (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Email</th>
                  <th>Class Name</th>
                  <th>Trainer</th>
                  <th>Date</th>
                  <th>Time Slot</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id || b.id}>
                    <td>
                      <strong style={{ color: '#0f172a', fontWeight: 700 }}>
                        {b.memberId?.name || b.userName || 'Member'}
                      </strong>
                    </td>
                    <td>{b.memberId?.email || b.userEmail || 'N/A'}</td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{b.className}</span>
                    </td>
                    <td>
                      {b.trainerId?.name || b.trainer || 'Assigned Coach'}
                      {b.trainerId?.specialization && (
                        <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>
                          ({b.trainerId.specialization})
                        </span>
                      )}
                    </td>
                    <td>{b.date ? new Date(b.date).toLocaleDateString() : 'N/A'}</td>
                    <td>{b.timeSlot || b.time}</td>
                    <td>
                      <span
                        className={`badge ${
                          b.status === 'booked'
                            ? 'badge-open'
                            : b.status === 'attended'
                            ? 'badge-open'
                            : 'badge-full'
                        }`}
                      >
                        ● {b.status || 'booked'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manage Existing Classes Section */}
      <div id="manage-classes-section" className="section" style={{ marginBottom: '40px' }}>
        <div className="section-header">
          <div>
            <h2 className="section-title">Manage Existing Classes ({classes.length})</h2>
            <p className="section-subtitle">Monitor class enrollment capacity and coach assignments</p>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Class Name</th>
                <th>Instructor</th>
                <th>Time</th>
                <th>Days</th>
                <th>Booked / Capacity</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((cls) => {
                const bookedCount = bookings.filter(
                  (booking) =>
                    booking.className === cls.name && booking.status === 'booked'
                ).length;

                return (
                  <tr key={cls.id}>
                    <td>
                      <strong style={{ color: '#0f172a', fontWeight: 700 }}>{cls.name}</strong>
                    </td>
                    <td>{cls.trainer}</td>
                    <td>{cls.time}</td>
                    <td>{cls.days}</td>
                    <td>
                      <span className="badge badge-open">
                        Booked: {bookedCount || cls.bookedCount || 0} / {cls.capacity}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleDeleteClass(cls.id, cls.name)}
                        className="btn btn-danger btn-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==========================================================================
          UPGRADED: ADD NEW GYM CLASS SCHEDULING FORM WITH LIVE PREVIEW
         ========================================================================== */}
      <div className="section">
        <div className="section-header" style={{ marginBottom: '16px' }}>
          <div>
            <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📅</span> Add New Gym Class
            </h2>
            <p className="section-subtitle">
              Schedule a new workout session for members to discover and book.
            </p>
          </div>
        </div>

        <div className="scheduler-grid">
          {/* Left Form Card */}
          <div className="card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
              Class Information
            </h3>
            <p style={{ fontSize: '13.5px', color: '#64748b', marginBottom: '22px' }}>
              Configure session parameters, trainer assignments, and slot capacities
            </p>

            <form onSubmit={handleAddClass}>
              {/* Row 1: Class Name & Trainer */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '16px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="classNameInput">
                    🏋️ Class Name *
                  </label>
                  <input
                    id="classNameInput"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Strength Training"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  {/* Quick chip suggestions */}
                  <div className="quick-chips-row">
                    {quickClassSuggestions.slice(0, 4).map((suggestion) => (
                      <span
                        key={suggestion}
                        className="quick-tag"
                        onClick={() => setName(suggestion)}
                      >
                        + {suggestion}
                      </span>
                    ))}
                  </div>
                  {formErrors.name && (
                    <div className="field-error-text">⚠ {formErrors.name}</div>
                  )}
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="trainerSelect">
                    👤 Assigned Trainer *
                  </label>
                  <select
                    id="trainerSelect"
                    className="form-select"
                    value={selectedTrainerId}
                    onChange={(e) => setSelectedTrainerId(e.target.value)}
                  >
                    {trainers.length === 0 && (
                      <option value="">FitZone Coach (Default)</option>
                    )}
                    {trainers.map((t) => (
                      <option key={t._id || t.id} value={t._id || t.id}>
                        {t.name} — {t.specialization || 'Fitness'} • {t.available !== false ? 'Available' : 'Fully Booked'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Date & Time Slot Dropdown */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '16px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="classDateInput">
                    📅 Class Date *
                  </label>
                  <input
                    id="classDateInput"
                    type="date"
                    min={todayString}
                    className="form-input"
                    value={classDate}
                    onChange={(e) => setClassDate(e.target.value)}
                    required
                  />
                  {formErrors.date && (
                    <div className="field-error-text">⚠ {formErrors.date}</div>
                  )}
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="timeSlotSelect">
                    🕐 Time Slot *
                  </label>
                  <select
                    id="timeSlotSelect"
                    className="form-select"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                  >
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                  {formErrors.time && (
                    <div className="field-error-text">⚠ {formErrors.time}</div>
                  )}
                </div>
              </div>

              {/* Row 3: Days Multi-select Buttons */}
              <div className="form-group" style={{ marginBottom: '18px' }}>
                <label className="form-label">
                  🗓️ Scheduled Days *
                </label>
                {/* Preset Chips */}
                <div className="preset-chip-group">
                  <button
                    type="button"
                    className="preset-chip"
                    onClick={() => applyDayPreset('weekdays')}
                  >
                    Weekdays (Mon-Fri)
                  </button>
                  <button
                    type="button"
                    className="preset-chip"
                    onClick={() => applyDayPreset('weekends')}
                  >
                    Weekends (Sat-Sun)
                  </button>
                  <button
                    type="button"
                    className="preset-chip"
                    onClick={() => applyDayPreset('all')}
                  >
                    Every Day
                  </button>
                </div>

                {/* Day Buttons */}
                <div className="day-selector-wrap">
                  {allDays.map((day) => {
                    const isSelected = selectedDays.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        className={`day-chip ${isSelected ? 'active' : ''}`}
                        onClick={() => toggleDay(day)}
                      >
                        {isSelected ? `✓ ${day}` : day}
                      </button>
                    );
                  })}
                </div>
                {formErrors.days && (
                  <div className="field-error-text">⚠ {formErrors.days}</div>
                )}
              </div>

              {/* Row 4: Maximum Capacity Stepper */}
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">
                  👥 Maximum Capacity *
                </label>
                <div className="stepper-control">
                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={() => handleCapacityChange(-1)}
                    disabled={parseInt(capacity, 10) <= 1}
                    title="Decrease spots"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    className="form-input stepper-input"
                    value={capacity}
                    onChange={(e) => setCapacity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    required
                  />
                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={() => handleCapacityChange(1)}
                    disabled={parseInt(capacity, 10) >= 100}
                    title="Increase spots"
                  >
                    +
                  </button>
                  <span style={{ fontSize: '13.5px', color: '#64748b' }}>
                    spots available for booking
                  </span>
                </div>
                <p style={{ fontSize: '12.5px', color: '#94a3b8', marginTop: '6px' }}>
                  Maximum number of members allowed in this class session.
                </p>
                {formErrors.capacity && (
                  <div className="field-error-text">⚠ {formErrors.capacity}</div>
                )}
              </div>

              {/* Form Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button
                  type="submit"
                  className="btn btn-primary btn-md"
                  disabled={submitting}
                >
                  {submitting ? '⏳ Scheduling...' : '📅 Schedule Class →'}
                </button>
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="btn btn-secondary btn-md"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          {/* Right Live Class Preview Card */}
          <div className="live-preview-card">
            <div className="live-preview-header">
              <span className="live-preview-tag">LIVE PREVIEW</span>
              <span className="badge badge-open">● Scheduled</span>
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
              🏋️ {name || 'Strength Training'}
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#2563eb' }}>
                👤 {currentTrainer?.name || 'Rahul Sharma'}
              </span>
              <span style={{ fontSize: '12.5px', color: '#64748b' }}>
                • {currentTrainer?.specialization || 'Strength Training'}
              </span>
            </div>

            <div className="class-meta-box" style={{ margin: 0 }}>
              <div className="class-meta-line">
                <strong>📅 Date:</strong> {formatPreviewDate(classDate)}
              </div>
              <div className="class-meta-line">
                <strong>🕐 Time:</strong> {time}
              </div>
              <div className="class-meta-line">
                <strong>🗓️ Days:</strong> {selectedDays.join(', ') || 'None selected'}
              </div>
              <div className="class-meta-line">
                <strong>📍 Studio:</strong> FitZone Main Studio
              </div>
              <div className="class-meta-line">
                <strong>👥 Capacity:</strong> {capacity} spots
              </div>
            </div>

            <div style={{ marginTop: '16px', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12.5px', color: '#64748b' }}>
              ℹ️ This session will immediately appear on the member classes schedule once confirmed.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
