'use client';
import { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../config';
import './RideFare.css'; 

// SVG Star component
const Star = ({ filled }: { filled: boolean }) => (
  <svg 
    width="16" height="16" 
    viewBox="0 0 24 24" 
    fill={filled ? 'var(--warning)' : 'none'} 
    stroke={filled ? 'var(--warning)' : 'var(--text-muted)'} 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

interface Review {
  reviewId: string;
  rideId: string;
  riderId: string;
  riderName: string;
  driverId: string;
  driverName: string;
  rating: number;
  review: string;
  createdDate: string;
}

export default function RatingsAndReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Real dynamic fetching logic
  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/admin/reviews`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = reviews.filter(r => 
    r.riderName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.driverName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.rideId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in" style={{ padding: '0.5rem' }}>
      
      {/* Top action bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Monitor and manage real-time passenger feedback</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="form-control" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', marginBottom: 0, borderRadius: '30px' }}>
            <Search size={18} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Search by name or Ride ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none' }}
            />
          </div>
        </div>
      </div>

      {/* Table Panel */}
      <div className="glass-panel table-container" style={{ margin: 0, padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th style={{ textAlign: 'center' }}>Ride ID</th>
              <th style={{ textAlign: 'left', paddingLeft: '1.5rem' }}>Rider Name</th>
              <th style={{ textAlign: 'left', paddingLeft: '1.5rem' }}>Driver Name</th>
              <th style={{ textAlign: 'center' }}>Rating</th>
              <th style={{ textAlign: 'left', paddingLeft: '1.5rem' }}>Review / Comment</th>
              <th style={{ textAlign: 'center' }}>Created Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Loader2 className="animate-spin" size={32} color="var(--accent-primary)" />
                  </div>
                </td>
              </tr>
            ) : filteredReviews.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No reviews found matching "{searchTerm}"
                </td>
              </tr>
            ) : (
              filteredReviews.map((review) => (
                <tr key={review.reviewId} className="hover-highlight" style={{ cursor: 'pointer' }}>
                  <td style={{ textAlign: 'center', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                    {review.rideId?.slice(0, 8)}...
                  </td>
                  <td style={{ textAlign: 'left', paddingLeft: '1.5rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{review.riderName || 'N/A'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '0.2rem' }}>
                      {review.riderId?.slice(0, 8) || ''}
                    </div>
                  </td>
                  <td style={{ textAlign: 'left', paddingLeft: '1.5rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{review.driverName || 'N/A'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '0.2rem' }}>
                      {review.driverId?.slice(0, 8) || ''}
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} filled={i < review.rating} />
                      ))}
                    </div>
                  </td>
                  <td style={{ maxWidth: '250px', textAlign: 'left', paddingLeft: '1.5rem' }}>
                    <p style={{ margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-main)' }} title={review.review}>
                      {review.review || <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>No comment</span>}
                    </p>
                  </td>
                  <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    {new Date(review.createdDate).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
