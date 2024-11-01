import { use, expect } from 'chai';  // Import use and expect from chai
import chaiHttp from 'chai-http';  // Import chai-http for making HTTP requests
import app from '../app.js';  // Import your Express app
import db from './db.js';

// Apply chai-http plugin to chai
const chai = use(chaiHttp);

describe('FoodBank Unit Test', () => {
    after((done) => {
        // Close the database connection after all tests run
        db.end((err) => {
            if (err) return console.error('Error closing the connection:', err);
            console.log('Database connection closed.');
            done();
        });
    });

    describe('Event Management API', () => {
        describe('POST /createEvent', () => {
            it('should create a new event successfully', (done) => {
                const event = {
                    eventName: 'Test Event',
                    eventDescription: 'This is a test event description',
                    location: 'Test Location',
                    requiredSkills: ['leadership', 'teamwork'],
                    urgency: 'medium',
                    eventDate: '2024-10-20'
                };
                // Use chai.request to make the HTTP request
                chai.request(app)
                    .post('/createEvent')
                    .send(event)
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        expect(res.text).to.equal('Event created successfully');
                        done();
                    });
            });

            it('should fail if event name exceeds 100 characters', (done) => {
                const event = {
                    eventName: 'A'.repeat(101),  // Exceeds the 100 character limit
                    eventDescription: 'This is a test event description',
                    location: 'Test Location',
                    requiredSkills: ['leadership'],
                    urgency: 'high',
                    eventDate: '2024-10-20'
                };
                // Use chai.request to make the HTTP request
                chai.request(app)
                    .post('/createEvent')
                    .send(event)
                    .end((err, res) => {
                        expect(res).to.have.status(400);
                        expect(res.text).to.equal('Event Name is required and should not exceed 100 characters');
                        done();
                    });
            });

            it('should fail if required skills are not provided', (done) => {
                const event = {
                    eventName: 'Another Test Event',
                    eventDescription: 'This is a test event description',
                    location: 'Test Location',
                    urgency: 'low',
                    eventDate: '2024-10-20'
                };
                // Use chai.request to make the HTTP request
                chai.request(app)
                    .post('/createEvent')
                    .send(event)
                    .end((err, res) => {
                        expect(res).to.have.status(400);
                        expect(res.text).to.equal('At least one required skill is required');
                        done();
                    });
            });
        });
    });

    describe('User Profile Management API', () => {
        describe('POST /submitProfile', () => {
            it('should create a new user profile successfully', (done) => {
                const profile = {
                    fullName: 'John Doe',
                    address1: '123 Main St',
                    address2: 'Apt 4B',
                    city: 'Houston',
                    state: 'TX',
                    zip: '77001',
                    skills: ['coding', 'management'],
                    preferences: 'remote',
                    availability: ['Monday', 'Wednesday']
                };
                // Use chai.request to make the HTTP request
                chai.request(app)
                    .post('/submitProfile')
                    .send(profile)
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        expect(res.text).to.equal('Profile saved successfully');
                        done();
                    });
            });

            it('should fail if fullName exceeds 50 characters', (done) => {
                const profile = {
                    fullName: 'A'.repeat(51),  // Exceeds the 50 character limit
                    address1: '123 Main St',
                    city: 'Houston',
                    state: 'TX',
                    zip: '77001',
                    skills: ['coding'],
                    preferences: 'remote',
                    availability: ['Monday', 'Wednesday']
                };
                chai.request(app)
                    .post('/submitProfile')
                    .send(profile)
                    .end((err, res) => {
                        expect(res).to.have.status(400);
                        expect(res.text).to.equal('Full Name is required and should not exceed 50 characters');
                        done();
                    });
            });

            it('should fail if address1 is missing', (done) => {
                const profile = {
                    fullName: 'John Doe',
                    city: 'Houston',
                    state: 'TX',
                    zip: '77001',
                    skills: ['coding'],
                    preferences: 'remote',
                    availability: ['Monday', 'Wednesday']
                };
                chai.request(app)
                    .post('/submitProfile')
                    .send(profile)
                    .end((err, res) => {
                        expect(res).to.have.status(400);
                        expect(res.text).to.equal('Address1 is required and should not exceed 100 characters');
                        done();
                    });
            });

            it('should fail if zip is invalid', (done) => {
                const profile = {
                    fullName: 'John Doe',
                    address1: '123 Main St',
                    city: 'Houston',
                    state: 'TX',
                    zip: '12',  // Invalid zip (less than 5 characters)
                    skills: ['coding'],
                    preferences: 'remote',
                    availability: ['Monday', 'Wednesday']
                };
                chai.request(app)
                    .post('/submitProfile')
                    .send(profile)
                    .end((err, res) => {
                        expect(res).to.have.status(400);
                        expect(res.text).to.equal('Zip code should be between 5-9 characters');
                        done();
                    });
            });

            it('should fail if no skills are provided', (done) => {
                const profile = {
                    fullName: 'John Doe',
                    address1: '123 Main St',
                    city: 'Houston',
                    state: 'TX',
                    zip: '77001',
                    preferences: 'remote',
                    availability: ['Monday', 'Wednesday']
                };
                chai.request(app)
                    .post('/submitProfile')
                    .send(profile)
                    .end((err, res) => {
                        expect(res).to.have.status(400);
                        expect(res.text).to.equal('At least one skill is required');
                        done();
                    });
            });
        });
    });

    describe('Login', () => {
        describe('POST /login', () => {
            it('should log in successfully with correct username and password', (done) => {
                const loginData = {
                    username: "johndoe@gmail.com",
                    password: "hello123"
                };

                // Use chai.request to make the HTTP request
                chai.request(app)
                    .post('/login')
                    .send(loginData)  // Sending login credentials
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        expect(res.text).to.equal('Successfully Logged In');
                        done();
                    });
            });

            it('should fail to log in with incorrect credentials', (done) => {
                const loginData = {
                    username: "wrongemail@gmail.com",
                    password: "wrongpassword"
                };

                // Use chai.request to make the HTTP request
                chai.request(app)
                    .post('/login')
                    .send(loginData)  // Sending incorrect login credentials
                    .end((err, res) => {
                        expect(res).to.have.status(400);
                        expect(res.text).to.equal('Invalid username or password!');
                        done();
                    });
            });
        });
    });

    describe('User Registration', () => {
        describe('POST /register', () => {
            it('should register a new user successfully', (done) => {
                const newUser = {
                    username: "janedoe@gmail.com",
                    password: "password123"
                };

                chai.request(app)
                    .post('/register')
                    .send(newUser)
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        expect(res.text).to.equal('Successfully Registered');
                        done();
                    });
            });

            it('should fail if the user already exists', (done) => {
                const existingUser = {
                    username: "janedoe@gmail.com",  // Same username as in previous test
                    password: "password123"
                };

                chai.request(app)
                    .post('/register')
                    .send(existingUser)
                    .end((err, res) => {
                        expect(res).to.have.status(400);
                        expect(res.text).to.equal('User already exists!');
                        done();
                    });
            });

            it('should fail if username is missing', (done) => {
                const newUser = {
                    password: "password123"  // Missing username
                };

                chai.request(app)
                    .post('/register')
                    .send(newUser)
                    .end((err, res) => {
                        expect(res).to.have.status(400);
                        expect(res.text).to.equal('Username and password are required');
                        done();
                    });
            });

            it('should fail if password is missing', (done) => {
                const newUser = {
                    username: "janedoe@gmail.com"  // Missing password
                };

                chai.request(app)
                    .post('/register')
                    .send(newUser)
                    .end((err, res) => {
                        expect(res).to.have.status(400);
                        expect(res.text).to.equal('Username and password are required');
                        done();
                    });
            });

            it('should fail if both username and password are missing', (done) => {
                chai.request(app)
                    .post('/register')
                    .send({})  // Missing both username and password
                    .end((err, res) => {
                        expect(res).to.have.status(400);
                        expect(res.text).to.equal('Username and password are required');
                        done();
                    });
            });
        });
    });

    describe('Volunteer History API', () => {
        it('should return a list of volunteer history successfully', (done) => {
            chai.request(app)
                .get('/volunteer/history')
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('array');
                    expect(res.body.length).to.be.above(0);  // Ensure there's at least one record
                    res.body.forEach(item => {
                        expect(item).to.have.property('eventName');
                        expect(item).to.have.property('description');
                        expect(item).to.have.property('location');
                        expect(item).to.have.property('date');
                        expect(item).to.have.property('status');
                    });
                    done();
                });
        });

        it('should return an empty list if no volunteer history is available', (done) => {
            chai.request(app)
                .get('/volunteer/history?empty=true')  // Request with the empty flag
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('array').that.is.empty;
                    done();
                });
        });
    });

    describe('Volunteer Matching API', () => {
        it('should match a volunteer to an event successfully', (done) => {
            const matchingData = {
                volunteerId: 'nigel',
                eventId: 'foodDrive'
            };

            chai.request(app)
                .post('/match')
                .send(matchingData)
                .end((err, res) => {
                    expect(res).to.have.status(200);  // Check if the status is 200 OK
                    expect(res.body).to.have.property('message');
                    expect(res.body.message).to.equal('Volunteer Nigel has been matched to event foodDrive');
                    done();
                });
        });

        it('should fail if volunteerId or eventId is missing', (done) => {
            const incompleteData = {
                volunteerId: 'john'  // eventId is missing
            };

            chai.request(app)
                .post('/match')
                .send(incompleteData)
                .end((err, res) => {
                    expect(res).to.have.status(400);  // Check for 400 Bad Request
                    expect(res.body).to.have.property('error');
                    expect(res.body.error).to.equal('Event ID is required');
                    done();
                });
        });

        it('should fail if both volunteerId and eventId are missing', (done) => {
            chai.request(app)
                .post('/match')
                .send({})
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.have.property('error');
                    expect(res.body.error).to.equal('Volunteer ID and Event ID are required');
                    done();
                });
        });

        it('should fail if the volunteer or event does not exist', (done) => {
            const nonExistentData = {
                volunteerId: 'nonExistentVolunteer',
                eventId: 'nonExistentEvent'
            };

            chai.request(app)
                .post('/match')
                .send(nonExistentData)
                .end((err, res) => {
                    expect(res).to.have.status(404);  // Check for 404 Not Found
                    expect(res.body).to.have.property('error');
                    expect(res.body.error).to.equal('Volunteer or event not found');
                    done();
                });
        });
    });

});
