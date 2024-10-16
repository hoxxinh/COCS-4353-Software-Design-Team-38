import { use, expect } from 'chai';  // Import use and expect from chai
import chaiHttp from 'chai-http';  // Import chai-http for making HTTP requests
import app from '../app.js';  // Import your Express app

// Apply chai-http plugin to chai
const chai = use(chaiHttp);

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