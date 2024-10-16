document.getElementById('eventForm').onsubmit = function(event) {
    event.preventDefault();

    const requiredSkillsCheckboxes = document.querySelectorAll('#required-skills input[type="checkbox"]');
    let isSkillsChecked = false;

    for (const checkbox of requiredSkillsCheckboxes) {
        if (checkbox.checked) {
            isSkillsChecked = true;
            break;
        }
    }

    if (!isSkillsChecked) {
        alert('Please select at least one required skill.');
        return;
    }

    if (!this.checkValidity()) {
        alert('Please fill in all required fields.');
        return;
    }

    // Collect form data
    const formData = {
        eventName: document.getElementById('event-name').value,
        eventDescription: document.getElementById('event-description').value,
        location: document.getElementById('location').value,
        requiredSkills: Array.from(document.querySelectorAll('#required-skills input[type="checkbox"]:checked')).map(cb => cb.value),
        urgency: document.getElementById('urgency').value,
        eventDate: document.getElementById('event-date').value
    };

    // Send data to back end
    fetch('/createEvent', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    })
    .then(response => response.text())
    .then(data => {
        alert(data);
    })
    .catch(error => console.error('Error:', error));
};
