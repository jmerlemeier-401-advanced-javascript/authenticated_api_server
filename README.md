# LAB - 15

## Authenticated API Server

### Author: Julie Erlemeier and Jonathan Kimball

### Links and Resources
* [submission PR](http://xyz.com)
* [travis](http://xyz.com)
* [back-end](http://xyz.com) (when applicable)
* [front-end](http://xyz.com) (when applicable)

#### Documentation
* [api docs](http://xyz.com) (API servers)
* [jsdoc](http://xyz.com) (Server assignments)
* [styleguide](http://xyz.com) (React assignments)

### Modules
#### `modulename.js`
##### Exported Values and Methods

###### `foo(thing) -> string`
Usage Notes or examples

###### `bar(array) -> array`
Usage Notes or examples

### Setup
#### `.env` requirements
* `PORT` - Port Number
* `MONGODB_URI` - URL to the running mongo instance/db

#### Running the app
* `npm start`
* Endpoint: `/foo/bar/`
  * Returns a JSON object with abc in it.
* Endpoint: `/bing/zing/`
  * Returns a JSON object with xyz in it.
  
#### Tests
* How do you run tests?
* What assertions were made?
* What assertions need to be / should be made?

#### UML
Link to an image of the UML for your application and response to events

***

# Week 3 Capstone

## Authenticated API Server

> This is a GRADED pair programming assignment.  Please take the next 2 hours to complete the following tasks.

Implement a fully functional API server *WITH* authentication for sharing images hosted on the internet, using all the coding techiniques we have gone over in the previous 2 blocks.

### Requirements
- This project will follow our standard [lab requirements](https://github.com/codefellows/seattle-javascript-401d32/blob/master/reference/submission-instructions/labs/README.md) for configuration, and deployment!
- Your API must contain the following functionality:


    #### Routes
    - Authentication routes using the following:
        - Basic Authentication routes:
            - `POST /signin`
                - Returns a token in exchange for a username and password encoded in to a base64 string in an authorization header.
            - `POST /signup`
                - Returns a token when a json object with username, password, and email is sent in the request body.   
            
        - BONUS POINTS: Authentication using a third party authentication server that follows the Oauth 2.0 standard:
            - `GET /oauth` 
                
                **OR**
            - `POST /oauth` 
            > The method may depend on the Authorization service.
    - Protected resource routes.  These all require an `Authorization` header containing a `Bearer` token in order to successfully make a request.
        - `GET /images`
            - Returns all images in the DB 
        - `GET /image/:id` 
            - Returns ONE `image` from the database with a matching `_id` passed as `id` in a request parameter. 
        - `GET /image/:userId`
            - Returns ALL `images` from the database where the `user_id` matches the `userId` passed in a request parameter. 
        - `POST /images`
            - Create a new `image` that is saved to the database.
        - `PUT /image/:id`
            - Updates and `image` which has an `_id` that matches the `id` passed in a request parameter. 
        - `DELETE /image/:id`
            - Removes and `image` from the database where the `_id` associated with the `image` matches the `id` passed in the request parameter.
            
    #### Middleware
    - Authentication middleware.
        - Create a middleware that can authenticate any route that uses the authentication middleware.
            - Should be able to parse `tokens` passed in a bearer auth header.
            - Should be able to parse base 64 encoded `username:password` strings, passed in a basic auth header.
            
    - **BONUS POINTS**: Create a middleware that validates both the `PUT` and `DELETE` route, so that only the user with an `_id` property that matches the `user_id` on the `image` can successfully make the request.
     
    #### Models
    - **User Model** for Authentication, using the following schema:
        - `username {string}` - A unique name for each user, required for all users.
        - `password {string}` - Hashed string used to authenticate users, required for all users.
        - `email {string}` - Unique email address that is not required.
            - hints:
                - You might also consider including methods on the user constructor for generating tokens, authenticating tokens, and comparing passwords. 
    - **Image Model** for persisting shared images.
        - `title {String}` - Title string for the image, required for all images.
        - `user_id {String` - A unique id string of the user that created the image, required for all images. 
        - `description {String` - String describing the image, not required.
        - `url {String}` - The web hosted location of the image, required for all images. 
            > example: https://images2.minutemediacdn.com/image/upload/c_crop,h_2276,w_4043,x_0,y_23/f_auto,q_auto,w_1100/v1553128862/shape/mentalfloss/536413-istock-459987119.jpg
        - `created_at {Date}` - A Date string listing when the image was added to our DB.  Required for all images.
    
    #### Tests
    - Test files are included with this project,  running `npm test` should run all tests includes in the `__tests__` directory.  Full credit will be given when all of these tests are passing.
        
