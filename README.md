# ABW Company - Next.js Website

A modern, responsive website for ABW Curious Learning built with Next.js 15, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Modern Design**: Clean, professional design matching the original ABW Company website
- **Responsive Layout**: Mobile-first approach with responsive design
- **Interactive Components**: Smooth animations and transitions using Framer Motion
- **Form Handling**: Robust form validation with React Hook Form and Yup
- **Image Optimization**: Next.js Image component for optimized image loading
- **SEO Optimized**: Meta tags and structured data for better search engine visibility

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Yup validation
- **Icons**: Lucide React
- **Carousel**: Swiper.js

## 📁 Project Structure

```
abw-company-nextjs/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Homepage
│   │   ├── about/             # About page
│   │   ├── contact/           # Contact page
│   │   ├── join-now/          # Join Now page
│   │   ├── thank-you/         # Thank You page
│   │   ├── cyber-intelligence/ # Cyber Intelligence page
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   └── components/            # Reusable components
│       ├── ui/                # UI components
│       │   ├── Navbar.tsx     # Navigation component
│       │   ├── Hero.tsx       # Hero carousel
│       │   ├── Footer.tsx     # Footer component
│       │   └── ServiceCard.tsx # Service display card
│       └── forms/             # Form components
│           ├── JoinForm.tsx    # Registration form
│           └── ContactForm.tsx # Contact form
├── public/                    # Static assets
│   └── images/               # Website images
└── tailwind.config.ts        # Tailwind configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd abw-company-nextjs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Pages

- **Home** (`/`) - Main landing page with hero carousel and services
- **About** (`/about`) - Company information and service details
- **Contact** (`/contact`) - Contact form and company information
- **Join Now** (`/join-now`) - Registration form for new members
- **Thank You** (`/thank-you`) - Confirmation page after form submission
- **Cyber Intelligence** (`/cyber-intelligence`) - Cybersecurity services and training

## 🎨 Customization

### Colors
The primary color scheme is defined in `tailwind.config.ts`:
- Primary: `#06BBCC` (Blue)
- Light: `#F0FBFC` (Light Blue)
- Dark: `#181d38` (Dark Blue)

### Fonts
- **Heebo**: Used for body text
- **Nunito**: Used for headings and buttons

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Deploy to Vercel
The easiest way to deploy is using the [Vercel Platform](https://vercel.com):

1. Push your code to GitHub
2. Import your project to Vercel
3. Vercel will automatically detect it's a Next.js app and deploy

## 📝 License

This project is private and proprietary to ABW Curious Learning.

## 🤝 Support

For support and questions, please contact

---

**Built with ❤️ using Next.js and modern web technologies**
