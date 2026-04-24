# Smart Public Transportation Analytics Platform

A dashboard that helps track and analyze public transportation performance. Made for transit agencies and admins to watch live data, delays, and passenger numbers.

## Features

### For Passengers (Public Use)
- Landing page - See platform info and how it works
- View transit schedules - Check bus schedules by route
- Track your bus - Enter bus number to see where it is live on map
- Arrival time - See how many minutes until bus reaches your stop
  
### For Admin
- Login system - Secure access for admins and drivers
- Dashboard - See key numbers and charts about transit health
- Analytics - View weekly ridership, delay history, route performance in last 7 days, and trip history
- Live tracking - View the active trips in real time
- Management - Manage list of buses and drivers
- Passenger volume - See how crowded each vehicle is
- Delay tracking - Know if there are delays happen

### For Drivers
- Trip control - Start trip, end trip, take breaks
- Live location - Your GPS position is sent to the database while driving

### Maps
- View bus routes
  
## What We Used

### Frontend (what users see)
- React JS
- Google Maps JavaScript API (for interactive maps)

### Backend (behind the scenes)
- Node.js
- Express.js
- Custom APIs to connect frontend to database

### Database
- MySQL

### APIs We Call
- Distance Matrix API (get travel time and distance)
- Maps JavaScript API (show maps)
- Directions API (get driving directions)
- Geocoding API (turn addresses into coordinates)

## How to Install

### What You Need First
- Node.js 
- MySQL 
- npm

## Deployment Diagram
[ Client Layer ]  
      |  
      |-- React Web App (Passenger/Admin) --> Hosted on Hostinger  
      |-- React Native / Web App (Driver) --> Mobile Browser/PWA  
      |  
[ Interaction Layer ]  
      |  
      V  
[ API Gateway / Load Balancer ]  
      |  
[ Application Layer ]  
      |  
      |-- Node.js + Express.js Server  
      |     |  
      |     |-- [ Google Maps APIs ] (External Service)  
      |  
[ Data Layer ]  
      |  
      |-- MySQL Database  

## Data Flow
```
[Driver App] ---> (GPS Data) ---> [Backend API] ---> [Database]  
                                         |  
                                         v  
                                  [Real-time Engine]  
                                         |  
             -------------------------------------------------  
             |                                               |  
     [Admin Dashboard]                              [Passenger UI]  
     (analytics, monitoring)                     (tracking, ETA)  
```
## Database Schema
database-instance (MySQL)  
├── tables  
│   ├── users  
│   │   ├── id (int, pk)  
│   │   ├── username (varchar)  
│   │   ├── role (enum: 'admin', 'driver')  
│   │   └── password_hash (text)  
│   ├── buses  
│   │   ├── id (int, pk)  
│   │   ├── bus_number (string)  
│   │   └── capacity (int)  
│   ├── routes  
│   │   ├── id (int, pk)  
│   │   └── route_name (string)  
│   ├── stops  
│   │   ├── id (int, pk)  
│   │   ├── route_id (fk)  
│   │   ├── stop_name (string)  
│   │   └── sequence (int)  
│   └── trips (historical)  
│       ├── id (int, pk)  
│       ├── start_time (timestamp)  
│       ├── delay_minutes (int)  
│       └── ridership_total (int)  

## Application Flow

Landing Page  
├── About Us  
│   ├── Mission  
│   ├── Vision  
│   ├── What We Do  
│   └── The Creators  
│  
├── Schedule  
│   └── Select Station / Destination  
│       └── Route Schedule  
│  
├── Passenger  
│   └── Track Your Bus  
│       ├── Map View  
│       └── Active Trip Details  
│  
├── Driver  
│   └── Dashboard  
│       ├── Map  
│       └── Trip Details  
│  
└── Admin  
    └── Login  
        ├── Dashboard  
        ├── Live Tracking  
        ├── Analytics  
        └── Management  
