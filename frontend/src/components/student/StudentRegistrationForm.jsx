// frontend/src/components/student/StudentRegistrationForm.jsx - COMPLETELY FIXED PRINT VERSION
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import "../../styles/print.css";
import { 
  Upload, X, AlertCircle, CheckCircle, MapPin, 
  User, Mail, Phone, Home, Calendar, Book,
  FileText, Save, Eye, Printer
} from 'lucide-react';

const StudentRegistrationForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    surname: '',
    middleName: '',
    lastName: '',
    gender: '',
    dateOfBirth: '',
    stateOfOrigin: '',
    lga: '',
    permanentAddress: '',
    parentsPhone: '',
    studentPhone: '',
    email: '',
    programme: '',
    subjects: [],
    university: '',
    course: '',
    polytechnic: '',
    collegeOfEducation: '',
    photo: null,
    photoPreview: null,
    termsAccepted: false,
    signature: '',
    location: null
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef(null);
  const printContentRef = useRef(null);

  const nigerianStates = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 
    'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 
    'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 
    'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 
    'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara', 'FCT'
  ];

  const oLevelSubjects = [
    'English Language', 'Mathematics', 'Physics', 'Chemistry', 'Biology',
    'Agricultural Science', 'Economics', 'Government', 'Literature in English',
    'Geography', 'Civic Education', 'Commerce', 'Accounting', 'Marketing',
    'Further Mathematics', 'Computer Studies', 'Technical Drawing',
    'Food and Nutrition', 'Home Economics', 'Christian Religious Studies',
    'Islamic Religious Studies', 'Fine Arts', 'Music', 'Physical Education'
  ];

  const aLevelSubjects = [
    'Mathematics', 'Further Mathematics', 'Physics', 'Chemistry', 'Biology',
    'Economics', 'Government', 'Geography', 'Literature in English',
    'Computer Science', 'Accounting'
  ];

  const jambSubjects = [
    'English Language', 'Mathematics', 'Physics', 'Chemistry', 'Biology',
    'Economics', 'Government', 'Literature in English', 'Geography',
    'Commerce', 'Accounting', 'Agricultural Science', 'Christian Religious Studies',
    'Islamic Religious Studies', 'Computer Studies'
  ];

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: new Date().toISOString()
            }
          }));
        },
        (error) => console.error('Location error:', error)
      );
    }
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      setErrors(prev => ({ ...prev, photo: 'Only JPG, JPEG, and PNG files are allowed' }));
      return;
    }

    if (file.size > 256000) {
      setErrors(prev => ({ ...prev, photo: 'Image must be 250KB or less' }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        photo: file,
        photoPreview: reader.result
      }));
      setErrors(prev => ({ ...prev, photo: '' }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, photo: null, photoPreview: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubjectToggle = (subject) => {
    setFormData(prev => {
      const subjects = prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject];
      return { ...prev, subjects };
    });
  };

  const getMaxSubjects = () => {
    if (formData.programme === 'O-Level') return 9;
    if (formData.programme === 'A-Level') return 3;
    if (formData.programme === 'JAMB') return 4;
    return 0;
  };

  const getAvailableSubjects = () => {
    if (formData.programme === 'O-Level') return oLevelSubjects;
    if (formData.programme === 'A-Level') return aLevelSubjects;
    if (formData.programme === 'JAMB') return jambSubjects;
    return [];
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.surname) newErrors.surname = 'Surname is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.stateOfOrigin) newErrors.stateOfOrigin = 'State of origin is required';
    if (!formData.lga) newErrors.lga = 'LGA is required';
    if (!formData.permanentAddress) newErrors.permanentAddress = 'Permanent address is required';
    if (!formData.parentsPhone) newErrors.parentsPhone = 'Parent phone is required';
    if (!formData.studentPhone) newErrors.studentPhone = 'Student phone is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.photoPreview) newErrors.photo = 'Photo is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.programme) newErrors.programme = 'Programme selection is required';
    
    const maxSubjects = getMaxSubjects();
    if (formData.subjects.length !== maxSubjects) {
      newErrors.subjects = `Please select exactly ${maxSubjects} subjects`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    if (!formData.termsAccepted) {
      newErrors.terms = 'You must accept the terms and conditions';
    }
    if (!formData.signature) {
      newErrors.signature = 'Digital signature is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = () => {
    return validateStep1() && validateStep2() && validateStep3();
  };

  const handleNext = () => {
    let isValid = false;
    if (currentStep === 1) isValid = validateStep1();
    if (currentStep === 2) isValid = validateStep2();

    if (isValid) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep3()) {
      alert('Please complete all required fields');
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (key === 'subjects' || key === 'location') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else if (key === 'photo' && formData.photo) {
          formDataToSend.append('photo', formData.photo);
        } else if (formData[key] !== null && formData[key] !== '') {
          formDataToSend.append(key, formData[key]);
        }
      });

      console.log('Submitting registration...');

      const response = await fetch('/api/students/register', {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed');
      }

      console.log('Registration successful:', result);

      // Auto-login
      try {
        const loginResponse = await fetch('/api/auth/student/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identifier: formData.email,
            password: formData.email
          }),
        });

        if (loginResponse.ok) {
          const loginData = await loginResponse.json();
          sessionStorage.setItem('meritToken', loginData.token);
          sessionStorage.setItem('meritUser', JSON.stringify(loginData.user));
          login(loginData.user, loginData.token);
          
          alert(`Registration Successful!\n\nStudent ID: ${result.studentId}\nStatus: ${result.status || 'Pending'}`);
          navigate('/student/dashboard', { replace: true });
        } else {
          alert(`Registration Submitted!\n\nStudent ID: ${result.studentId}\nPlease login with your email.`);
          navigate('/auth', { replace: true });
        }
      } catch (loginError) {
        console.error('Auto-login failed:', loginError);
        alert(`Registration Submitted!\n\nStudent ID: ${result.studentId}\nPlease login to continue.`);
        navigate('/auth', { replace: true });
      }

    } catch (error) {
      console.error('Registration error:', error);
      alert(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Completely rewritten print function
  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    // Get the printable content
    const printableElement = document.getElementById('printable-form');
    if (!printableElement) {
      alert('Print content not found!');
      return;
    }

    // Clone the element to avoid modifying the original
    const printContent = printableElement.cloneNode(true);
    
    // Fix images for printing
    const images = printContent.getElementsByTagName('img');
    for (let img of images) {
      // Ensure images are visible and properly sized for print
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      img.style.display = 'block';
    }

    // Create the print document
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Student Registration Form - ${formData.surname} ${formData.lastName}</title>
          <meta charset="UTF-8">
          <style>
            /* Reset and base styles */
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            body {
              font-family: 'Arial', sans-serif;
              line-height: 1.4;
              color: #000;
              background: white;
              padding: 0;
              margin: 0;
              font-size: 12pt;
            }
            
            .print-container {
              width: 100%;
              max-width: 210mm;
              margin: 0 auto;
              padding: 15mm;
            }
            
            /* Header styles */
            .print-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 20px;
              padding-bottom: 15px;
              border-bottom: 2px solid #000;
            }
            
            .college-logo {
              width: 80px;
              height: 80px;
              object-fit: cover;
              border-radius: 50%;
            }
            
            .college-info {
              text-align: center;
              flex: 1;
              padding: 0 20px;
            }
            
            .college-name {
              font-size: 18pt;
              font-weight: bold;
              text-transform: uppercase;
              margin-bottom: 5px;
            }
            
            .college-motto {
              font-size: 10pt;
              margin-bottom: 5px;
            }
            
            .college-address {
              font-size: 9pt;
            }
            
            .student-photo {
              width: 80px;
              height: 80px;
              object-fit: cover;
              border: 2px solid #000;
            }
            
            /* Form content styles */
            .form-title {
              text-align: center;
              font-size: 16pt;
              font-weight: bold;
              margin: 20px 0;
            }
            
            .section-title {
              font-weight: bold;
              background: #f0f0f0 !important;
              padding: 8px 12px;
              margin: 15px 0 10px 0;
              border-radius: 4px;
              font-size: 11pt;
            }
            
            .personal-details {
              margin-bottom: 20px;
            }
            
            .details-grid {
              display: grid;
              gap: 10px;
            }
            
            .detail-row {
              display: flex;
              margin-bottom: 8px;
            }
            
            .detail-label {
              font-weight: bold;
              min-width: 150px;
            }
            
            .detail-value {
              flex: 1;
              border-bottom: 1px solid #666;
              padding-bottom: 2px;
            }
            
            .subjects-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px;
              margin: 10px 0;
            }
            
            .subject-item {
              display: flex;
              align-items: center;
              gap: 5px;
              font-size: 10pt;
            }
            
            /* Signature section */
            .signature-section {
              margin: 30px 0 20px 0;
            }
            
            .signature-line {
              border-bottom: 1px solid #000;
              margin: 25px 0 5px 0;
              min-height: 20px;
            }
            
            .signature-label {
              font-size: 9pt;
              text-align: center;
            }
            
            .signatures-container {
              display: flex;
              justify-content: space-between;
              margin-top: 40px;
            }
            
            .signature-box {
              width: 200px;
            }
            
            /* Office use section */
            .office-use {
              background: #f8f8f8 !important;
              padding: 15px;
              border-radius: 4px;
              margin-top: 30px;
              border: 1px solid #ddd;
            }
            
            /* Print-specific styles */
            @page {
              size: A4;
              margin: 15mm;
            }
            
            @media print {
              body {
                margin: 0;
                padding: 0;
              }
              
              .print-container {
                padding: 0;
                margin: 0;
                width: 100%;
              }
              
              .page-break {
                page-break-before: always;
              }
              
              .no-print {
                display: none !important;
              }
            }
            
            /* Ensure proper spacing and avoid breaks */
            .avoid-break {
              page-break-inside: avoid;
              break-inside: avoid;
            }
            
            .force-break {
              page-break-before: always;
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${printContent.innerHTML}
          </div>
          <script>
            // Wait for images to load before printing
            window.onload = function() {
              setTimeout(function() {
                window.print();
                setTimeout(function() {
                  window.close();
                }, 500);
              }, 500);
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center text-white">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Personal Details</h2>
          <p className="text-gray-600">Section A - Basic Information</p>
        </div>
      </div>

      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Upload Passport Photo</h3>
          </div>
          {formData.photoPreview && (
            <button onClick={removeImage} className="text-red-500 hover:text-red-700 transition">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {formData.photoPreview ? (
          <div className="flex justify-center">
            <img
              src={formData.photoPreview}
              alt="Preview"
              className="w-40 h-40 rounded-lg object-cover border-4 border-white shadow-lg"
            />
          </div>
        ) : (
          <div className="text-center">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition inline-flex items-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Choose Photo
            </button>
            <p className="text-sm text-gray-600 mt-2">JPG, JPEG, PNG • Max 250KB</p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          onChange={handleImageUpload}
          className="hidden"
        />

        {errors.photo && (
          <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.photo}
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Input
          label="Surname"
          value={formData.surname}
          onChange={(e) => handleInputChange('surname', e.target.value)}
          placeholder="Enter surname"
          required
          error={errors.surname}
        />
        <Input
          label="Middle Name"
          value={formData.middleName}
          onChange={(e) => handleInputChange('middleName', e.target.value)}
          placeholder="Enter middle name"
        />
        <Input
          label="Last Name"
          value={formData.lastName}
          onChange={(e) => handleInputChange('lastName', e.target.value)}
          placeholder="Enter last name"
          required
          error={errors.lastName}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Gender <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-4">
            {['Male', 'Female'].map(gender => (
              <button
                key={gender}
                onClick={() => handleInputChange('gender', gender)}
                className={`flex-1 py-3 px-4 rounded-lg border-2 font-semibold transition ${
                  formData.gender === gender
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-300 text-gray-700 hover:border-gray-900'
                }`}
              >
                {gender}
              </button>
            ))}
          </div>
          {errors.gender && (
            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.gender}
            </p>
          )}
        </div>

        <Input
          label="Date of Birth"
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
          required
          error={errors.dateOfBirth}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            State of Origin <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.stateOfOrigin}
            onChange={(e) => handleInputChange('stateOfOrigin', e.target.value)}
            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition ${
              errors.stateOfOrigin ? 'border-red-500' : 'border-gray-200'
            }`}
          >
            <option value="">Select State</option>
            {nigerianStates.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
          {errors.stateOfOrigin && (
            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.stateOfOrigin}
            </p>
          )}
        </div>

        <Input
          label="LGA"
          value={formData.lga}
          onChange={(e) => handleInputChange('lga', e.target.value)}
          placeholder="Local Government Area"
          required
          error={errors.lga}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Permanent Home Address <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.permanentAddress}
          onChange={(e) => handleInputChange('permanentAddress', e.target.value)}
          placeholder="Enter complete home address"
          rows={3}
          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition resize-none ${
            errors.permanentAddress ? 'border-red-500' : 'border-gray-200'
          }`}
        />
        {errors.permanentAddress && (
          <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.permanentAddress}
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Input
          label="Parent's Phone Number"
          type="tel"
          value={formData.parentsPhone}
          onChange={(e) => handleInputChange('parentsPhone', e.target.value)}
          placeholder="+234..."
          required
          error={errors.parentsPhone}
        />
        <Input
          label="Student Phone Number"
          type="tel"
          value={formData.studentPhone}
          onChange={(e) => handleInputChange('studentPhone', e.target.value)}
          placeholder="+234..."
          required
          error={errors.studentPhone}
        />
      </div>

      <Input
        label="Email Address"
        type="email"
        value={formData.email}
        onChange={(e) => handleInputChange('email', e.target.value)}
        placeholder="your.email@example.com"
        required
        error={errors.email}
      />

      {formData.location && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-green-900">Location Captured</p>
            <p className="text-xs text-green-700 mt-1">
              For security purposes • Accuracy: ±{Math.round(formData.location.accuracy)}m
            </p>
          </div>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center text-white">
          <Book className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Programme Selection</h2>
          <p className="text-gray-600">Section B - Choose Your Programme</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Select Programme <span className="text-red-500">*</span>
        </label>
        <div className="grid md:grid-cols-3 gap-4">
          {['O-Level', 'A-Level', 'JAMB'].map(prog => (
            <button
              key={prog}
              onClick={() => {
                handleInputChange('programme', prog);
                handleInputChange('subjects', []);
              }}
              className={`p-6 rounded-xl border-2 font-semibold transition text-center ${
                formData.programme === prog
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-300 text-gray-700 hover:border-gray-900'
              }`}
            >
              <div className="text-2xl mb-2">
                {prog === 'O-Level' && '📚'}
                {prog === 'A-Level' && '🎓'}
                {prog === 'JAMB' && '📝'}
              </div>
              <div className="font-bold mb-1">{prog}</div>
              <div className="text-xs opacity-75">
                {prog === 'O-Level' && '9 Subjects'}
                {prog === 'A-Level' && '3 Subjects'}
                {prog === 'JAMB' && '4 Subjects'}
              </div>
            </button>
          ))}
        </div>
        {errors.programme && (
          <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.programme}
          </p>
        )}
      </div>

      {formData.programme && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Select Subjects <span className="text-red-500">*</span>
            <span className="ml-2 text-gray-500 font-normal">
              ({formData.subjects.length} / {getMaxSubjects()} selected)
            </span>
          </label>

          {formData.subjects.length === getMaxSubjects() && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-sm text-green-900 font-medium">
                All required subjects selected!
              </p>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-3">
            {getAvailableSubjects().map(subject => {
              const isSelected = formData.subjects.includes(subject);
              const isDisabled = !isSelected && formData.subjects.length >= getMaxSubjects();

              return (
                <button
                  key={subject}
                  onClick={() => !isDisabled && handleSubjectToggle(subject)}
                  disabled={isDisabled}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition text-left ${
                    isSelected
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : isDisabled
                      ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 hover:border-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      isSelected ? 'border-white bg-white' : 'border-gray-400'
                    }`}>
                      {isSelected && (
                        <CheckCircle className="w-4 h-4 text-gray-900" />
                      )}
                    </div>
                    <span>{subject}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {errors.subjects && (
            <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.subjects}
            </p>
          )}
        </div>
      )}

      {formData.programme === 'A-Level' && (
        <div className="space-y-4 pt-6 border-t border-gray-200">
          <h3 className="font-bold text-gray-900">Choice of Institution</h3>
          
          <Input
            label="University"
            value={formData.university}
            onChange={(e) => handleInputChange('university', e.target.value)}
            placeholder="e.g., University of Ilorin"
          />
          
          <Input
            label="Desired Course"
            value={formData.course}
            onChange={(e) => handleInputChange('course', e.target.value)}
            placeholder="e.g., Computer Science"
          />
          
          <Input
            label="Polytechnic (Optional)"
            value={formData.polytechnic}
            onChange={(e) => handleInputChange('polytechnic', e.target.value)}
            placeholder="Alternative choice"
          />
          
          <Input
            label="College of Education (Optional)"
            value={formData.collegeOfEducation}
            onChange={(e) => handleInputChange('collegeOfEducation', e.target.value)}
            placeholder="Alternative choice"
          />
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center text-white">
          <FileText className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Terms & Agreement</h2>
          <p className="text-gray-600">Please review and accept</p>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-300 rounded-xl p-6 max-h-96 overflow-y-auto">
        <h3 className="font-bold text-gray-900 mb-4">Merit College Terms and Conditions</h3>
        
        <div className="space-y-4 text-sm text-gray-700">
          <p className="font-semibold">By registering, you agree to the following:</p>
          
          <div>
            <h4 className="font-semibold mb-2">1. Registration Policy</h4>
            <ul className="list-disc ml-6 space-y-1">
              <li>All registration fees are non-refundable</li>
              <li>Payment must be confirmed within 7 days of registration</li>
              <li>Failure to confirm payment within 7 days results in automatic account suspension</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">2. Privacy & Data Protection</h4>
            <ul className="list-disc ml-6 space-y-1">
              <li>We do not store sensitive financial information</li>
              <li>Your data is protected according to data protection regulations</li>
              <li>Location data is captured for security purposes only</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">3. Academic Conduct</h4>
            <ul className="list-disc ml-6 space-y-1">
              <li>Zero tolerance for examination malpractice</li>
              <li>Students must maintain academic integrity</li>
              <li>Plagiarism and dishonesty will result in dismissal</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">4. Account Validation</h4>
            <ul className="list-disc ml-6 space-y-1">
              <li>All accounts must be validated by administration within 7 days</li>
              <li>Invalid or fraudulent information will result in account termination</li>
              <li>Email verification is mandatory before form submission</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">5. Code of Conduct</h4>
            <ul className="list-disc ml-6 space-y-1">
              <li>Respectful behavior towards staff and students is required</li>
              <li>Harassment and bullying are strictly prohibited</li>
              <li>Violation of rules may lead to suspension or expulsion</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id="terms"
          checked={formData.termsAccepted}
          onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
          className="w-5 h-5 mt-1 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
        />
        <label htmlFor="terms" className="text-sm text-gray-700">
          I have read and agree to the Merit College terms and conditions, privacy policy, 
          and code of conduct. I understand that payment must be confirmed within 7 days 
          and that all fees are non-refundable.
          <span className="text-red-500 ml-1">*</span>
        </label>
      </div>
      {errors.terms && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {errors.terms}
        </p>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Digital Signature <span className="text-red-500">*</span>
        </label>
        <Input
          value={formData.signature}
          onChange={(e) => handleInputChange('signature', e.target.value)}
          placeholder="Type your full name as digital signature"
          required
          error={errors.signature}
        />
        <p className="text-xs text-gray-600 mt-1">
          By typing your name, you digitally sign this registration form
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-bold text-gray-900 mb-3">Payment Information</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-700">Programme:</span>
            <span className="font-semibold">{formData.programme}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">
              {formData.programme === 'O-Level' ? 'Form Fee:' : 'Acceptance Fee:'}
            </span>
            <span className="font-bold text-lg">
              ₦{formData.programme === 'O-Level' ? '10,000' : '25,750'}
            </span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-blue-200">
          <p className="text-xs text-gray-600">
            <strong>Payment must be confirmed within 7 days.</strong> After submission, 
            you will receive payment instructions via email.
          </p>
        </div>
      </div>

      <button
        onClick={() => setShowPreview(true)}
        className="w-full py-3 bg-gray-100 text-gray-900 rounded-lg font-semibold hover:bg-gray-200 transition flex items-center justify-center gap-2"
      >
        <Eye className="w-5 h-5" />
        Preview Form Before Submission
      </button>
    </div>
  );

  const renderNavigation = () => (
    <div className="flex justify-between items-center pt-6 border-t border-gray-200">
      {currentStep > 1 ? (
        <button
          onClick={() => setCurrentStep(prev => prev - 1)}
          className="px-6 py-3 text-gray-700 font-semibold hover:text-gray-900 transition"
        >
          ← Previous
        </button>
      ) : (
        <button
          onClick={() => navigate('/auth')}
          className="px-6 py-3 text-gray-700 font-semibold hover:text-gray-900 transition"
        >
          ← Back to Login
        </button>
      )}

      {currentStep < 3 ? (
        <button
          onClick={handleNext}
          className="px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition"
        >
          Next Step →
        </button>
      ) : (
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Submit Registration
            </>
          )}
        </button>
      )}
    </div>
  );

  const renderPreviewModal = () => {
    if (!showPreview) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto no-print">
        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div 
            id="printable-form" 
            ref={printContentRef}
            className="p-8 avoid-break"
            style={{ 
              width: '210mm',
              minHeight: '297mm',
              background: 'white'
            }}
          >
            {/* Header */}
            <div className="print-header avoid-break">
              <img 
                src="/meritlogo.jpg" 
                alt="Merit College" 
                className="college-logo"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              
              <div className="college-info">
                <div className="college-name">MERIT COLLEGE OF ADVANCED STUDIES</div>
                <div className="college-motto">KNOWLEDGE FOR ADVANCEMENT</div>
                <div className="college-address">
                  Office: 32, Ansarul Ogidi, beside Conoil filling station, Ilorin, Kwara State
                </div>
              </div>
              
              {formData.photoPreview && (
                <img 
                  src={formData.photoPreview} 
                  alt="Student" 
                  className="student-photo"
                />
              )}
            </div>

            {/* Form Title */}
            <div className="form-title avoid-break">
              EXAMINATION ENTRY DETAILS
            </div>

            {/* Personal Details */}
            <div className="personal-details avoid-break">
              <div className="section-title">(A) PERSONAL DETAILS</div>
              
              <div className="details-grid">
                <div className="detail-row">
                  <span className="detail-label">Name:</span>
                  <span className="detail-value">
                    {formData.surname} {formData.middleName} {formData.lastName}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="detail-row">
                    <span className="detail-label">Sex:</span>
                    <span className="detail-value">{formData.gender}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Date of Birth:</span>
                    <span className="detail-value">{formData.dateOfBirth}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">State of Origin:</span>
                    <span className="detail-value">{formData.stateOfOrigin}</span>
                  </div>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">L.G.A:</span>
                  <span className="detail-value">{formData.lga}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Permanent Home Address:</span>
                  <span className="detail-value">{formData.permanentAddress}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="detail-row">
                    <span className="detail-label">Parents Phone Number:</span>
                    <span className="detail-value">{formData.parentsPhone}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Student Phone Number:</span>
                    <span className="detail-value">{formData.studentPhone}</span>
                  </div>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{formData.email}</span>
                </div>
              </div>
            </div>

            {/* Programme Selection */}
            <div className="avoid-break">
              <div className="section-title">(B) PROGRAMME SELECTION</div>
              <div className="detail-row">
                <span className="detail-label">Programme:</span>
                <span className="detail-value">{formData.programme}</span>
              </div>
            </div>

            {/* Subjects */}
            <div className="avoid-break">
              <div className="section-title">
                (C) {formData.programme === 'O-Level' ? 'AVAILABLE O-LEVEL COURSES' : 
                     formData.programme === 'A-Level' ? 'A-LEVEL SUBJECTS' : 'JAMB SUBJECTS'}
              </div>
              <div className="subjects-grid">
                {formData.subjects.map((subject, index) => (
                  <div key={index} className="subject-item">
                    <CheckCircle className="w-4 h-4" />
                    <span>{subject}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Choice of Institution (A-Level only) */}
            {formData.programme === 'A-Level' && (formData.university || formData.course || formData.polytechnic || formData.collegeOfEducation) && (
              <div className="avoid-break">
                <div className="section-title">(D) CHOICE OF INSTITUTION</div>
                <div className="details-grid">
                  {formData.university && (
                    <div className="detail-row">
                      <span className="detail-label">University:</span>
                      <span className="detail-value">{formData.university}</span>
                    </div>
                  )}
                  {formData.course && (
                    <div className="detail-row">
                      <span className="detail-label">Course:</span>
                      <span className="detail-value">{formData.course}</span>
                    </div>
                  )}
                  {formData.polytechnic && (
                    <div className="detail-row">
                      <span className="detail-label">Polytechnic:</span>
                      <span className="detail-value">{formData.polytechnic}</span>
                    </div>
                  )}
                  {formData.collegeOfEducation && (
                    <div className="detail-row">
                      <span className="detail-label">College of Education:</span>
                      <span className="detail-value">{formData.collegeOfEducation}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Attestation */}
            <div className="signature-section avoid-break">
              <div className="section-title">
                {formData.programme === 'A-Level' && (formData.university || formData.course) ? '(E) ATTESTATION' : '(D) ATTESTATION'}
              </div>
              <p className="mb-4">
                I <span className="font-semibold" style={{ borderBottom: '1px solid #666', paddingBottom: '2px' }}>
                  {formData.signature}
                </span> confirm that all details supplied above are correct and shall be liable to any changes after submission.
              </p>
              
              <div className="signatures-container">
                <div className="signature-box">
                  <div className="signature-line"></div>
                  <div className="signature-label">Student's Signature & Date</div>
                </div>
                <div className="signature-box">
                  <div className="signature-line"></div>
                  <div className="signature-label">Coordinator's Signature & Date</div>
                </div>
              </div>
            </div>

            {/* Office Use Only */}
            <div className="office-use avoid-break">
              <div className="section-title">
                {formData.programme === 'A-Level' && (formData.university || formData.course) ? '(F) FOR OFFICE USE ONLY' : '(E) FOR OFFICE USE ONLY'}
              </div>
              <div className="details-grid">
                <div className="detail-row">
                  <span className="detail-label">Payment Status:</span>
                  <span className="detail-value"></span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Detail Confirmation:</span>
                  <span className="detail-value"></span>
                </div>
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex justify-end gap-3 no-print">
            <button
              onClick={() => setShowPreview(false)}
              className="px-6 py-2 text-gray-700 font-semibold hover:text-gray-900 transition"
            >
              Close Preview
            </button>
            <button
              onClick={handlePrint}
              className="px-6 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print Form
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map(step => (
              <React.Fragment key={step}>
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition ${
                    currentStep >= step 
                      ? 'bg-gray-900 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step}
                  </div>
                  <span className={`ml-2 font-semibold ${
                    currentStep >= step ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step === 1 && 'Personal Details'}
                    {step === 2 && 'Programme & Subjects'}
                    {step === 3 && 'Terms & Signature'}
                  </span>
                </div>
                {step < 3 && (
                  <div className={`flex-1 h-1 mx-4 rounded ${
                    currentStep > step ? 'bg-gray-900' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xl p-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          
          {renderNavigation()}
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Need help? Contact us at <a href="mailto:info@meritcollege.edu.ng" className="text-gray-900 font-semibold hover:underline">info@meritcollege.edu.ng</a></p>
        </div>
      </div>

      {renderPreviewModal()}
    </div>
  );
};

const Input = ({ label, type = 'text', value, onChange, placeholder, required = false, error = '' }) => {
  return (
    <div>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition ${
          error ? 'border-red-500' : 'border-gray-200'
        }`}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
};

export default StudentRegistrationForm;
