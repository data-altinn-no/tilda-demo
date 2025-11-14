# Tilda - Tilsynstilsynet Demo Dashboard

A modern React-based dashboard application for supervision authorities (Tilsynstilsynet) in Norway. This demo application provides comprehensive visualization and management tools for supervision reports, coordination activities, and regulatory compliance data.

## 🚀 Features

- **Organization Lookup**: Search and display detailed organization information
- **Supervision Reports**: Comprehensive reporting and filtering capabilities
- **Geographic Visualization**: Interactive Norway map showing violation distribution
- **Trend Analysis**: Visual charts and statistics for supervision activities
- **Data Export**: CSV and JSON export functionality for all data types
- **Authority Filtering**: Filter data by specific supervision authorities
- **Responsive Design**: Modern UI that works on all devices

## 🛠️ Technology Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts for data visualization
- **Maps**: Custom SVG-based Norway map with TopoJSON
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Build Tool**: Vite
- **Deployment**: GitHub Pages

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/tilda-demo.git
   cd tilda-demo
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

## 🏗️ Building for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## 🚀 Deployment

This project is configured for automatic deployment to GitHub Pages using GitHub Actions. Every push to the `main` branch will trigger a new deployment.

### Manual Deployment

To deploy manually:

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy the `dist/` folder to your hosting provider.

## 📊 Application Structure

```
src/
├── components/          # React components
│   ├── charts/         # Chart components
│   ├── layout/         # Layout components
│   ├── tabs/           # Tab components
│   └── ui/             # UI components
├── data/               # Data generation and aggregation
├── utils/              # Utility functions
└── constants.js        # Application constants
```

## 🎯 Key Components

- **GeneralInfoTab**: Organization details and overview statistics
- **ReportsTab**: Supervision reports with filtering
- **TrendsTab**: Trend analysis and charts
- **ExperimentsTab**: Geographic visualization with Norway map
- **DownloadTab**: Data export functionality
- **NorwayMap**: Interactive SVG-based map component

## 🔧 Configuration

### Environment Variables

The application uses the following environment variables:

- `NODE_ENV`: Environment mode (development/production)
- `VITE_BASE_URL`: Base URL for the application (automatically set for GitHub Pages)

### Vite Configuration

The `vite.config.js` file is configured for:
- React support
- Path aliases
- GitHub Pages deployment with correct base path

## 📝 Data Generation

The application generates realistic demo data including:
- Norwegian organization details
- Supervision reports with weighted violation severity
- Geographic distribution across Norwegian cities
- Temporal trends and statistics

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern React and Vite
- Uses Norwegian administrative data structures
- Designed for Norwegian supervision authorities
- Geographic data from Natural Earth

---

**Note**: This is a demonstration application with generated data. It is not connected to real supervision systems or databases.