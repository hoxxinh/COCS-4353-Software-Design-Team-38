import express from 'express';
import bcrypt from 'bcrypt';
import path from 'path';
import mysql from 'mysql';
import { fileURLToPath } from 'url';

const app = express();
app.use(express.json()); // To parse JSON requests
app.use(express.urlencoded({ extended: true })); // To parse form data

// Create a connection to the MySQL database hosted on AWS
const connection = mysql.createConnection({
    host: 'group38.cbuiegiyoskb.us-east-2.rds.amazonaws.com',  // AWS RDS endpoint
    user: 'group38',  // Your MySQL username
    password: 'COSC4353group38',  // Your MySQL password
    database: 'FoodBank'  // The name of the database you created
});

// Connect to the database
connection.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.stack);
        return;
    }
    console.log('Connected to database.');
});


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, '../html')));

// Serve the default login page when accessing root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../html', 'login.html'));
});
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
    /*const user = userProfiles.find(user => user.username === username && user.password === password);
    

    if(!user){
        return res.status(400).send('Invalid username or password!');
    }*/

    // Query database to see if account is valid or not
    connection.query('SELECT * FROM loginInfo WHERE username = ?',[username], async(err,results) => {
        if(err) {
            console.error('ERROR', err);
            return res.status(500).send('Server error');
        }

        if(results.length === 0) {
            return res.status(400).send('Invalid username or password!');
        }

        const hashedPass = results[0].password_hash;
        // Check if password matches the hashed password in database
        const isMatch = await bcrypt.compare(password, hashedPass);
        if(!isMatch){
            return res.status(400).send('Invalid username or password!');
        }
        res.redirect('userHome.html');
    });

    //res.status(200).send("Successfully Logged In");
});

// Handles Registering account
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if(!username || !password){
        return res.status(400).send('Username and password are required');
    }

    /*const existingUser = userProfiles.find(user => user.username === username);
    if (existingUser) {
        return res.status(400).send('User already exists!');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    userProfiles.push({ username, password: hashedPassword});
    res.status(200).send("Successfully Registered");*/

    // Query table to see if account exists or not
    connection.query('SELECT * FROM loginInfo WHERE username = ?' ,[username], async(err,results) => {
        if(err) {
            console.error('ERROR', err);
            return res.status(500).send('Server error');
        }
        
        if(results.length > 0) {
            return res.status(400).send('User already exists!');
        }
        
        // Hashes password and stores into the table
        const hashedPass = await bcrypt.hash(password,10);
        connection.query('INSERT INTO loginInfo (username, password_hash) VALUES(?, ?)',[username, hashedPass], (err) => {
            if(err) {
                console.error('Error creating user', err);
                return res.status(500).send('Server error');
            }
            res.status(200).send('Successfully Registered');
        });
    });
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

// Volunteer History Route
app.get('/volunteer/history', (req, res) => {
    const { userId } = req.query;  // Expecting a query parameter to identify the volunteer

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    // Query the database to fetch volunteer history for a specific user
    connection.query(
        'SELECT * FROM VolunteerHistory WHERE user_id = ?',
        [userId],
        (err, results) => {
            if (err) {
                console.error('Error fetching volunteer history:', err);
                return res.status(500).json({ error: 'Server error' });
            }
            res.status(200).json(results);
        }
    );
});

// Volunteer Matching Route
app.post('/match', (req, res) => {
    const { volunteerId, eventId } = req.body;

    // Check if volunteerId and eventId are provided, with specific messages for each
    if (!volunteerId) {
        return res.status(400).json({ error: 'Volunteer ID is required' });
    }
    if (!eventId) {
        return res.status(400).json({ error: 'Event ID is required' });
    }

    // First, check if the volunteer exists
    connection.query('SELECT * FROM UserProfile WHERE user_id = ?', [volunteerId], (err, volunteerResults) => {
        if (err) {
            console.error('Error fetching volunteer:', err);
            return res.status(500).json({ error: 'Server error' });
        }
        if (volunteerResults.length === 0) {
            return res.status(404).json({ error: 'Volunteer or event not found' });
        }

        // Next, check if the event exists
        connection.query('SELECT * FROM EventDetails WHERE event_id = ?', [eventId], (err, eventResults) => {
            if (err) {
                console.error('Error fetching event:', err);
                return res.status(500).json({ error: 'Server error' });
            }
            if (eventResults.length === 0) {
                return res.status(404).json({ error: 'Volunteer or event not found' });
            }

            // If both exist, insert a new entry into VolunteerHistory
            connection.query(
                'INSERT INTO VolunteerHistory (user_id, event_id, participation_status, feedback) VALUES (?, ?, "Pending", "")',
                [volunteerId, eventId],
                (err) => {
                    if (err) {
                        console.error('Error inserting into VolunteerHistory:', err);
                        return res.status(500).json({ error: 'Server error' });
                    }
                    res.status(200).json({ message: `Volunteer ${volunteerId} has been matched to event ${eventId}` });
                }
            );
        });
    });
});


// Start the server
app.listen(3000, () => console.log('Server running on port 3000'));

export default app;



