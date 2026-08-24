import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TrainerCard from '../components/TrainerCard';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/api/v1';

function ClassesPage() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTrainer, setSelectedTrainer] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('07:00 AM - 08:00 AM');
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingMessage, setBookingMessage] = useState(null);

  const { member, token } = useAuth();
  const navigate = useNavigate();

  // Fetch trainers from GET /api/v1/trainers on mount
  const fetchTrainers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/trainers`);
      const data = await response.json();

      if (response.ok && data.trainers) {
        setTrainers(data.trainers);
        if (data.trainers.length > 0) {
          setSelectedTrainer(data.trainers[0]._id || data.trainers[0].id);
        }
      } else if (Array.isArray(data)) {
        setTrainers(data);
        if (data.length > 0) {
          setSelectedTrainer(data[0]._id || data[0].id);
        }
      } else {
        setError(data.message || 'Failed to load trainers.');
      }
    } catch (err) {
      setError('Unable to load trainers. Please check if the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainers();
  }, []);

  // Time slot options
  const timeSlots = [
    '06:00 AM - 07:00 AM',
    '07:00 AM - 08:00 AM',
    '08:30 AM - 09:15 AM',
    '05:30 PM - 06:30 PM',
    '06:30 PM - 07:30 PM'
  ];

  // Handle class booking
  const handleBookClass = async (gymClass, specificTrainerId) => {
    if (!token || !member) {
      navigate('/');
      return;
    }

    setBookingMessage(null);
    setBookingLoading(true);
    setSelectedClass(gymClass);

    const trainerIdToUse =
      specificTrainerId ||
      selectedTrainer ||
      (trainers.length > 0 ? trainers[0]._id || trainers[0].id : null);

    const timeSlotToUse = selectedTimeSlot || gymClass.time;
    const dateToUse = selectedDate || new Date().toISOString().split('T')[0];

    if (!trainerIdToUse) {
      setBookingMessage({ type: 'error', text: 'No trainer available for booking.' });
      setBookingLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          trainerId: trainerIdToUse,
          className: gymClass.name,
          date: dateToUse,
          timeSlot: timeSlotToUse
        })
      });

      const data = await response.json();

      if (response.ok) {
        setBookingMessage({ type: 'success', text: '✓ Class booked successfully! Redirecting...' });
        setTimeout(() => {
          navigate('/my-bookings');
        }, 1200);
      } else {
        setBookingMessage({
          type: 'error',
          text: data.message || 'Booking failed. Please try again.'
        });
      }
    } catch (err) {
      setBookingMessage({ type: 'error', text: 'Booking failed. Please check server connection.' });
    } finally {
      setBookingLoading(false);
    }
  };

  // Client-side search filtering on fetched trainers
  const filteredTrainers = trainers.filter((trainer) => {
    const query = search.toLowerCase();
    const spec = (trainer.specialization || '').toLowerCase();
    const name = (trainer.name || '').toLowerCase();
    return spec.includes(query) || name.includes(query);
  });

  // Get selected trainer name for display in preferences
  const currentTrainerObj = trainers.find(
    (t) => (t._id || t.id) === selectedTrainer
  );
  const selectedTrainerDisplayName = currentTrainerObj
    ? currentTrainerObj.name
    : trainers.length > 0
    ? trainers[0].name
    : 'None';

  // Available Gym Classes Catalog (Synced with Admin Scheduler)
  const defaultClassCatalog = [
    {
      id: 'c-1',
      category: 'Yoga',
      name: 'Morning Yoga Flow',
      specialization: 'Yoga',
      time: '07:00 AM - 08:00 AM',
      days: 'Mon, Wed, Fri',
      capacity: 15,
      bookedCount: 3,
      description: 'Gentle stretching, core balance exercises, and mindfulness for flexibility and vitality.'
    },
    {
      id: 'c-2',
      category: 'HIIT',
      name: 'HIIT Blast',
      specialization: 'HIIT',
      time: '08:30 AM - 09:15 AM',
      days: 'Mon to Fri',
      capacity: 20,
      bookedCount: 8,
      description: 'High intensity interval training designed for rapid calorie burn and cardiovascular endurance.'
    },
    {
      id: 'c-3',
      category: 'Strength',
      name: 'Strength & Conditioning',
      specialization: 'Strength',
      time: '05:30 PM - 06:30 PM',
      days: 'Tue, Thu, Sat',
      capacity: 12,
      bookedCount: 6,
      description: 'Progressive barbell weightlifting and resistance movements to build lean muscle and power.'
    },
    {
      id: 'c-4',
      category: 'Zumba',
      name: 'Zumba Dance Fitness',
      specialization: 'Zumba',
      time: '06:30 PM - 07:30 PM',
      days: 'Mon, Wed, Fri',
      capacity: 25,
      bookedCount: 12,
      description: 'High-energy dance workout set to upbeat tempo music for full-body aerobic fitness.'
    }
  ];

  let classCatalog = defaultClassCatalog;
  try {
    const savedClasses = localStorage.getItem('fitzone_scheduled_classes');
    if (savedClasses) {
      classCatalog = JSON.parse(savedClasses);
    }
  } catch (e) {
    classCatalog = defaultClassCatalog;
  }

  const displayedClasses = selectedCategory === 'All'
    ? classCatalog
    : classCatalog.filter((c) => (c.category || '').toLowerCase() === selectedCategory.toLowerCase() || (c.name || '').toLowerCase().includes(selectedCategory.toLowerCase()));

  return (
    <div className="container">
      {/* Fitness Hero Banner */}
      <div className="fitness-hero">
        <div className="fitness-hero-tag">⚡ FitZone Schedule & Live Booking</div>
        <h1 className="fitness-hero-title">Find Your Perfect Workout</h1>
        <p className="fitness-hero-desc">
          Train smarter. Reserve your favorite fitness classes, collaborate with certified coaches, and achieve your personal health milestones.
        </p>

        <div className="fitness-stats-row">
          <div className="stat-item">
            <span className="stat-number">12+</span>
            <span className="stat-label">Weekly Classes</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{trainers.length || '4'}</span>
            <span className="stat-label">Certified Coaches</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">250+</span>
            <span className="stat-label">Active Members</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">99%</span>
            <span className="stat-label">Satisfaction Rate</span>
          </div>
        </div>
      </div>

      {bookingMessage && (
        <div className={`alert ${bookingMessage.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          <span>{bookingMessage.type === 'success' ? '✅' : '⚠️'}</span>
          {bookingMessage.text}
        </div>
      )}

      {/* Booking Customizer Preferences Card */}
      <div className="card" style={{ marginBottom: '40px' }}>
        <h2 className="card-title" style={{ fontSize: '18px', marginBottom: '4px' }}>
          Booking Customizer
        </h2>
        <p style={{ fontSize: '13.5px', color: '#64748b', marginBottom: '18px' }}>
          Customize your preferred coach, date, and workout schedule before confirming a class
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="selectTrainer">
              👤 Preferred Trainer
            </label>
            <select
              id="selectTrainer"
              className="form-select"
              value={selectedTrainer}
              onChange={(e) => setSelectedTrainer(e.target.value)}
            >
              {trainers.length === 0 && <option value="">No trainers available</option>}
              {trainers.map((t) => (
                <option key={t._id || t.id} value={t._id || t.id}>
                  {t.name} ({t.specialization})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="selectTimeSlot">
              🕐 Preferred Time Slot
            </label>
            <select
              id="selectTimeSlot"
              className="form-select"
              value={selectedTimeSlot}
              onChange={(e) => setSelectedTimeSlot(e.target.value)}
            >
              {timeSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="selectDate">
              📅 Workout Date
            </label>
            <input
              id="selectDate"
              type="date"
              className="form-input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>

        {/* Live Selection Preview Box */}
        <div className="class-meta-box" style={{ margin: 0 }}>
          <div className="class-meta-line">
            <strong>Coach:</strong> {selectedTrainerDisplayName}
          </div>
          <div className="class-meta-line">
            <strong>Time:</strong> {selectedTimeSlot || 'None'}
          </div>
          <div className="class-meta-line">
            <strong>Date:</strong> {selectedDate || 'Today'}
          </div>
          {selectedClass && (
            <div className="class-meta-line">
              <strong>Selected:</strong> {selectedClass.name}
            </div>
          )}
        </div>
      </div>

      {/* Available Classes Section */}
      <div className="section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Available Fitness Classes</h2>
            <p className="section-subtitle">
              Choose your workout intensity and reserve your spot in advance
            </p>
          </div>

          {/* Quick Category Filter Pills */}
          <div className="preset-chip-group" style={{ marginBottom: 0 }}>
            {['All', 'Yoga', 'HIIT', 'Strength', 'Zumba'].map((cat) => (
              <button
                key={cat}
                type="button"
                className={`preset-chip ${selectedCategory === cat ? 'active' : ''}`}
                style={
                  selectedCategory === cat
                    ? { backgroundColor: '#2563eb', color: '#ffffff', borderColor: '#2563eb' }
                    : {}
                }
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid-cards">
          {displayedClasses.map((cls) => {
            const availableSpots = cls.capacity - cls.bookedCount;
            const isFull = availableSpots <= 0;
            const percentageBooked = Math.min(100, Math.round((cls.bookedCount / cls.capacity) * 100));

            const classSpec = (cls.specialization || cls.category || '').toLowerCase();
            const matchingTrainer =
              trainers.find((t) =>
                classSpec && (t.specialization || '').toLowerCase().includes(classSpec)
              ) ||
              trainers.find((t) =>
                cls.trainer && (t.name || '').toLowerCase() === (cls.trainer || '').toLowerCase()
              ) ||
              currentTrainerObj ||
              (trainers.length > 0 ? trainers[0] : null);

            const trainerName = matchingTrainer ? matchingTrainer.name : 'FitZone Coach';

            return (
              <div key={cls.id} className="class-card">
                <div>
                  <span className="class-category-badge">{cls.category}</span>
                </div>

                <div className="class-header-row">
                  <h3 className="class-title">{cls.name}</h3>
                  <span className={`badge ${isFull ? 'badge-full' : 'badge-open'}`}>
                    {isFull ? 'Full' : `${availableSpots} spots left`}
                  </span>
                </div>

                <div>
                  <span className="class-coach-tag">
                    <span>👤 Coach:</span> {trainerName}
                  </span>
                </div>

                <p className="class-desc">{cls.description}</p>

                <div className="class-meta-box">
                  <div className="class-meta-line">
                    <strong>Schedule:</strong> {cls.time}
                  </div>
                  <div className="class-meta-line">
                    <strong>Days:</strong> {cls.days}
                  </div>
                  <div className="class-meta-line" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <strong>Capacity:</strong>
                      <span>{cls.bookedCount} / {cls.capacity} booked ({percentageBooked}%)</span>
                    </div>
                    <div className="capacity-bar-track">
                      <div
                        className="capacity-bar-fill"
                        style={{ width: `${percentageBooked}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleBookClass(cls, matchingTrainer?._id || selectedTrainer)}
                  disabled={isFull || bookingLoading}
                  className="btn btn-primary btn-block"
                >
                  {bookingLoading && selectedClass?.id === cls.id
                    ? 'Booking...'
                    : isFull
                    ? 'Class Fully Booked'
                    : member
                    ? 'Book This Class →'
                    : 'Login to Book Class'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Certified Trainers Section with Search */}
      <div className="section" style={{ marginTop: '50px' }}>
        <div className="section-header">
          <div>
            <h2 className="section-title">
              Meet Your Certified Coaches {search && `(${filteredTrainers.length} found)`}
            </h2>
            <p className="section-subtitle">
              Train with experienced fitness professionals committed to your goals
            </p>
          </div>
        </div>

        {/* Specialization Search Bar */}
        <div className="search-container">
          <span className="search-icon-wrapper">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search coaches by specialization (e.g. Yoga, HIIT, Strength)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Loading State with Skeleton Cards */}
        {loading && (
          <div className="grid-trainers">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="skeleton-card">
                <div className="skeleton-avatar"></div>
                <div style={{ flex: 1 }}>
                  <div className="skeleton-line" style={{ width: '60%' }}></div>
                  <div className="skeleton-line" style={{ width: '40%' }}></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State with Retry Button */}
        {!loading && error && (
          <div className="empty-state-box">
            <span className="empty-state-icon">⚠️</span>
            <h3 className="empty-state-title">Unable to Load Trainers</h3>
            <p className="empty-state-text">{error}</p>
            <button onClick={fetchTrainers} className="btn btn-primary btn-sm">
              Try Again 🔄
            </button>
          </div>
        )}

        {/* Empty Search Results */}
        {!loading && !error && filteredTrainers.length === 0 && (
          <div className="empty-state-box">
            <span className="empty-state-icon">🔍</span>
            <h3 className="empty-state-title">No matching coaches found</h3>
            <p className="empty-state-text">
              Try searching with another keyword such as Yoga, HIIT, Strength, or Zumba.
            </p>
            <button onClick={() => setSearch('')} className="btn btn-secondary btn-sm">
              Clear Search Filter
            </button>
          </div>
        )}

        {/* Trainer Cards Grid */}
        {!loading && !error && filteredTrainers.length > 0 && (
          <div className="grid-trainers">
            {filteredTrainers.map((trainer) => (
              <TrainerCard
                key={trainer._id || trainer.id}
                name={trainer.name}
                specialization={trainer.specialization}
                available={trainer.available}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ClassesPage;
