# E-Commerce Application

This project is a full-stack e-commerce platform built with **Next.js, tRPC, Zod, Zustand, and MongoDB**. It includes a public storefront and an administrative dashboard for managing products, categories, users, and store settings.

---

## Technology Stack

- **Frontend:** Next.js, tRPC  
- **State Management:** Zustand  
- **Validation:** Zod  
- **Database:** MongoDB  
- **Styling:** TailwindCSS / Shadcn UI (if applicable)  

---

## Features

### Storefront
- Browse products by categories  
- View featured and on-sale products  
- Access product detail pages  

### Authentication
- Secure user authentication and management  
- Can be configured with providers such as NextAuth, Clerk, or Auth0  

### Administrative Panel (`/admin`)

#### Dashboard
- Displays the latest orders  

#### Users
- Provides a list of all registered users  

#### Categories
- Create and delete categories  
- Assign categories to products  

#### Products
- Manage products with add/edit dialogs  
- Options include:  
  - Mark as on sale  
  - Mark as featured  
  - Assign categories  

#### Settings
- Manage store-wide configurations such as branding and metadata  

---

## Project Structure

```bash
ecommerce-app/
├── src/
│   ├── pages/
│   │   ├── index.tsx          # Storefront
│   │   ├── admin/             # Administrative dashboard
│   │   │   ├── index.tsx      # Dashboard (latest orders)
│   │   │   ├── users.tsx      # Users list
│   │   │   ├── categories.tsx # Category management
│   │   │   ├── products.tsx   # Product management
│   │   │   └── settings.tsx   # Store settings
│   ├── server/                # tRPC routers, MongoDB models
│   ├── store/                 # Zustand state management
│   └── utils/                 # Zod schemas and helper functions

```
##  Configure environment variables
- Create a .env file in the root directory:
DATABASE_URL=your-mongodb-uri
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000
