// AI Medical Diagnosis System - Frontend JavaScript

// Constants
const API_BASE_URL = 'http://localhost:8000'; // Change this for production

// DOM Elements
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const imagePreview = document.getElementById('image-preview');
const previewImg = document.getElementById('preview-img');
const resultsSection = document.getElementById('results-section');
const loading = document.getElementById('loading');
const resultCard = document.getElementById('result-card');
const predictionText = document.getElementById('prediction-text');
const confidenceText = document.getElementById('confidence-text');
const covidProb = document.getElementById('covid-prob');
const pneumoniaProb = document.getElementById('pneumonia-prob');
const normalProb = document.getElementById('normal-prob');
const covidBar = document.getElementById('covid-bar');
const pneumoniaBar = document.getElementById('pneumonia-bar');
const normalBar = document.getElementById('normal-bar');
const errorMessage = document.getElementById('error-message');
const errorText = errorMessage ? errorMessage.querySelector('p') : null;

// Initialize the application
function init() {
    setupDragAndDrop();
    setupFileInput();
    setupContactForm();
    loadLastDiagnosis();
    checkServerStatus();
}

// Check backend server and model status
async function checkServerStatus() {
    try {
        const res = await fetch(`${API_BASE_URL}/`);
        if (!res.ok) throw new Error('Server unreachable');
        const json = await res.json();
        const badge = document.getElementById('server-status-badge');
        if (json.model_loaded) {
            badge.textContent = 'Ready (model loaded)';
            badge.classList.add('text-green-600');
        } else {
            badge.textContent = 'Ready (no model)';
            badge.classList.add('text-yellow-600');
        }
    } catch (err) {
        const badge = document.getElementById('server-status-badge');
        badge.textContent = 'Offline';
        badge.classList.add('text-red-600');
    }
}

// Drag and drop functionality
function setupDragAndDrop() {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    dropZone.addEventListener('drop', handleDrop, false);
}

function setupFileInput() {
    fileInput.addEventListener('change', handleFileSelect, false);
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight() {
    dropZone.classList.add('dragover');
}

function unhighlight() {
    dropZone.classList.remove('dragover');
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

function handleFileSelect(e) {
    const files = e.target.files;
    handleFiles(files);
}

function handleFiles(files) {
    if (files.length > 0) {
        const file = files[0];
        if (validateFile(file)) {
            showImagePreview(file);
            predictXray(file);
        }
    }
}

function validateFile(file) {
    // Check file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
        showError('Please select a valid image file (PNG, JPG, or JPEG).');
        return false;
    }

    // Check file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
        showError('File size must be less than 10MB.');
        return false;
    }

    return true;
}

function showImagePreview(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        previewImg.src = e.target.result;
        imagePreview.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
}

async function predictXray(file) {
    // Show loading state
    showLoading();

    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE_URL}/predict`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        displayResults(result);
        saveLastDiagnosis(result);

    } catch (error) {
        console.error('Prediction error:', error);
        showError('Failed to analyze the image. Please try again.');
    } finally {
        hideLoading();
    }
}

function showLoading() {
    loading.classList.remove('hidden');
    resultsSection.classList.remove('hidden');
    resultCard.classList.add('hidden');
    errorMessage.classList.add('hidden');
}

function hideLoading() {
    loading.classList.add('hidden');
}

function displayResults(result) {
    // Update prediction text
    predictionText.textContent = result.predicted_class;
    confidenceText.textContent = `Confidence: ${result.confidence.toFixed(1)}%`;

    // Update probabilities
    covidProb.textContent = `${result.probabilities.Covid.toFixed(1)}%`;
    pneumoniaProb.textContent = `${result.probabilities.Pneumonia.toFixed(1)}%`;
    normalProb.textContent = `${result.probabilities.Normal.toFixed(1)}%`;

    // Animate progress bars
    animateProgressBar(covidBar, result.probabilities.Covid);
    animateProgressBar(pneumoniaBar, result.probabilities.Pneumonia);
    animateProgressBar(normalBar, result.probabilities.Normal);

    // Show results
    resultCard.classList.remove('hidden');
    resultsSection.classList.remove('hidden');
}

function animateProgressBar(bar, percentage) {
    bar.style.width = '0%';
    setTimeout(() => {
        bar.style.width = `${percentage}%`;
    }, 100);
}

function showError(message) {
    errorText.textContent = message;
    errorMessage.classList.remove('hidden');
    resultsSection.classList.add('hidden');
}

function setupContactForm() {
    const form = document.getElementById('contact-form');
    if (form) {
        form.addEventListener('submit', handleContactSubmit);
    }
}

async function handleContactSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    // In a real application, you would send this to your backend
    console.log('Contact form submitted:', data);

    // Show success message
    showToast('Message sent successfully!', 'success');

    // Reset form
    e.target.reset();
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<p>${message}</p>`;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function saveLastDiagnosis(result) {
    try {
        localStorage.setItem('lastDiagnosis', JSON.stringify({
            ...result,
            timestamp: new Date().toISOString()
        }));
    } catch (error) {
        console.error('Failed to save diagnosis:', error);
    }
}

function loadLastDiagnosis() {
    try {
        const lastDiagnosis = localStorage.getItem('lastDiagnosis');
        if (lastDiagnosis) {
            const data = JSON.parse(lastDiagnosis);
            // You could display this in the UI if desired
            console.log('Last diagnosis:', data);
        }
    } catch (error) {
        console.error('Failed to load last diagnosis:', error);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
