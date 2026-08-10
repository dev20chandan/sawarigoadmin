import { useState, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Loader2, Plus, Edit, Trash2, X, FileText, BookOpen, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { fetchFaqs, addFaq, updateFaq, deleteFaq } from '../store/cmsSlice';

const availablePages = [
  { slug: 'about-us', title: 'About Us' },
  { slug: 'terms', title: 'Terms and Conditions' },
  { slug: 'privacy', title: 'Privacy Policy' }
];

const CmsFaq = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { faqs, loading } = useSelector((state: RootState) => state.cms);

  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    status: 'ACTIVE'
  });

  useEffect(() => { dispatch(fetchFaqs()); }, [dispatch]);

  useEffect(() => {
    if (faqs.length > 0 && !openFaqId) {
      setOpenFaqId(faqs[0].id);
    }
  }, [faqs]);

  const handleSubmit = async () => {
    if (!formData.question.trim() || !formData.answer.trim() || formData.answer === '<p><br></p>') return;

    setSaving(true);
    try {
      if (editingFaq) {
        await dispatch(updateFaq({ id: editingFaq.id, payload: formData })).unwrap();
      } else {
        await dispatch(addFaq(formData)).unwrap();
      }
      setSuccessMessage(editingFaq ? 'FAQ updated successfully!' : 'FAQ added successfully!');
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMessage(null);
        setSaving(false);
      }, 1500);
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!faqToDelete) return;
    setDeleting(true);
    try {
      await dispatch(deleteFaq(faqToDelete)).unwrap();
      setFaqToDelete(null);
      setDeleting(false);
    } catch (err) {
      console.error(err);
      setDeleting(false);
    }
  };



  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Top Tabs */}
      <div className="glass-panel" style={{ width: '100%', display: 'flex', gap: '0.5rem', padding: '1rem', overflowX: 'auto' }}>
        {availablePages.map(page => (
          <button
            key={page.slug}
            onClick={() => navigate('/cms/pages', { state: { slug: page.slug } })}
            className={`btn btn-outline`}
            style={{
              justifyContent: 'flex-start',
              padding: '0.75rem 1rem',
              boxShadow: 'none',
              background: 'transparent',
              borderColor: 'transparent'
            }}
          >
            <FileText size={18} />
            {page.title}
          </button>
        ))}
        <button
          onClick={() => { }}
          className={`btn btn-primary`}
          style={{
            justifyContent: 'flex-start',
            padding: '0.75rem 1rem',
            boxShadow: 'none',
            background: 'var(--gradient-main)',
            borderColor: 'transparent'
          }}
        >
          <BookOpen size={18} />
          FAQs
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
          <button className="btn btn-primary" onClick={() => { setEditingFaq(null); setFormData({ question: '', answer: '', status: 'ACTIVE' }); setIsModalOpen(true); }}>
            <Plus size={18} /> Add FAQ
          </button>
        </div>

        <div className="glass-panel" style={{ marginTop: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem', background: 'transparent', boxShadow: 'none', border: 'none' }}>
          {loading && faqs.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
              <Loader2 className="animate-spin" size={32} color="var(--accent-primary)" />
            </div>
          ) : (
            <>
              {faqs.map(faq => (
                <div key={faq.id} className="glass-panel" style={{ overflow: 'hidden', padding: 0 }}>
                  <div
                    onClick={() => setOpenFaqId(openFaqId === faq.id ? null : faq.id)}
                    style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: 'var(--bg-card)' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0, wordBreak: 'break-word', paddingRight: '2rem' }}>
                        <span style={{ color: 'var(--accent-primary)', marginRight: '0.5rem' }}>Q.</span>
                        {faq.question}
                      </h3>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span className={`badge ${faq.status === 'ACTIVE' ? 'active' : 'inactive'}`} style={{ transform: 'scale(0.8)', transformOrigin: 'right center' }}>
                        {faq.status}
                      </span>
                      <div style={{ display: 'flex', gap: '0.5rem' }} onClick={e => e.stopPropagation()}>
                        <button onClick={() => { setEditingFaq(faq); setFormData({ question: faq.question, answer: faq.answer, status: faq.status }); setIsModalOpen(true); }} className="btn btn-outline" style={{ padding: '0.4rem 0.6rem' }} title="Edit FAQ">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => setFaqToDelete(faq.id)} className="btn btn-outline" style={{ padding: '0.4rem 0.6rem', color: 'var(--danger)', borderColor: 'var(--danger)' }} title="Delete FAQ">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div style={{ color: 'var(--text-muted)' }}>
                        {openFaqId === faq.id ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                      </div>
                    </div>
                  </div>
                  {openFaqId === faq.id && (
                    <div className="animate-fade-in" style={{ padding: '1.5rem', borderTop: 'var(--glass-border)', background: 'var(--input-bg)', color: 'var(--text-main)', wordBreak: 'break-word', display: 'flex', gap: '0.75rem', alignItems: 'baseline' }}>
                      <span style={{ fontWeight: 600, color: 'var(--success)', whiteSpace: 'nowrap' }}>A.</span>
                      <div dangerouslySetInnerHTML={{ __html: faq.answer }} style={{ flex: 1 }}></div>
                    </div>
                  )}
                </div>
              ))}
              {faqs.length === 0 && (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No FAQs found. Add one to get started.</div>
              )}
            </>
          )}
        </div>
      </div>

      {isModalOpen && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, overflowY: 'auto', padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
          <div className="animate-fade-in glass-panel" style={{ width: '100%', maxWidth: '800px', margin: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>{editingFaq ? 'Edit FAQ' : 'Add FAQ'}</h2>
              <button onClick={() => { setIsModalOpen(false); setSuccessMessage(null); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            {successMessage && (
              <div className="animate-fade-in" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={20} />
                {successMessage}
              </div>
            )}

            <div className="form-group">
              <label>Question</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter FAQ Question"
                value={formData.question}
                onChange={e => setFormData({ ...formData, question: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select className="form-control" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>Answer</label>
              <div style={{ background: 'var(--bg-card)', borderRadius: '8px', color: 'var(--text-main)' }}>
                <ReactQuill
                  theme="snow"
                  value={formData.answer}
                  onChange={val => setFormData({ ...formData, answer: val })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => { setIsModalOpen(false); setSuccessMessage(null); setSaving(false); }} disabled={saving}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} onClick={handleSubmit} disabled={saving}>
                {saving ? <Loader2 size={18} className="animate-spin" /> : null}
                {saving ? 'Saving...' : (editingFaq ? 'Update FAQ' : 'Save FAQ')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {faqToDelete && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, overflowY: 'auto', padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
          <div className="animate-fade-in glass-panel" style={{ width: '100%', maxWidth: '400px', margin: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)', textAlign: 'center' }}>
            <Trash2 size={48} color="var(--danger)" style={{ margin: '0 auto 1rem auto', opacity: 0.8 }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Delete FAQ?</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Are you sure you want to delete this FAQ? This action cannot be undone.</p>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setFaqToDelete(null)} disabled={deleting}>Cancel</button>
              <button className="btn" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }} onClick={confirmDelete} disabled={deleting}>
                {deleting ? <Loader2 size={18} className="animate-spin" /> : null}
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <style>{`
        .table-container td { vertical-align: middle; }
        .ql-toolbar { 
          border-top-left-radius: 8px; 
          border-top-right-radius: 8px;
          border-color: var(--border) !important;
        }
        .ql-container { 
          border-bottom-left-radius: 8px; 
          border-bottom-right-radius: 8px;
          border-color: var(--border) !important;
          font-family: inherit !important;
        }
        .ql-editor {
          color: var(--text-main);
          min-height: 200px;
        }
      `}</style>
    </div>
  );
};
export default CmsFaq;
