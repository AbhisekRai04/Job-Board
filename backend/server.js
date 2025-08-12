// ...existing code...

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3001;

// Replace with your MongoDB connection string.
// Example for local DB: 'mongodb://localhost:27017/jobboard'
// Example for MongoDB Atlas: 'mongodb+srv://user:password@cluster.mongodb.net/jobboard?retryWrites=true&w=majority'
const MONGODB_URI = 'mongodb://localhost:27017/jobboard';

// Use CORS to allow the React frontend to make requests
app.use(cors());
app.use(express.json());

// --- Database Connection ---
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB.');
    // Start the server only after the database connection is successful
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });

// --- Mongoose Schema and Model ---

// User Schema (for authentication)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['employer', 'candidate'], required: true },
});
const User = mongoose.model('User', userSchema);

// Job Schema
const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  type: { type: String, required: true },
  description: { type: String, required: true },
  responsibilities: [{ type: String }],
  qualifications: [{ type: String }],
  salary: { type: String },
  postedDate: { type: Date, default: Date.now },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});
const Job = mongoose.model('Job', jobSchema);

// Application Schema
const applicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  email: String,
  resume: String, // For simplicity, just store filename or URL
  appliedAt: { type: Date, default: Date.now },
});
const Application = mongoose.model('Application', applicationSchema);
// Get all employers
app.get('/api/employers', async (req, res) => {
  try {
    const employers = await User.find({ role: 'employer' }, '-password');
    res.json(employers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all candidates
app.get('/api/candidates', async (req, res) => {
  try {
    const candidates = await User.find({ role: 'candidate' }, '-password');
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get candidates who applied to jobs posted by a specific employer
app.get('/api/employer/:employerId/applicants', async (req, res) => {
  try {
    // Find jobs posted by this employer
    const jobs = await Job.find({ postedBy: req.params.employerId });
    const jobIds = jobs.map(j => j._id);
    // Find applications to these jobs
    const applications = await Application.find({ job: { $in: jobIds } }).populate('candidate', 'name email');
    // Group by candidate
    const candidates = {};
    applications.forEach(app => {
      if (!candidates[app.candidate._id]) {
        candidates[app.candidate._id] = { ...app.candidate.toObject(), jobs: [] };
      }
      candidates[app.candidate._id].jobs.push(app.job);
    });
    res.json(Object.values(candidates));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// ...existing code...
// A complete Node.js and Express.js backend using MongoDB.
// This code provides API endpoints for:
// - GET /api/jobs: Get all job listings
// - POST /api/jobs: Create a new job listing
// - GET /api/jobs/:id: Get a specific job listing by ID

// --- Authentication Endpoints (Basic, no JWT for now) ---
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) return res.status(400).json({ message: 'All fields required' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });
    const user = new User({ name, email, password, role });
    await user.save();
    res.status(201).json({ message: 'Signup successful', user: { _id: user._id, name, email, role } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    res.json({ message: 'Login successful', user: { _id: user._id, name: user.name, email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// --- Job Application Endpoint ---
app.post('/api/jobs/:id/apply', async (req, res) => {
  try {
    const { name, email, resume, candidateId } = req.body;
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    const application = new Application({
      job: job._id,
      candidate: candidateId,
      name,
      email,
      resume,
    });
    await application.save();
    res.status(201).json({ message: 'Application submitted', application });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// --- Get Applications for a Job (for Employers) ---
app.get('/api/jobs/:id/applications', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    const applications = await Application.find({ job: job._id }).populate('candidate', 'name email');
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- API Endpoints ---

// POST a new job listing
app.post('/api/jobs', async (req, res) => {
  try {
    const newJob = new Job(req.body);
    await newJob.save();
    res.status(201).json(newJob);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET all job listings
app.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await Job.find();
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET a single job listing by ID
app.get('/api/jobs/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
