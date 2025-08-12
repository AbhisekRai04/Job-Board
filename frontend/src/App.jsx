import { useState, useEffect } from 'react';
import { Search, MapPin, BriefcaseBusiness, ChevronLeft, XCircle, Building, Users } from 'lucide-react';

// Main App component for handling routing and state
const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null); // {name, email, role}
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // or 'signup'
  const handleLogout = () => {
    setUser(null);
    setCurrentPage('home');
  };

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/jobs');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setJobs(data);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to fetch jobs. Please check if the backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch jobs from the backend API
  useEffect(() => {
    fetchJobs();
  }, []);

  const navigateTo = (page, job = null) => {
    setCurrentPage(page);
    setSelectedJob(job);
  };

  const handleSearch = (query) => {
    const filteredJobs = jobs.filter(job =>
      job.title.toLowerCase().includes(query.toLowerCase()) ||
      job.company.toLowerCase().includes(query.toLowerCase()) ||
      job.location.toLowerCase().includes(query.toLowerCase())
    );
    setJobs(filteredJobs);
    setCurrentPage('listings');
  };

  let content;
  if (isLoading) {
    content = <div className="text-center py-20 text-gray-400 text-xl">Loading jobs...</div>;
  } else if (error) {
    content = <div className="text-center py-20 text-red-400 text-xl">Error: {error}</div>;
  } else {
    switch (currentPage) {
      case 'home':
        content = <HomePage onSearch={handleSearch} allJobs={jobs} navigateTo={navigateTo} />;
        break;
      case 'listings':
        content = <JobListingPage jobs={jobs} navigateTo={navigateTo} />;
        break;
      case 'employers':
        content = <EmployersPage />;
        break;
      case 'candidates':
        content = <CandidatesPage user={user} />;
        break;
      case 'details':
        content = <JobDetailPage job={selectedJob} navigateTo={navigateTo} user={user} />;
        break;
      case 'apply':
        content = <JobApplicationPage job={selectedJob} user={user} navigateTo={navigateTo} />;
        break;
      case 'applications':
        content = <ApplicationsPage user={user} job={selectedJob} navigateTo={navigateTo} />;
        break;
      case 'postjob':
        content = <JobPostPage user={user} onJobPosted={() => { fetchJobs(); setCurrentPage('listings'); setError(null); setSelectedJob(null); }} />;
        break;
      default:
        content = <HomePage onSearch={handleSearch} allJobs={jobs} navigateTo={navigateTo} />;
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a1121', color: '#e0e6f6', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <Navbar navigateTo={navigateTo} user={user} setShowAuth={setShowAuth} handleLogout={handleLogout} />
      <main style={{ flex: 1, width: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2vw 0' }}>
        <div style={{ width: '100%', maxWidth: '1200px', minWidth: 0 }}>
          {content}
        </div>
      </main>
      <Footer />
      {showAuth && (
        <AuthModal mode={authMode} setMode={setAuthMode} setShow={setShowAuth} setUser={setUser} />
      )}
    </div>
  );
};

// Helper function to format currency
const formatSalary = (salary) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(parseInt(salary.replace(/[^\d]/g, '')));
};

// Navbar Component
const Navbar = ({ navigateTo, user, setShowAuth, handleLogout }) => (
  <header style={{ background: '#151c2c', padding: '0.5rem 0', borderBottom: '1px solid #232b3e', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
    <div style={{ display: 'flex', alignItems: 'center', marginLeft: '2rem' }}>
      <span style={{ fontSize: '2rem', color: '#7b8cff', marginRight: '0.5rem' }}>💼</span>
      <span style={{ fontWeight: 700, fontSize: '1.5rem', color: '#7b8cff', letterSpacing: '1px', cursor: 'pointer' }} onClick={() => navigateTo('home')}>JobBoard</span>
      <nav style={{ marginLeft: '2rem', display: 'flex', gap: '1.5rem', fontSize: '1.1rem' }}>
        <span onClick={() => navigateTo('listings')} style={{ color: '#e0e6f6', textDecoration: 'none', opacity: 0.9, cursor: 'pointer' }}>Find Jobs</span>
        {user && user.role === 'employer' && (
          <span onClick={() => navigateTo('postjob')} style={{ color: '#7b8cff', textDecoration: 'none', opacity: 1, cursor: 'pointer', fontWeight: 600 }}>Post Job</span>
        )}
        <span onClick={() => navigateTo('employers')} style={{ color: '#e0e6f6', textDecoration: 'none', opacity: 0.9, cursor: 'pointer' }}>Employers</span>
        <span onClick={() => navigateTo('candidates')} style={{ color: '#e0e6f6', textDecoration: 'none', opacity: 0.9, cursor: 'pointer' }}>Candidates</span>
      </nav>
    </div>
    <div style={{ marginRight: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
      {user ? (
        <>
          <span style={{ color: '#7b8cff', fontWeight: 500 }}>Hi, {user.name} ({user.role})</span>
          <button style={{ background: '#232b3e', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.5rem 1.2rem', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 2px 8px #0002' }} onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <>
          <span style={{ color: '#7b8cff', textDecoration: 'none', fontWeight: 500, cursor: 'pointer' }} onClick={() => { setShowAuth(true); }}>Login</span>
          <button style={{ background: '#7b8cff', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.5rem 1.2rem', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 2px 8px #0002' }} onClick={() => { setShowAuth(true); }}>Sign Up</button>
        </>
      )}
    </div>
  </header>
);

// Employers Page
function EmployersPage() {
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    fetch('http://localhost:3001/api/employers')
      .then(res => res.json())
      .then(setEmployers)
      .catch(() => setError('Failed to load employers'))
      .finally(() => setLoading(false));
  }, []);
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-8 lg:p-12">
      <h1 className="text-3xl font-bold text-white mb-4">All Employers</h1>
      {loading ? <div className="text-gray-400">Loading...</div> : error ? <div style={{ color: '#ff6b6b' }}>{error}</div> : (
        <ul style={{ marginTop: '1.5rem' }}>
          {employers.map(emp => (
            <li key={emp._id} style={{ background: '#232b3e', borderRadius: '1rem', padding: '1rem', marginBottom: '1rem', color: '#e0e6f6' }}>
              <div><b>Name:</b> {emp.name}</div>
              <div><b>Email:</b> {emp.email}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Candidates Page
function CandidatesPage({ user }) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    if (user && user.role === 'employer') {
      fetch(`http://localhost:3001/api/employer/${user._id}/applicants`)
        .then(res => res.json())
        .then(setCandidates)
        .catch(() => setError('Failed to load candidates'))
        .finally(() => setLoading(false));
    } else {
      fetch('http://localhost:3001/api/candidates')
        .then(res => res.json())
        .then(setCandidates)
        .catch(() => setError('Failed to load candidates'))
        .finally(() => setLoading(false));
    }
  }, [user]);
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-8 lg:p-12">
      <h1 className="text-3xl font-bold text-white mb-4">All Candidates</h1>
      {loading ? <div className="text-gray-400">Loading...</div> : error ? <div style={{ color: '#ff6b6b' }}>{error}</div> : (
        <ul style={{ marginTop: '1.5rem' }}>
          {candidates.map(cand => (
            <li key={cand._id} style={{ background: '#232b3e', borderRadius: '1rem', padding: '1rem', marginBottom: '1rem', color: '#e0e6f6' }}>
              <div><b>Name:</b> {cand.name}</div>
              <div><b>Email:</b> {cand.email}</div>
              {user && user.role === 'employer' && cand.jobs && (
                <div><b>Applied to your jobs:</b> {cand.jobs.map(j => <span key={j} style={{ marginRight: 8 }}>{j}</span>)}</div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
// Job Post Page (for Employers)
const JobPostPage = ({ user, onJobPosted }) => {
  const [form, setForm] = useState({
    title: '', company: '', location: '', type: '', description: '', responsibilities: '', qualifications: '', salary: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      const res = await fetch('http://localhost:3001/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          responsibilities: form.responsibilities.split('\n').map(s => s.trim()).filter(Boolean),
          qualifications: form.qualifications.split('\n').map(s => s.trim()).filter(Boolean),
          postedBy: user._id,
        }),
      });
      if (!res.ok) throw new Error('Failed to post job');
      setSuccess(true);
      setForm({ title: '', company: '', location: '', type: '', description: '', responsibilities: '', qualifications: '', salary: '' });
      if (onJobPosted) onJobPosted();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'employer') {
    return <div style={{ color: '#ff6b6b', padding: '2rem', textAlign: 'center' }}>Only employers can post jobs.</div>;
  }

  return (
    <form onSubmit={handleSubmit} style={{ background: '#151c2c', borderRadius: '1.5rem', padding: '2.5rem 2rem', maxWidth: 600, margin: '2rem auto', boxShadow: '0 4px 24px #0003', color: '#e0e6f6', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h2 style={{ fontWeight: 700, fontSize: '2rem', marginBottom: '1rem', color: '#fff' }}>Post a New Job</h2>
      <input name="title" placeholder="Job Title" value={form.title} onChange={handleChange} required style={{ padding: '0.8rem', borderRadius: '0.7rem', border: 'none', background: '#232b3e', color: '#e0e6f6' }} />
      <input name="company" placeholder="Company" value={form.company} onChange={handleChange} required style={{ padding: '0.8rem', borderRadius: '0.7rem', border: 'none', background: '#232b3e', color: '#e0e6f6' }} />
      <input name="location" placeholder="Location" value={form.location} onChange={handleChange} required style={{ padding: '0.8rem', borderRadius: '0.7rem', border: 'none', background: '#232b3e', color: '#e0e6f6' }} />
      <input name="type" placeholder="Job Type (e.g. Full-time)" value={form.type} onChange={handleChange} required style={{ padding: '0.8rem', borderRadius: '0.7rem', border: 'none', background: '#232b3e', color: '#e0e6f6' }} />
      <textarea name="description" placeholder="Job Description" value={form.description} onChange={handleChange} required rows={3} style={{ padding: '0.8rem', borderRadius: '0.7rem', border: 'none', background: '#232b3e', color: '#e0e6f6' }} />
      <textarea name="responsibilities" placeholder="Responsibilities (one per line)" value={form.responsibilities} onChange={handleChange} rows={3} style={{ padding: '0.8rem', borderRadius: '0.7rem', border: 'none', background: '#232b3e', color: '#e0e6f6' }} />
      <textarea name="qualifications" placeholder="Qualifications (one per line)" value={form.qualifications} onChange={handleChange} rows={3} style={{ padding: '0.8rem', borderRadius: '0.7rem', border: 'none', background: '#232b3e', color: '#e0e6f6' }} />
      <input name="salary" placeholder="Salary (e.g. ₹10,00,000)" value={form.salary} onChange={handleChange} style={{ padding: '0.8rem', borderRadius: '0.7rem', border: 'none', background: '#232b3e', color: '#e0e6f6' }} />
      {error && <div style={{ color: '#ff6b6b', fontWeight: 500 }}>{error}</div>}
      {success && <div style={{ color: '#4ade80', fontWeight: 500 }}>Job posted successfully!</div>}
      <button type="submit" disabled={loading} style={{ background: '#7b8cff', color: '#fff', border: 'none', borderRadius: '0.7rem', padding: '1rem', fontWeight: 600, fontSize: '1.1rem', cursor: 'pointer', marginTop: '0.5rem' }}>{loading ? 'Posting...' : 'Post Job'}</button>
    </form>
  );
};
// Auth Modal Component
const AuthModal = ({ mode, setMode, setShow, setUser }) => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'candidate' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const url = mode === 'signup' ? 'http://localhost:3001/api/auth/signup' : 'http://localhost:3001/api/auth/login';
      const body = mode === 'signup' ? form : { email: form.email, password: form.password };
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Auth failed');
      setUser(data.user);
      setShow(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#000a', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <form onSubmit={handleSubmit} style={{ background: '#151c2c', padding: '2rem', borderRadius: '1rem', minWidth: 320, color: '#e0e6f6', boxShadow: '0 4px 32px #0006', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h2 style={{ fontWeight: 700, fontSize: '1.5rem', marginBottom: '0.5rem' }}>{mode === 'signup' ? 'Sign Up' : 'Login'}</h2>
        {mode === 'signup' && (
          <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required style={{ padding: '0.7rem', borderRadius: '0.5rem', border: 'none', background: '#232b3e', color: '#e0e6f6' }} />
        )}
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required style={{ padding: '0.7rem', borderRadius: '0.5rem', border: 'none', background: '#232b3e', color: '#e0e6f6' }} />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required style={{ padding: '0.7rem', borderRadius: '0.5rem', border: 'none', background: '#232b3e', color: '#e0e6f6' }} />
        {mode === 'signup' && (
          <select name="role" value={form.role} onChange={handleChange} style={{ padding: '0.7rem', borderRadius: '0.5rem', border: 'none', background: '#232b3e', color: '#e0e6f6' }}>
            <option value="candidate">Candidate</option>
            <option value="employer">Employer</option>
          </select>
        )}
        {error && <div style={{ color: '#ff6b6b', fontWeight: 500 }}>{error}</div>}
        <button type="submit" disabled={loading} style={{ background: '#7b8cff', color: '#fff', border: 'none', borderRadius: '0.7rem', padding: '0.8rem', fontWeight: 600, fontSize: '1.1rem', cursor: 'pointer', marginTop: '0.5rem' }}>{loading ? 'Please wait...' : (mode === 'signup' ? 'Sign Up' : 'Login')}</button>
        <div style={{ marginTop: '0.5rem', fontSize: '0.95rem' }}>
          {mode === 'signup' ? (
            <>Already have an account? <span style={{ color: '#7b8cff', cursor: 'pointer' }} onClick={() => setMode('login')}>Login</span></>
          ) : (
            <>Don't have an account? <span style={{ color: '#7b8cff', cursor: 'pointer' }} onClick={() => setMode('signup')}>Sign Up</span></>
          )}
        </div>
        <span style={{ color: '#b0b8d1', cursor: 'pointer', marginTop: '0.5rem', textAlign: 'center' }} onClick={() => setShow(false)}>Cancel</span>
      </form>
    </div>
  );
};

// Footer Component
const Footer = () => (
  <footer style={{ textAlign: 'center', color: '#b0b8d1', fontSize: '1rem', padding: '2rem 0 1rem 0', background: 'transparent' }}>
    © 2025 JobBoard. All rights reserved.
  </footer>
);

// Home Page Component
const HomePage = ({ onSearch, allJobs, navigateTo }) => {
  const [query, setQuery] = useState('');
  const featuredJobs = allJobs.slice(0, 3); // Get first 3 jobs as featured

  const handleSearch = (e) => {
    e.preventDefault();
    if (query) {
      onSearch(query);
    }
  };

  return (
  <section style={{ background: '#151c2c', borderRadius: '1.5rem', padding: '2.5rem 4vw 2rem 4vw', marginBottom: '2.5rem', boxShadow: '0 4px 24px #0003', textAlign: 'center', width: '100%', maxWidth: '900px', marginLeft: 'auto', marginRight: 'auto' }}>
      <h1 style={{ fontSize: '2.7rem', fontWeight: 800, marginBottom: '0.5rem', color: '#fff' }}>Find Your Dream Job</h1>
      <p style={{ fontSize: '1.25rem', color: '#b0b8d1', marginBottom: '2rem' }}>Browse thousands of job openings from top companies.</p>
      <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: '1rem', maxWidth: '600px', margin: '0 auto' }}>
        <input
          type="text"
          placeholder="Search for jobs..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ flex: 1, background: '#232b3e', border: 'none', borderRadius: '2rem', padding: '1rem 1.5rem', color: '#e0e6f6', fontSize: '1.1rem', outline: 'none', marginRight: '0.5rem' }}
        />
        <button type="submit" style={{ background: '#7b8cff', color: '#fff', border: 'none', borderRadius: '2rem', padding: '0.9rem 2.2rem', fontWeight: 600, fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 2px 8px #0002' }}>Search</button>
      </form>
      <div style={{ marginTop: '2.5rem', textAlign: 'left', paddingLeft: '0.5rem' }}>
        <h2 style={{ fontWeight: 700, fontSize: '2rem', color: '#fff', marginBottom: '1.5rem' }}>Featured Jobs</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {featuredJobs.map(job => (
            <JobCard key={job._id} job={job} navigateTo={() => navigateTo('details', job)} isFeatured={true} />
          ))}
        </div>
      </div>
    </section>
  );
};

// Job Listing Page Component
const JobListingPage = ({ jobs, navigateTo }) => (
  <div style={{ padding: '2rem 0' }}>
    <h1 style={{ fontWeight: 700, fontSize: '2.2rem', color: '#fff', marginBottom: '1.5rem' }}>All Job Listings</h1>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
      {jobs.length > 0 ? (
        jobs.map(job => (
          <JobCard key={job._id} job={job} navigateTo={() => navigateTo('details', job)} />
        ))
      ) : (
        <div style={{ background: '#151c2c', borderRadius: '1.2rem', padding: '3rem 0', textAlign: 'center', color: '#b0b8d1', fontSize: '1.3rem', minHeight: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 12px #0002', gridColumn: '1/-1' }}>
          <div style={{ fontSize: '3rem', color: '#7b8cff', marginBottom: '1rem', border: '3px solid #232b3e', borderRadius: '50%', width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✖</div>
          No jobs found matching your search.
        </div>
      )}
    </div>
  </div>
);

// Job Card Component for listings
const JobCard = ({ job, navigateTo, isFeatured = false }) => (
  <div className={`p-6 bg-gray-800 text-gray-200 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 ${isFeatured ? 'border-2 border-indigo-600' : ''}`}>
    <h3 className="text-xl font-bold text-white mb-2">{job.title}</h3>
    <p className="text-sm text-gray-400 mb-1 flex items-center">
      <Building size={16} className="mr-2 text-indigo-400" />
      {job.company}
    </p>
    <p className="text-sm text-gray-400 mb-4 flex items-center">
      <MapPin size={16} className="mr-2 text-indigo-400" />
      {job.location}
    </p>
    <p className="text-sm text-gray-400 mb-4 line-clamp-3">{job.description}</p>
    <div className="flex justify-between items-center mt-4">
      <span className="bg-gray-700 text-gray-200 text-xs font-semibold px-2.5 py-1 rounded-full">
        {job.type}
      </span>
      <button
        onClick={navigateTo}
        className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors duration-300"
      >
        View Details
      </button>
    </div>
  </div>
);

// Job Detail Page Component
const JobDetailPage = ({ job, navigateTo, user }) => {
  if (!job) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl text-gray-400">Job not found.</h1>
        <button onClick={() => navigateTo('listings')} className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-md">
          Back to Listings
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-8 lg:p-12">
      <button
        onClick={() => navigateTo('listings')}
        className="text-indigo-400 hover:text-indigo-200 flex items-center mb-6"
      >
        <ChevronLeft size={20} className="mr-1" />
        Back to Listings
      </button>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 pb-4 border-b border-gray-700">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{job.title}</h1>
          <p className="text-lg text-gray-400 mb-1 flex items-center">
            <Building size={20} className="mr-2 text-indigo-400" />
            {job.company}
          </p>
          <p className="text-md text-gray-400 flex items-center">
            <MapPin size={20} className="mr-2 text-indigo-400" />
            {job.location}
          </p>
        </div>
        <div className="mt-4 lg:mt-0 flex items-center space-x-4">
          <span className="bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-full">
            {job.type}
          </span>
          <span className="text-xl font-bold text-green-400">
            {formatSalary(job.salary)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold text-white mb-4">Job Description</h2>
          <p className="text-gray-400 mb-6 leading-relaxed">{job.description}</p>

          <h3 className="text-xl font-bold text-white mb-3">Responsibilities</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-400 mb-6">
            {job.responsibilities.map((r, index) => <li key={index}>{r}</li>)}
          </ul>

          <h3 className="text-xl font-bold text-white mb-3">Qualifications</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-400">
            {job.qualifications.map((q, index) => <li key={index}>{q}</li>)}
          </ul>
        </div>
        <div className="md:col-span-1">
          <div className="bg-gray-700 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Job Summary</h3>
            <div className="space-y-4 text-gray-200">
              <div className="flex items-center">
                <BriefcaseBusiness size={20} className="mr-3 text-indigo-400" />
                <span><span className="font-semibold">Type:</span> {job.type}</span>
              </div>
              <div className="flex items-center">
                <Users size={20} className="mr-3 text-indigo-400" />
                <span><span className="font-semibold">Company:</span> {job.company}</span>
              </div>
              <div className="flex items-center">
                <MapPin size={20} className="mr-3 text-indigo-400" />
                <span><span className="font-semibold">Location:</span> {job.location}</span>
              </div>
              <div className="flex items-center">
                <p className="text-xl font-bold text-green-400">{formatSalary(job.salary)}</p>
              </div>
            </div>
          </div>
          {user && user.role === 'employer' ? (
            <button
              onClick={() => navigateTo('applications', job)}
              className="mt-6 w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition-colors"
            >
              View Applications
            </button>
          ) : (
            <button
              onClick={() => navigateTo('apply', job)}
              className="mt-6 w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-md shadow-md hover:bg-green-700 transition-colors"
            >
              Apply Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Job Application Page Component
const JobApplicationPage = ({ job, user, navigateTo }) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    resume: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`http://localhost:3001/api/jobs/${job._id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          candidateId: user?._id || '',
        }),
      });
      if (!res.ok) throw new Error('Failed to submit application');
      setIsSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-20 bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-green-400 mb-4">Application Submitted! 🎉</h1>
        <p className="text-lg text-gray-300">Thank you for applying to the <span className="font-semibold">{job.title}</span> position at <span className="font-semibold">{job.company}</span>.</p>
        <p className="mt-2 text-md text-gray-400">We will review your application and get back to you shortly.</p>
        <button
          onClick={() => navigateTo('listings')}
          className="mt-6 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 transition-colors"
        >
          Back to Job Listings
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-8 lg:p-12">
      <button
        onClick={() => navigateTo('details', job)}
        className="text-indigo-400 hover:text-indigo-200 flex items-center mb-6"
      >
        <ChevronLeft size={20} className="mr-1" />
        Back to Job Details
      </button>

      <h1 className="text-3xl font-bold text-white mb-4">Apply for {job.title}</h1>
      <p className="text-gray-400 mb-8">Please fill out the form below to submit your application.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-700 shadow-sm bg-gray-700 text-white focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-700 shadow-sm bg-gray-700 text-white focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="resume" className="block text-sm font-medium text-gray-300">Resume (URL or text)</label>
          <input
            type="text"
            id="resume"
            name="resume"
            value={formData.resume}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-700 shadow-sm bg-gray-700 text-white focus:border-indigo-500 focus:ring-indigo-500"
          />
          <p className="mt-1 text-xs text-gray-400">Paste a link to your resume (PDF, DOC, etc.)</p>
        </div>
        {error && <div style={{ color: '#ff6b6b', fontWeight: 500 }}>{error}</div>}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 transition-colors"
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </form>
    </div>
  );
};
// Applications Page (for Employers)
const ApplicationsPage = ({ user, job, navigateTo }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/jobs/${job._id}/applications`);
        if (!res.ok) throw new Error('Failed to fetch applications');
        const data = await res.json();
        setApplications(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [job._id]);

  if (!user || user.role !== 'employer') {
    return <div style={{ color: '#ff6b6b', padding: '2rem', textAlign: 'center' }}>Only employers can view applications.</div>;
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-8 lg:p-12">
      <button
        onClick={() => navigateTo('details', job)}
        className="text-indigo-400 hover:text-indigo-200 flex items-center mb-6"
      >
        <ChevronLeft size={20} className="mr-1" />
        Back to Job Details
      </button>
      <h1 className="text-3xl font-bold text-white mb-4">Applications for {job.title}</h1>
      {loading ? (
        <div className="text-gray-400">Loading applications...</div>
      ) : error ? (
        <div style={{ color: '#ff6b6b' }}>{error}</div>
      ) : applications.length === 0 ? (
        <div className="text-gray-400">No applications yet.</div>
      ) : (
        <ul style={{ marginTop: '1.5rem' }}>
          {applications.map(app => (
            <li key={app._id} style={{ background: '#232b3e', borderRadius: '1rem', padding: '1rem', marginBottom: '1rem', color: '#e0e6f6' }}>
              <div><b>Name:</b> {app.name}</div>
              <div><b>Email:</b> {app.email}</div>
              <div><b>Resume:</b> <a href={app.resume} target="_blank" rel="noopener noreferrer" style={{ color: '#7b8cff' }}>{app.resume}</a></div>
              <div><b>Applied At:</b> {new Date(app.appliedAt).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// CSS for fade-in animations on the homepage
const style = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.8s ease-out forwards;
}

.delay-200 {
  animation-delay: 0.2s;
}
`;

const AppWithStyles = () => (
  <>
    <style>{style}</style>
    <App />
  </>
);

export default AppWithStyles;