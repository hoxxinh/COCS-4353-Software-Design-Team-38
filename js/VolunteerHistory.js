const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(bodyParser.json());
app.use(cors());

// Simulated volunteer history data
const volunteerHistory = [
    {
        eventName: "Food Drive",
        description: "Organized a food drive at the community center.",
        location: "Community Center",
        date: "2023-09-15",
        status: "Completed"
    },
    {
        eventName: "Distribution Day",
        description: "Distributed food to families in need.",
        location: "Local Church",
        date: "2023-10-05",
        status: "Pending"
    }
];

// Get volunteer history
app.get('/volunteer/history', (req, res) => {
    res.json(volunteerHistory);
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
