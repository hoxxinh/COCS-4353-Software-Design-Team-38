document.getElementById('profileForm').onsubmit = function(event) {
    const skillsCheckboxes = document.querySelectorAll('#skills input[type="checkbox"]');
    const availabilityCheckboxes = document.querySelectorAll('#availability input[type="checkbox"]');
    let isSkillsChecked = false;
    let isAvailabilityChecked = false;

    for (const checkbox of skillsCheckboxes) {
        if (checkbox.checked) {
            isSkillsChecked = true;
            break;
        }
    }

    for (const checkbox of availabilityCheckboxes) {
        if (checkbox.checked) {
            isAvailabilityChecked = true;
            break;
        }
    }

    if (!isSkillsChecked) {
        event.preventDefault();
        alert('Please select at least one skill.');
        return;
    }

    if (!isAvailabilityChecked) {
        event.preventDefault();
        alert('Please select at least one day for availability.');
        return;
    }

    if (!this.checkValidity()) {
        event.preventDefault();
        alert('Please fill in all required fields.');
    }
};