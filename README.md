# URL Shortener API

## 1. Overview

This project is a RESTful API built with Node.js, Express, and MongoDB that provides URL shortening services. It allows users to create short, unique codes for long URLs, retrieve the original URL using the short code, update the associated long URL, delete the short URL entry, and view basic access statistics for each short URL.

The primary goal is to provide a backend service that can be consumed by a frontend application or used directly via API calls to manage shortened links.

## 2. Features

*   **Create Short URL:** Generate a unique short code for a given long URL.
*   **Retrieve Original URL:** Get the details (including the original URL) associated with a short code.
*   **Redirect:** Accessing the short URL path (e.g., `http://yourdomain.com/{shortCode}`) redirects the user to the original long URL.
*   **Update Short URL:** Modify the original long URL associated with an existing short code.
*   **Delete Short URL:** Remove a short URL entry from the system.
*   **Get Statistics:** Retrieve the number of times a short URL has been accessed (redirected).

## 3. Tech Stack

*   **Backend:** Node.js
*   **Framework:** Express.js
*   **Database:** MongoDB (using Mongoose ODM typically)
*   **Package Manager:** npm 

## 4. Prerequisites

Before you begin, ensure you have the following installed on your system:

*   [Node.js](https://nodejs.org/) (which includes npm) (LTS version recommended)
*   [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally, OR access to a MongoDB Atlas cluster (or similar cloud service).
*   [Git](https://git-scm.com/) (for cloning the repository)
*   A code editor (like VS Code)
*   An API testing tool (like Postman or Insomnia)

## 5. Setup and Installation

Follow these steps to get the server running locally:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/adeelfeb/muhammad-innovaxel-adeel
    cd https://github.com/adeelfeb/muhammad-innovaxel-adeel 
    ```

2.  **Switch to the development branch:**
    (As per submission guidelines, your code should be on the `dev` branch)
    ```bash
    git checkout dev
    ```

3.  **Install dependencies:**
    Navigate to the project directory in your terminal and run:
    ```bash
    npm install
    ```
    This command reads the `package.json` file and installs all the necessary libraries (like Express, Mongoose, etc.).

4.  **Configure Environment Variables:**
    The application needs to connect to your MongoDB database. This is typically configured using environment variables.
    *   Create a file named `.env` in the root of your project directory.
    *   Add the following variables to the `.env` file, replacing the placeholder values with your actual configuration:

    ```dotenv
    # .env

    # Server Configuration
    PORT=3000  # Or any port you prefer

    # MongoDB Configuration
    MONGO_URI=mongodb://localhost:27017/url-shortener # Replace with your local DB name or Atlas connection string
    # Example for MongoDB Atlas:
    # MONGO_URI=mongodb+srv://<username>:<password>@<your-cluster-url>/url-shortener?retryWrites=true&w=majority
    ```

    *   **Important:** Make sure your `.gitignore` file includes `.env` to prevent committing sensitive credentials.

5.  **Ensure MongoDB is Running:**
    *   If using a local MongoDB instance(or Docker Image), make sure the MongoDB server is running.
    *   If using MongoDB Atlas, ensure your IP address is whitelisted if necessary.

## 6. Running the Server

Once the setup is complete, you can start the server:

1.  **Start the application:**
    ```bash
    npm start
    ```
    *   Alternatively, you might have a development script using `nodemon` for auto-reloading during development (check your `package.json` `scripts` section):
        ```bash
        npm run dev
        ```

2.  **Check the console output:**
    If everything is configured correctly, you should see messages indicating that the server is running and connected to the database, for example:
    ```
    Server listening on port 5000
    MongoDB connected successfully!
    ```

3.  **The server is now running and ready to accept API requests!** You can use tools like `Postman` to interact with the endpoints defined below.
