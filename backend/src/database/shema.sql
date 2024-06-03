CREATE TABLE Users (
    UserId UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    FullName VARCHAR(100) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    PhoneNumber VARCHAR(20) NOT NULL,
    ProfilePhoto VARCHAR(255),
    Password VARCHAR(100) NOT NULL,
    resetPasswordToken TEXT,
    resetPasswordExpires TIMESTAMP
);
