# Travel_Online_Booking_Back-end

## API Endpoint

## 1. Authentication

This API handles user authentication using email and password. It supports:
1. **First-time user registration**
2. **Existing user login**
3. **Wrong credentials handling**
4. **Password mismatch handling**

### **POST** `/email-auth`
Authenticates a user via email and password.

### ** Request Body**
```json
{
  "name": "ABCD",
  "email": "johndoe@example.com",
  "password": "securepassword"
}
```

### ** Responses**

#### **1. First-Time User Login (Registration)**
- **Condition:** If the email is not found in the database, a new user is created.
- **Response:**
```json
{
  "message": "Email login successful",
  "token": "jwt_token_here",
  "Username": "ABCD"
}
```

#### **2. Existing User Login (Successful Login)**
- **Condition:** If the user exists and the password matches.
- **Response:**
```json
{
  "message": "Email login successful",
  "token": "jwt_token_here",
  "Username": "ABCD"
}
```

#### **3. Wrong Credentials (Email Not Valid)**
- **Condition:** If the provided email is not valid.
- **Response:**
```json
{
  "errors": [
    {
      "type": "field",
      "value": "rudratel1gmail.com",
      "msg": "Invalid email format",
      "path": "email",
      "location": "body"
    }
  ]
}
```

#### **4. Password Incorrect**
- **Condition:** If the email exists but the password is incorrect.
- **Response:**
```json
{
  "message": "Invalid credentials"
}
```

### Validation Rules
The API validates the following:
- **Email must be in correct format**
- **Password must be at least 6 characters long**
- **Name must not be empty**

## 2. Other Apis
