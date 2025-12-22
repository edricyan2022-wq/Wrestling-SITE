# Iron Hold Wrestling - Requirements & Architecture

## Original Problem Statement
Build a wrestling website that teaches people wrestling moves and secret techniques through video tutorials. Features include:
- Video library with categories
- Admin-only video upload (+ icon visible only to admin email: edric.yan2022@gmail.com)
- Contact: edric.yan2022@gmail.com
- Catchy fonts and professional design
- Free/Monthly/Annual subscription plans
- Free plan: Basic wrestling techniques
- Paid plans: Secret techniques and advanced moves
- Google OAuth for login/signup

## Architecture

### Tech Stack
- **Frontend**: React 19 with Tailwind CSS, Framer Motion, Shadcn/UI
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Auth**: Emergent Google OAuth
- **Payments**: Stripe (via emergentintegrations)

### Database Collections
1. **users**: user_id, email, name, picture, subscription_plan, subscription_expires, created_at
2. **user_sessions**: session_token, user_id, expires_at, created_at
3. **videos**: video_id, title, description, category, video_url, thumbnail_url, is_premium, order, created_at
4. **payment_transactions**: transaction_id, session_id, user_id, email, amount, currency, plan, status, payment_status, created_at

### API Endpoints
- `POST /api/auth/session` - Process Google OAuth session
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user
- `GET /api/videos` - Get all videos (filtered by subscription)
- `GET /api/videos/{video_id}` - Get single video
- `POST /api/videos` - Create video (admin only)
- `DELETE /api/videos/{video_id}` - Delete video (admin only)
- `GET /api/categories` - Get video categories
- `POST /api/payments/create-checkout` - Create Stripe checkout
- `GET /api/payments/status/{session_id}` - Get payment status
- `POST /api/webhook/stripe` - Stripe webhook handler
- `GET /api/plans` - Get subscription plans

### Pages
1. **Landing** (`/`) - Hero, features, pricing preview, contact
2. **Dashboard** (`/dashboard`) - Video library with search/filter
3. **Video Player** (`/video/:videoId`) - Video playback
4. **Pricing** (`/pricing`) - Subscription plans
5. **Payment Success** (`/payment/success`) - Payment confirmation
6. **Profile** (`/profile`) - User profile and subscription
7. **Auth Callback** (`/auth/callback`) - OAuth callback handler

### Subscription Plans
- **Free**: $0 - Basic wrestling techniques
- **Monthly Pro**: $19.99/month - All techniques + secret moves
- **Annual Pro**: $149.99/year - All features + 2 months free

## Completed Tasks
- [x] Landing page with hero, features, pricing preview
- [x] Google OAuth authentication
- [x] Video library with search and category filter
- [x] Admin video upload (+ button visible only to admin)
- [x] Premium content locking
- [x] Stripe payment integration
- [x] Payment success flow with polling
- [x] User profile page
- [x] Responsive design with dark "Underground Dojo" theme

## Next Tasks / Enhancements
- [ ] Add sample videos to demonstrate the platform
- [ ] Implement video ordering/sorting by admin
- [ ] Add video editing capability for admin
- [ ] Email notifications for subscription events
- [ ] Add analytics dashboard for admin
- [ ] Implement referral/affiliate system for revenue growth
