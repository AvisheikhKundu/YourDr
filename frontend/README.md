# AI Medical Diagnosis System - Frontend

This is the frontend for the AI Medical Diagnosis System, built with HTML, CSS (Tailwind), and JavaScript. It provides a user-friendly interface for uploading X-ray images and receiving AI-powered diagnosis results.

## Features

- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Drag & Drop Upload**: Easy image upload with drag-and-drop functionality
- **Real-time Preview**: Instant image preview before analysis
- **Animated Results**: Smooth animations for confidence bars and results
- **Loading States**: User-friendly loading indicators during analysis
- **Error Handling**: Comprehensive error messages and validation
- **Local Storage**: Saves last diagnosis for quick reference
- **Toast Notifications**: Success and error notifications
- **Contact Form**: Integrated contact form for user inquiries

## Pages

### index.html - Landing Page
- Hero section with medical theme
- Feature highlights
- Navigation to other pages

### diagnosis.html - Main Diagnosis Interface
- Drag & drop upload area
- Image preview functionality
- Real-time diagnosis results
- Animated confidence bars (COVID-19, Pneumonia, Normal)
- Disclaimer section

### about.html - Model Information
- EfficientNet-B4 model details
- AI capabilities explanation
- System limitations and disclaimers

### contact.html - Contact Information
- Contact details (email, phone, address)
- Contact form for inquiries
- Social media links

## Technologies Used

- **HTML5**: Semantic markup and structure
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Vanilla JavaScript**: DOM manipulation and API communication
- **Fetch API**: Asynchronous HTTP requests
- **Local Storage**: Client-side data persistence

## Setup

1. Ensure the backend is running (see backend README)
2. Open the HTML files in a modern web browser
3. For local development, you may need to disable CORS in your browser or use a local server

## Usage

### Uploading Images
1. Navigate to the Diagnosis page
2. Drag and drop an X-ray image or click "Browse Files"
3. Supported formats: PNG, JPG, JPEG (max 10MB)
4. Wait for the analysis to complete

### Viewing Results
- Prediction class (COVID-19, Pneumonia, or Normal)
- Confidence percentage
- Probability breakdown with animated bars
- Disclaimer about medical advice

### Contact Form
- Fill out the contact form on the Contact page
- Messages are logged to the console (in production, integrate with backend)

## API Integration

The frontend communicates with the FastAPI backend:

```javascript
// Example API call
const response = await fetch('http://localhost:8000/predict', {
    method: 'POST',
    body: formData
});
const result = await response.json();
```

### API Endpoints Used
- `POST /predict`: Send image for analysis
- `GET /health`: Backend health check

## Browser Support

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

## Accessibility

- Semantic HTML structure
- Keyboard navigation support
- Screen reader friendly
- High contrast mode support
- Reduced motion preferences respected

## Security Considerations

- Client-side file validation
- No sensitive data stored locally
- HTTPS recommended for production
- CORS configuration required for API calls

## Performance

- Lazy loading of images
- Debounced user interactions
- Efficient DOM manipulation
- Minimal external dependencies

## Customization

### Changing API URL
Update `API_BASE_URL` in `assets/js/app.js`:

```javascript
const API_BASE_URL = 'https://your-deployed-backend-url.com';
```

### Styling Modifications
- Edit `assets/css/style.css` for custom styles
- Modify Tailwind classes in HTML files
- Update color scheme in CSS custom properties

### Adding New Features
- Extend `app.js` for new functionality
- Add new pages following the existing structure
- Update navigation in all HTML files

## Deployment

### Static Hosting
- Upload files to any static hosting service (Netlify, Vercel, GitHub Pages)
- Ensure CORS is configured on the backend
- Update API_BASE_URL for production

### Local Development
```bash
# Using Python's built-in server
python -m http.server 8080

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8080
```

## Troubleshooting

### CORS Errors
- Ensure backend has CORS middleware configured
- Check API_BASE_URL is correct
- Use HTTPS in production

### Upload Issues
- Check file size limits (10MB)
- Verify supported file formats
- Ensure network connectivity

### Display Problems
- Clear browser cache
- Check console for JavaScript errors
- Verify Tailwind CSS is loading

## Contributing

1. Follow the existing code structure
2. Add comments for complex logic
3. Test on multiple browsers
4. Update documentation as needed

## License

This project is for educational and research purposes. Please consult medical professionals for actual diagnosis.
