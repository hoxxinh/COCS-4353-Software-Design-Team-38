document.getElementById('profileForm').onsubmit = function(event) {
    event.preventDefault();
    console.log('Form submission triggered');

    const skillsCheckboxes = document.querySelectorAll('#skills input[type="checkbox"]:checked');
    const availabilityCheckboxes = document.querySelectorAll('#availability input[type="checkbox"]:checked');

    if (skillsCheckboxes.length === 0) {
        alert('Please select at least one skill.');
        return;
    }

    if (availabilityCheckboxes.length === 0) {
        alert('Please select at least one day for availability.');
        return;
    }

    const formData = {
        fullName: document.getElementById('full-name').value,
        address1: document.getElementById('address1').value,
        address2: document.getElementById('address2').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        zipcode: document.getElementById('zipcode').value,
        skills: Array.from(skillsCheckboxes).map(cb => cb.value),
        preferences: document.getElementById('preferences').value,
        availability: Array.from(availabilityCheckboxes).map(cb => cb.value),
    };

    console.log('Submitting form data:', formData);

    fetch('http://localhost:3000/submitProfile', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(err => {
                throw new Error(err);
            });
        }
        return response.text();
    })
    .then(data => {
        console.log('Response:', data);
        alert(data);
    })
    .catch(error => {
        console.error('Error:', error);
        alert(`An error occurred. ${error.message}`);
    });
};
