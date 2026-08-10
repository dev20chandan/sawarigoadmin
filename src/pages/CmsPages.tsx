import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Loader2, Save, FileText, CheckCircle, BookOpen } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { fetchAllPages, updatePage } from '../store/cmsSlice';

const availablePages = [
  { slug: 'about-us', title: 'About Us' },
  { slug: 'terms', title: 'Terms and Conditions' },
  { slug: 'privacy', title: 'Privacy Policy' }
];

const CmsPages = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { pages, loading } = useSelector((state: RootState) => state.cms);

  const [activeSlug, setActiveSlug] = useState(location.state?.slug || 'about-us');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });

  useEffect(() => {
    // Fetch all pages if we haven't loaded them into the dictionary yet.
    if (Object.keys(pages).length === 0 && !loading) {
      dispatch(fetchAllPages());
    }
    setSaveSuccess(false);
  }, [activeSlug, dispatch, pages, loading]);

  useEffect(() => {
    const defaultTitle = availablePages.find(p => p.slug === activeSlug)?.title || 'Custom Page';
    
    if (pages[activeSlug]) {
      const serverTitle = pages[activeSlug].title;
      const isValidServerTitle = typeof serverTitle === 'string' && serverTitle.trim().length > 0;
      
      setFormData({ 
        title: isValidServerTitle ? serverTitle : defaultTitle, 
        content: pages[activeSlug].content || '' 
      });
    } else {
       setFormData({ title: defaultTitle, content: '' });
    }
  }, [pages, activeSlug]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const hardcodedTitle = availablePages.find(p => p.slug === activeSlug)?.title || 'Custom Page';
    
    setSaving(true);
    try {
      await dispatch(updatePage({ slug: activeSlug, payload: { ...formData, title: hardcodedTitle } })).unwrap();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch(err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Tabs */}
      <div className="glass-panel" style={{ width: '100%', display: 'flex', gap: '0.5rem', padding: '1rem', overflowX: 'auto' }}>
        {availablePages.map(page => (
          <button
            key={page.slug}
            onClick={() => setActiveSlug(page.slug)}
            className={`btn ${activeSlug === page.slug ? 'btn-primary' : 'btn-outline'}`}
            style={{ 
              justifyContent: 'flex-start', 
              padding: '0.75rem 1rem', 
              boxShadow: 'none',
              background: activeSlug === page.slug ? 'var(--gradient-main)' : 'transparent',
              borderColor: 'transparent'
            }}
          >
            <FileText size={18} />
            {page.title}
          </button>
        ))}
        <button
            onClick={() => navigate('/cms/faqs')}
            className={`btn btn-outline`}
            style={{ 
              justifyContent: 'flex-start', 
              padding: '0.75rem 1rem', 
              boxShadow: 'none',
              background: 'transparent',
              borderColor: 'transparent'
            }}
          >
            <BookOpen size={18} />
            FAQs
        </button>
      </div>

      {/* Editor Main Content */}
      <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
        
        {saveSuccess && (
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={20} />
            Page content successfully saved!
          </div>
        )}

        {saving && (
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Loader2 className="animate-spin" size={20} />
            Saving current page...
          </div>
        )}

        {loading && !pages[activeSlug] ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
            <Loader2 className="animate-spin" size={32} color="var(--accent-primary)" />
          </div>
        ) : (
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Edit {availablePages.find(p => p.slug === activeSlug)?.title}
            </h2>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Page Title</label>
              <input 
                type="text" 
                className="form-control" 
                value={availablePages.find(p => p.slug === activeSlug)?.title || 'Custom Page'}
                readOnly
                disabled
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Page Content (HTML supported)</label>
              <div style={{ background: 'var(--bg-card)', borderRadius: '8px', color: 'var(--text-main)' }}>
                <ReactQuill 
                  theme="snow" 
                  value={formData.content} 
                  onChange={val => setFormData({...formData, content: val})} 
                  style={{ height: '350px', marginBottom: '2.5rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
               <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }} disabled={saving}>
                 {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} 
                 {saving ? 'Saving...' : 'Save Page'}
               </button>
            </div>
          </form>
        )}
      </div>

      <style>{`
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
          min-height: 350px;
        }
      `}</style>
    </div>
  );
};

export default CmsPages;
