const express = require('express');
const app = express();
app.use(express.json()); // To parse JSON requests

// Hard-coded data for testing purposes
let userProfiles = [];

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

// Start the server
app.listen(3000, () => console.log('Server running on port 3000'));
