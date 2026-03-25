1. Stateless JWT (JSON Web Token)
Library: We use jose for high-performance encryption/decryption in the Edge Runtime (Middleware).
Stateless: The server does not store your session in a database. All your data (User ID, Role, and Permissions) is encrypted and signed inside the token itself.
Fast: Because the token is self-contained, the middleware can verify your access in milliseconds without making a database query.