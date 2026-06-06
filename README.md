# BUATIN (Mobile Frontend)
Mobile frontend of Buatin, a milestone based physical products commissioning app that 
covers production, delivery, communication, and seller discovery

### Related Repos

| Part | Repo |
|---|---|
| Admin UI | [Buatin-Admin](https://github.com/vindall/Buatin-Admin) |
| Backend | [pepis2317/BuatinBE](https://github.com/pepis2317/BuatinBE) |

//yt demo
//images from figma

## What it does
Buatin does not make you pay upfront and hope for the best. Buatin is a marketplace for 
commissioning custom physical products, where payments are split into milestones, funds
are only released when work is confirmed complete, and either party can cancel at any
stage without losing money where they shouldn't.

Every production step requires mutual agreement. When disputes arise, a neutral admin
handles refunds and cancellations so neither party is left hanging.

## Features
- **Location sharing** - for getting the nearest Sellers to the user's location
- **Real-time chat with file attachments** - for keeping clear comms between both parties
- **Midtrans payment gateway** - easily integrate with Indonesian e-wallets and QRis
- **Instagram-like portfolio page with statistics & reviews** - to attract buyers and promote seller
- **Shipment tracking powered by Biteship** - for monitoring delivery of a completed commissioned product
- **Milestone based payments** - ensuring both parties progress together
- **Escrow payments** - ensuring sellers complete their work before getting paid
- **3rd party dispute handling** - refunds and cancellations are processed by admin to esnure neutrality

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React Native Expo, TypeScript|
| Backend | .NET Core |
| Database | Microsoft SQL Server |
| Auth | JWT with refresh token |
| Build & Deploy | EAS Build |

note: this repo does not work with expo go, an internal build is required
### Installation
```bash
git clone https://github.com/pepis2317/BuatinFE.git
cd BuatinFE
npm i
npm i -g expo-cli
eas login
eas build --platform android
npx expo start
```
## What I'd Improve
- [ ] Clean up frontend architecture
- [ ] Improve UI design
- [ ] Add more real-time updates on certain pages with WebSockets
