# Tourist Management System - Database Schemas

## 1. Tourist Schema
Stores the profile and itinerary details of a tourist.
- `name` (String, Required)
- `email` (String, Required)
- `phone` (String, Required)
- `aadhaarNumber` (String, Unique, Sparse)
- `passportNumber` (String, Unique, Sparse)
- `verificationStatus` (Enum: ['Pending', 'Verified', 'Rejected'], Default: 'Pending')
- `circuitId` (ObjectId, Ref: 'Circuit', Required)
- `itineraryDate` (Date, Required) - The planned start date of the tour circuit.

*Timestamps: `createdAt`, `updatedAt`*

## 2. Hotel Schema
Stores the booking and logistics details of the tourist's accommodation.
- `bookingId` (String, Required, Unique)
- `hotelName` (String, Required)
- `location` (String, Required)
- `touristId` (ObjectId, Ref: 'Tourist', Required)
- `checkInDate` (Date, Required)
- `checkOutDate` (Date, Required)
- `auditFlags` (Object)
  - `dateMismatch` (Boolean, Default: false) - Triggered if checkInDate > 24hrs off itineraryDate.

*Timestamps: `createdAt`, `updatedAt`*

## 3. Circuit Schema
Categorizes the different Incredible India promotional tours.
- `name` (Enum: ['Spiritual', 'Heritage', 'Coastal'], Required)
- `description` (String, Required)
- `locations` (Array of Strings)
- `isActive` (Boolean, Default: true)
- `promotionalImage` (String, URL)

*Timestamps: `createdAt`, `updatedAt`*

## Verification Logic Note
- **Audit Requirement**: When retrieving a tourist's hotel details, logic must calculate `abs(Hotel.checkInDate - Tourist.itineraryDate)`. If the difference is > 24 hours (86400000 ms), flag the booking for review.
