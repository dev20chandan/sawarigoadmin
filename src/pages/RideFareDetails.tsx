'use client';
import { useState, useEffect } from 'react';
import { Search, Receipt, Loader2 } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import './RideFare.css';

export default function RideFareDetails() {
  const [searchTerm, setSearchTerm] = useState('');
  const [fares, setFares] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFares = async () => {
      try {
        const response = await axiosInstance.get('/rides/fares-overview');
        setFares(Array.isArray(response.data) ? response.data : []);
      } catch (err: any) {
        console.error('Error fetching fares:', err);
        setError(err.response?.data?.message || 'Failed to fetch fare records');
      } finally {
        setLoading(false);
      }
    };
    fetchFares();
  }, []);

  const formatCurrency = (val: number) => `₹${Number(val).toFixed(2)}`;

  const filteredFares = fares.filter(f => f.rideId?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="animate-fade-in" style={{ padding: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Overview of all generated fare receipts and platform economics</p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="form-control" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', marginBottom: 0, borderRadius: '30px' }}>
            <Search size={18} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search by Ride ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none' }}
            />
          </div>
        </div>
      </div>

      <div className="glass-panel table-container">
        <table>
          <thead>
            <tr>
              <th>Ride ID / Receipt</th>
              <th>Base Fare</th>
              <th>Distance & Time</th>
              <th>Surge</th>
              <th>Subtotal</th>
              <th>Discount</th>
              <th>Tax</th>
              <th style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>Total Fare</th>
              <th style={{ color: 'var(--success)' }}>Driver Earning</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '3rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Loader2 className="animate-spin" size={32} color="var(--accent-primary)" />
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--danger)' }}>
                  {error}
                </td>
              </tr>
            ) : filteredFares.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No fare records found matching "{searchTerm}"
                </td>
              </tr>
            ) : (
              filteredFares.map(fare => {
                const base = fare.baseFare || 0;
                const distanceTime = (fare.perKmCharge || 0) + (fare.perMinuteCharge || 0);
                const surge = fare.surgeMultiplier || 1.0;
                const subtotal = base + distanceTime;
                const surgedSubtotal = subtotal * surge;
                const discount = fare.discountAmount || 0;
                const tax = fare.taxAmount || 0;
                const total = fare.finalFare || 0;
                const earning = fare.driverEarning || 0;

                return (
                  <tr key={fare.id || fare.rideId} className="hover-highlight" style={{ cursor: 'pointer' }}>
                    <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Receipt size={16} color="var(--accent-primary)" />
                        {fare.rideId?.substring(0, 10)}...
                      </div>
                    </td>
                    <td>{formatCurrency(base)}</td>
                    <td>{formatCurrency(distanceTime)}</td>
                    <td>
                      {surge > 1 ? (
                        <span style={{ color: 'var(--warning)', fontWeight: 600 }}>{surge}x</span>
                      ) : '-'}
                    </td>
                    <td>{formatCurrency(surgedSubtotal)}</td>
                    <td>
                      {discount > 0 ? (
                        <span style={{ color: 'var(--success)' }}>-{formatCurrency(discount)}</span>
                      ) : '-'}
                    </td>
                    <td>{formatCurrency(tax)}</td>
                    <td style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{formatCurrency(total)}</td>
                    <td style={{ fontWeight: 'bold', color: 'var(--success)' }}>{formatCurrency(earning)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
