const nodemailer = require('nodemailer');

notificationCount = document.getElementById('notification-count');
notificationList = document.getElementById('notifications-list');
clearAllButton = document.getElementById('clear-all');


let notifications = []

// Add new notifications to front of array
function addNotification(type, message) {
    let newId;
    if (notifications.length > 0) {
        newId = notifications[notifications.length - 1].id + 1;
    } else {
        newId = 1;
    }
    notifications.unshift({ id: newId, type, message, isNew: true });
    Notifications();
    updateNotificationCount();
}

// Displays notifications
function Notifications() {
    if (notifications.length === 0) {
        notificationList.innerHTML = '<div class="notification-item">No new notifications</div>';
    } else {
        notifications.forEach(notification => {
            const notificationItem = document.createElement('div');
            notificationItem.classList.add('notification-item');
            if (notification.isNew) notificationItem.classList.add('new');
            notificationItem.dataset.id = notification.id;

            let typeLabel = document.createElement('span');
            typeLabel.classList.add('notification-type', notification.type);
            typeLabel.innerText = notification.type.charAt(0).toUpperCase() + notification.type.slice(1);

            notificationItem.appendChild(typeLabel);
            notificationItem.appendChild(document.createTextNode(notification.message));
            notificationList.appendChild(notificationItem);
        });
    }
}

// Updates number display of notifications
function updateNotificationCount() {
    let newNotificationCount = notifications.filter(n => n.isNew).length;
    notificationCount.innerText = newNotificationCount;
}

// Clears all notifications and updates count
if (clearAllButton) {
    clearAllButton.addEventListener('click', () => {
      notifications.length = 0;
      Notifications();
      updateNotificationCount();
    });
  }

// Transporter object using the default SMTP transport for Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'test-email@gmail.com', // Fake email for now
        pass: 'test-password' // Fake password
    }
});

function sendEmail(toEmail, subject, textMessage) {
    const mailOptions = {
        from: 'sender-email@gmail.com', 
        to: toEmail,
        subject: subject, 
        text: textMessage,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Email sent: ' + info.response);
    });
}

  
