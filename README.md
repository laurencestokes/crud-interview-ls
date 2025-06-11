Endpoints used to retrieve/manipulate mocked data are implemented using MSW library (https://mswjs.io/) and MSW data (https://github.com/mswjs/data).

## List of available BFF endpoints:

GET - https://example.com/user - Retrieve all available users  
GET - https://example.com/user/:id - Retrieve user with a certain id  
POST - https://example.com/user - Create a new user. Provide first name  
PUT - https://example.com/user/:id - Edit a user. Provide first name  
DELETE - https://example.com/user/:id - Delete a user
