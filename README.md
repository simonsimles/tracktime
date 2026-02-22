# Tracktime

## Build
### Fat jar
`sbt assembly`

### Docker build
`docker build . -t tracktime`

`docker run -d --name tracktime -v ~/Documents/tracktime:/app/data -p 5555:9000 tracktime`


## Network binding

By default the server is configured to bind to the loopback interface (`127.0.0.1`) on port `9000`, so it is only reachable from the local machine.

To change the bind address, set the `TRACKTIME_HOST` environment variable. For example, to listen on all interfaces (so it's reachable externally):

```bash
TRACKTIME_HOST=0.0.0.0 sbt run
```

## Authentication Setup

TrackTime now includes JWT-based authentication to protect your data. Here's how to set it up:

### Initial Setup (First Run)

1. **Start the application** (backend and frontend as usual)

2. **Generate a password hash** using the provided script:
   ```bash
   node password-hash-generator.js mypassword
   ```
   Replace `mypassword` with your desired password. The script will output a bcrypt hash.

3. **Configure the password**:
   - Open `data/config.json` (created automatically on first run)
   - Add the `hashedPassword` field with the hash from step 2
   - Example:
     ```json
     {
       "secretKey": "auto-generated-key",
       "hashedPassword": "$2a$12$..."
     }
     ```

4. **Restart the application**. You should now see a login screen when you visit the app.

### Login

- Visit the TrackTime web interface
- Enter your password on the login page
- Click "Login"
- You'll receive a JWT token valid for 24 hours
- The token is automatically stored and included in all API requests

### How It Works

- **Backend Protection**: All API endpoints except `/api/auth/login` require a valid JWT token in the `Authorization: Bearer <token>` header
- **Frontend**: The login token is stored in browser localStorage and automatically added to all API requests
- **Token Expiration**: Tokens expire after 24 hours, requiring you to login again
- **Password Security**: Passwords are hashed using bcrypt with a salt factor of 12

### Changing Your Password

1. Generate a new password hash:
   ```bash
   node password-hash-generator.js newpassword
   ```

2. Update `data/config.json` with the new `hashedPassword`

3. Restart the application

4. Login with your new password

### Security Notes

- Use HTTPS in production to protect tokens in transit
- The secret key in `data/config.json` is used to sign JWT tokens - keep it safe
- The config file should be protected from unauthorized access
- Tokens are stored in localStorage and are accessible to any JavaScript running on the page
- If you expose the app externally, ensure proper HTTPS setup and firewall rules

