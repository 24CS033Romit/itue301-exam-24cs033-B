import React from 'react';

function TrainerCard({ name, specialization, available }) {
  // Generate 2-letter initials for avatar placeholder
  const getInitials = (n) => {
    if (!n) return 'TR';
    const parts = n.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  const isAvailable = available !== false;

  return (
    <div className="trainer-card">
      <div className="trainer-avatar">{getInitials(name)}</div>
      <div className="trainer-info">
        <div className="trainer-name">{name}</div>
        <div className="trainer-specialty">{specialization || 'Fitness & Conditioning'}</div>
        <div style={{ marginTop: '8px' }}>
          <span className={`badge ${isAvailable ? 'badge-open' : 'badge-full'}`}>
            ● {isAvailable ? 'Available' : 'Fully Booked'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default TrainerCard;
