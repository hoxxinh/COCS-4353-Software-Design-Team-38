// Simulated volunteers and events data
const volunteers = [
    { id: 'Nigel', name: 'Nigel Hart' },
    { id: 'Casper', name: 'Casper Nguyen' }
];

const events = [
    { id: 'foodDrive', name: 'Food Drive' },
    { id: 'distributionDay', name: 'Distribution Day' }
];

// Route to match volunteer to an event
app.post('/match', (req, res) => {
    const { volunteerId, eventId } = req.body;

    if (!volunteerId || !eventId) {
        return res.status(400).json({ error: 'Volunteer ID and Event ID are required' });
    }

    const volunteer = volunteers.find(v => v.id === volunteerId);
    const event = events.find(e => e.id === eventId);

    if (!volunteer) {
        return res.status(404).json({ error: 'Volunteer not found' });
    }
    if (!event) {
        return res.status(404).json({ error: 'Event not found' });
    }

    res.status(200).json({ message: `Volunteer ${volunteer.name} matched to event ${event.name}` });
});
