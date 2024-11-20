import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import path from 'path';
import mysql from 'mysql';
import { fileURLToPath } from 'url';
import cors from 'cors';


const app = express();
const secretKey = 'secret_key';
app.use(express.json()); // To parse JSON requests
app.use(express.urlencoded({ extended: true })); // To parse form data
//app.use(cors());
app.use(cors({
    origin: 'http://localhost:5500', // Specify the frontend URL
    methods: 'GET,POST',
    allowedHeaders: 'Content-Type'
}));


// Create a connection to the MySQL database hosted on AWS
const connection = mysql.createConnection({
    host: 'group38.cbuiegiyoskb.us-east-2.rds.amazonaws.com',
    user: 'group38',
    password: 'COSC4353group38',
    database: 'FoodBank'
});

// Connect to the database
connection.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.stack);
        return;
    }
    console.log('Connected to database.');
});

// Gracefully close the connection when the server is stopping
process.on('SIGINT', () => {
    connection.end((err) => {
        if (err) {
            console.error('Error closing the database connection:', err.stack);
        } else {
            console.log('Database connection closed.');
        }
        process.exit();
    });
});

//const __filename = fileURLToPath(import.meta.url);
//const __dirname = path.dirname(__filename);

//app.use(express.static(path.join(__dirname, '../html')));

// Serve the default login page when accessing root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../html', 'login.html'));
});
// Hard-coded data for testing purposes
let userProfiles = [{username: "johndoe@gmail.com", password: "hello123"}];
let events = [];

// Authenticate token
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    
    if (token) {
        jwt.verify(token, secretKey, (err, user) => {
            if (err) {
                return res.status(403).json({ message: 'Forbidden' });
            }
            console.log('Decoded JWT payload:', user); // Debugging line
            req.user = user;
            next();
        });
    } else {
        res.status(401).json({ message: 'No token provided' });
    }
}


// Handle User Login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Validate input
    if(!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    // Query database to see if account is valid or not
    connection.query('SELECT * FROM UserProfile WHERE email = ?',[username], async(err,results) => {
        if(err) {
            console.error('ERROR', err);
            return res.status(500).send('Server error');
        }
        console.log('Query Results:', results);
        if(results.length === 0) {
            return res.status(400).send('Invalid username or password!');
        }

        const hashedPass = results[0].password;
        // Check if password matches the hashed password in database
        const isMatch = await bcrypt.compare(password, hashedPass);
        if(!isMatch){
            return res.status(400).send('Invalid username or password!');
        }
        
        const token = jwt.sign({ userId: results[0].id }, secretKey, { expiresIn: '1h' });
        res.json({ token });

        //res.redirect('userHome.html');
    });

    //res.status(200).send("Successfully Logged In");
});

app.get('/getUserFullName', authenticateToken, (req, res) => {
    const userId = req.user.userId;  // Assuming the user ID is in the JWT payload
    // Retrieve the user's full name from the database
    console.log("Hi: ", userId);
    connection.query('SELECT full_name FROM UserProfile WHERE user_id = ?', [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Server error' });
        }
        if (results.length > 0) {
            res.json({ fullName: results[0].full_name });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    });
});

// Handles Registering account
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    console.log('Register route hit');
    if(!username || !password){
        return res.status(400).send('Username and password are required');
    }

    // Query table to see if account exists or not
    connection.query('SELECT * FROM UserProfile WHERE email = ?' ,[username], async(err,results) => {
        if(err) {
            console.error('ERROR', err);
            return res.status(500).send('Server error');
        }
        
        if(results.length > 0) {
            return res.status(400).send('User already exists!');
        }
        
        // Hashes password and stores into the table
        const hashedPass = await bcrypt.hash(password,10);
        connection.query('INSERT INTO UserProfile (email, password) VALUES(?, ?)',[username, hashedPass], (err) => {
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
    const { fullName, address1, address2, city, state, zipcode, skills, preferences, availability } = req.body;

    if (!fullName || fullName.length > 50) {
        return res.status(400).send('Full Name is required and should not exceed 50 characters');
    }
    if (!address1 || address1.length > 100) {
        return res.status(400).send('Address1 is required and should not exceed 100 characters');
    }
    if (!city || city.length > 100) {
        return res.status(400).send('City is required and should not exceed 100 characters');
    }
    if (!state || state.length > 10) {
        return res.status(400).send('State is required and should not exceed 10 characters');
    }
    if (!zipcode || zipcode.length > 9) {
        return res.status(400).send('Zipcode is required and should not exceed 9 characters');
    }
    if (!skills || skills.length === 0) {
        return res.status(400).send('At least one skill is required');
    }
    if (!availability || availability.length === 0) {
        return res.status(400).send('At least one availability day is required');
    }

    const sql = `
        INSERT INTO UserProfile (full_name, address1, address2, city, state, zipcode, skills, preferences, availability)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
        fullName,
        address1,
        address2 || null,
        city,
        state,
        zipcode,
        JSON.stringify(skills),
        preferences || null,
        JSON.stringify(availability)
    ];

    connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting user profile:', err);
            return res.status(500).send('Database error');
        }
        res.status(200).send('Profile saved successfully');
    });
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

    // Insert the event into the database
    const sql = `
        INSERT INTO EventDetails (event_name, event_description, location, required_skills, urgency, event_date)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [
        eventName,
        eventDescription,
        location,
        JSON.stringify(requiredSkills),
        urgency,
        eventDate
    ];

    connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting event data:', err);
            return res.status(500).send('Database error');
        }
        res.status(200).send('Event created successfully');
    });
});

