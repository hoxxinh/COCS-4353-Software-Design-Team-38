import express from 'express';

const app = express();
app.use(express.json()); // To parse JSON requests

// Hard-coded data for testing purposes
let userProfiles = [{username: "johndoe@gmail.com", password: "hello123"}];
let events = [];

// Handle User Login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Validate input
    if(!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    // Checks if user exists and password is correct
    const user = userProfiles.find(user => user.username === username && user.password === password);
    
    if(!user){
        return res.status(400).send('Invalid username or password!');
    }

    res.status(200).send("Successfully Logged In");
});

// Handles Registering account
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    if(!username || !password){
        return res.status(400).send('Username and password are required');
    }

    const existingUser = userProfiles.find(user => user.username === username);
    if (existingUser) {
        return res.status(400).send('User already exists!');
    }
    
    userProfiles.push({ username, password});
    res.status(200).send("Successfully Registered");
});

// Handle User Profile submission
app.post('/submitProfile', (req, res) => {
    const { fullName, address1, address2, city, state, zip, skills, preferences, availability } = req.body;

    // Backend validations
    if (!fullName || fullName.length > 50) {
        return res.status(400).send('Full Name is required and should not exceed 50 characters');
    }
    if (!address1 || address1.length > 100) {
        return res.status(400).send('Address1 is required and should not exceed 100 characters');
    }
    if (!city || city.length > 100) {
        return res.status(400).send('City is required and should not exceed 100 characters');
    }
    if (!state) {
        return res.status(400).send('State is required');
    }
    if (!zip || zip.length < 5 || zip.length > 9) {
        return res.status(400).send('Zip code should be between 5-9 characters');
    }
    if (!skills || skills.length === 0) {
        return res.status(400).send('At least one skill is required');
    }
    if (!availability || availability.length === 0) {
        return res.status(400).send('At least one availability day is required');
    }

    // Add profile to hard-coded list
    userProfiles.push({
        fullName, address1, address2, city, state, zip, skills, preferences, availability
    });

    res.status(200).send('Profile saved successfully');
});

// Handle Event creation
app.post('/createEvent', (req, res) => {
    const { eventName, eventDescription, location, requiredSkills, urgency, eventDate } = req.body;

    // Back-end validations
    if (!eventName || eventName.length > 100) {
        return res.status(400).send('Event Name is required and should not exceed 100 characters');
    }
    if (!eventDescription) {
        return res.status(400).send('Event Description is required');
    }
    if (!location) {
        return res.status(400).send('Location is required');
    }
    if (!requiredSkills || requiredSkills.length === 0) {
        return res.status(400).send('At least one required skill is required');
    }
    if (!urgency) {
        return res.status(400).send('Urgency is required');
    }
    if (!eventDate) {
        return res.status(400).send('Event Date is required');
    }

    // Add event to the hard-coded list
    events.push({
        eventName, eventDescription, location, requiredSkills, urgency, eventDate
    });

    res.status(200).send('Event created successfully');
});
let volunteerHistory = [
    {
        eventName: 'Food Drive',
        description: 'Organized a food drive at the community center.',
        location: 'Community Center',
        date: '2023-09-15',
        status: 'Completed'
    },
    {
        eventName: 'Distribution Day',
        description: 'Distributed food to families in need.',
        location: 'Local Church',
        date: '2023-10-05',
        status: 'Pending'
    }
];

// Volunteer History Route
app.get('/volunteer/history', (req, res) => {
    if (req.query.empty === 'true') {
        return res.status(200).json([]);
    }
    res.status(200).json(volunteerHistory);
});


// Volunteer Matching Route
app.post('/match', (req, res) => {
    const { volunteerId, eventId } = req.body;

    if (!volunteerId && !eventId) {
        return res.status(400).json({ error: 'Volunteer ID and Event ID are required' });
    } else if (!eventId) {
        return res.status(400).json({ error: 'Event ID is required' });
    } else if (!volunteerId) {
        return res.status(400).json({ error: 'Volunteer ID is required' });
    }

    // Sample data for validation
    const existingVolunteers = ['john', 'jane', 'nigel'];
    const existingEvents = ['foodDrive', 'distributionDay'];

    if (!existingVolunteers.includes(volunteerId) || !existingEvents.includes(eventId)) {
        return res.status(404).json({ error: 'Volunteer or event not found' });
    }

    res.status(200).json({ message: `Volunteer ${volunteerId.charAt(0).toUpperCase() + volunteerId.slice(1)} has been matched to event ${eventId}` });
});

// Start the server
app.listen(3000, () => console.log('Server running on port 3000'));

export default app;



