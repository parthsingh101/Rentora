import authRoutes from './routes/auth.js';
import unitRoutes from './routes/units.js';
import tenantRoutes from './routes/tenants.js';
import assignmentRoutes from './routes/assignments.js';
// import propertyRoutes from './routes/properties.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Connect to Database
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected to Express Server'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/assignments', assignmentRoutes);
// app.use('/api/properties', propertyRoutes);

app.get('/', (req, res) => {
  res.send('Rentora Backend API is running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