// Fetch event data
app.get('/events', (req, res) => {
    const sql = `
        SELECT 
            event_id, 
            event_name, 
            event_description, 
            location, 
            required_skills, 
            urgency, 
            event_date, 
            participants 
        FROM EventDetails
    `;

    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching events:', err);
            return res.status(500).send('Database error');
        }

        // Parse JSON fields and calculate participant count
        const events = results.map(event => ({
            ...event,
            required_skills: event.required_skills ? JSON.parse(event.required_skills) : [],
            participants: event.participants ? JSON.parse(event.participants) : [],
            participant_count: event.participants ? JSON.parse(event.participants).length : 0,
        }));

        res.status(200).json(events);
    });
});


//Update events
app.put('/events/:id', (req, res) => {
    const eventId = req.params.id;
    const { event_name, event_description, location, urgency, event_date, required_skills } = req.body;

    if (!event_name || !event_description || !location || !urgency || !event_date || !required_skills) {
        return res.status(400).send('All fields are required');
    }

    const sql = `
        UPDATE EventDetails
        SET event_name = ?, event_description = ?, location = ?, urgency = ?, event_date = ?, required_skills = ?
        WHERE event_id = ?
    `;
    connection.query(
        sql,
        [event_name, event_description, location, urgency, event_date, JSON.stringify(required_skills), eventId],
        (err, result) => {
            if (err) {
                console.error('Error updating event:', err);
                return res.status(500).send('Database error');
            }
            if (result.affectedRows === 0) {
                return res.status(404).send('Event not found');
            }
            res.status(200).send('Event updated successfully');
        }
    );
});



//Remove events
app.delete('/events/:id', (req, res) => {
    const eventId = req.params.id;

    const sql = 'DELETE FROM EventDetails WHERE event_id = ?';
    connection.query(sql, [eventId], (err, result) => {
        if (err) {
            console.error('Error deleting event:', err);
            return res.status(500).send('Database error');
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('Event not found');
        }
        res.status(200).send('Event deleted successfully');
    });
});

//Apply for Event
app.post('/events/:id/apply', (req, res) => {
    const eventId = req.params.id;
    const { userId, userSkills } = req.body;

    // Fetch the event's required skills and participants
    const sqlFetch = `
        SELECT required_skills, participants
        FROM EventDetails
        WHERE event_id = ?
    `;
    connection.query(sqlFetch, [eventId], (err, results) => {
        if (err) {
            console.error('Error fetching event details:', err);
            return res.status(500).send('Database error');
        }
        if (results.length === 0) {
            return res.status(404).send('Event not found');
        }

        const event = results[0];
        const requiredSkills = JSON.parse(event.required_skills || '[]');
        const participants = JSON.parse(event.participants || '[]');

        // Check if user's skills match the required skills
        const hasRequiredSkills = requiredSkills.every(skill => userSkills.includes(skill));
        if (!hasRequiredSkills) {
            return res.status(400).send('You do not meet the required skills for this event.');
        }

        // Check if user is already a participant
        if (participants.includes(userId)) {
            return res.status(400).send('You have already applied for this event.');
        }

        // Add the user to the participants list
        participants.push(userId);
        const sqlUpdate = `
            UPDATE EventDetails
            SET participants = ?
            WHERE event_id = ?
        `;
        connection.query(sqlUpdate, [JSON.stringify(participants), eventId], (updateErr) => {
            if (updateErr) {
                console.error('Error updating participants:', updateErr);
                return res.status(500).send('Database error');
            }
            res.status(200).send('Successfully applied for the event.');
        });
    });
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

        // Check if both volunteerId and eventId are provided, with a specific message if both are missing
        if (!volunteerId && !eventId) {
            return res.status(400).json({ error: 'Volunteer ID and Event ID are required' });
        }
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

// Start the server and export the instance
//const server = 
app.listen(3000, () => console.log('Server running on port 3000'));

//export default server;  // Export the server instance for testing


