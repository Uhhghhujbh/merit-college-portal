import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, X, AlertCircle, CheckCircle, MapPin, Shield,
  User, Mail, Phone, Home, Calendar, Briefcase, Clock
} from 'lucide-react';

// Place in: frontend/src/components/staff/StaffRegistrationForm.jsx

const StaffRegistrationForm = ({ navigate }) => {
  const [step, setStep] = useState('verification'); // verification, form
  const [verificationCode, setVerificationCode] = useState('');
  const [codeValid, setCodeValid] = useState(false);
  const [location, setLocation] = useState(null);
  const [formData, setFormData] = useState({
    // Personal Details
    fullName: '',
    email: '',
    phone: '',
    altPhone: '',
    
    // Photo
    photo: null,
    photoPreview: null,
    
    // Professional Info
    department: '',
    position: '',
    qualification: '',
    experience: '',
    availability: '',
    
    // Employment Type
    employmentType: '',
    
    // Personal Details
    gender: '',
    homeAddress: '',
    
    // Emergency Contact
    emergencyName: '',
    emergencyPhone: '',
    relationship: '',
    
    // Digital Signature
    signature: '',
    termsAccepted: false
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [codeExpiry, setCodeExpiry] = useState(null);

  const departments = ['Science', 'Arts', 'Commercial', 'ICT', 'Secretary'];
  const qualifications = ['SSCE/WAEC/NECO', 'OND', 'HND', "Bachelor's Degree", "Master's Degree", 'PhD/Doctorate', 'Professional Certificate', 'Other'];
  const experiences = ['0-1 years', '2-5 years', '6-10 years', '11-15 years', '16+ years'];
  const relationships = ['Spouse', 'Parent', 'Sibling', 'Friend', 'Relative', 'Other'];

  useEffect(() => {
    // Capture location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString()
          });
        },
        (error) => console.error('Location error:', error)
      );
    }
  }, []);

  const verifyCode = () => {
    const code = verificationCode.trim().toUpperCase();

    if (code.length !== 8) {
      alert('Please enter the complete 8-character verification code');
      return;
    }

    if (!code.startsWith('MRT')) {
      alert('Invalid code format. Code must start with MRT');
      return;
    }

    // In production, verify with backend API
    // Check if code is valid and not expired (6 hours)
    const mockValidCodes = ['MRT1A2B3', 'MRT4C5D6', 'MRT7E8F9'];
    
    if (mockValidCodes.includes(code)) {
      setCodeValid(true);
      setStep('form');
      
      // Set expiry time (6 hours from code generation)
      const expiryTime = new Date();
      expiryTime.setHours(expiryTime.getHours() + 6);
      setCodeExpiry(expiryTime);
      
      alert('Verification code accepted! You have 6 hours to complete registration.');
    } else {
      alert('Invalid or expired verification code. Please contact administration.');
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
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName) newErrors.fullName = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.position) newErrors.position = 'Position is required';
    if (!formData.qualification) newErrors.qualification = 'Qualification is required';
    if (!formData.experience) newErrors.experience = 'Experience is required';
    if (!formData.availability) newErrors.availability = 'Availability date is required';
    if (!formData.employmentType) newErrors.employmentType = 'Employment type is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.homeAddress) newErrors.homeAddress = 'Home address is required';
    if (!formData.emergencyName) newErrors.emergencyName = 'Emergency contact name is required';
    if (!formData.emergencyPhone) newErrors.emergencyPhone = 'Emergency contact phone is required';
    if (!formData.relationship) newErrors.relationship = 'Relationship is required';
    if (!formData.signature) newErrors.signature = 'Digital signature is required';
    if (!formData.photoPreview) newErrors.photo = 'Photo is required';
    if (!formData.termsAccepted) newErrors.terms = 'You must accept the terms and conditions';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      alert('Please fill all required fields');
      return;
    }

    setLoading(true);

    try {
      const staffId = 'STF_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8).toUpperCase();

      const registrationData = {
        ...formData,
        staffId,
        verificationCode,
        location,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      };

      // In production, send to backend API
      console.log('Staff Registration Data:', registrationData);

      await new Promise(resolve => setTimeout(resolve, 2000));

      alert(`Registration Successful!\n\nStaff ID: ${staffId}\nVerification Code: ${verificationCode}\n\nYou will receive confirmation email shortly.`);
      
      navigate('/staff/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Verification Screen
  if (step === 'verification') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Staff Registration</h1>
            <p className="text-gray-600">Enter verification code to proceed</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Verification Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                placeholder="MRT-XXXXX"
                maxLength={8}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-gray-900 focus:outline-none text-center text-xl font-bold tracking-wider"
              />
              <p className="text-sm text-gray-600 mt-2">
                Enter the 8-character code provided by administration
              </p>
            </div>

            {location && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-green-900">Location Captured</p>
                  <p className="text-xs text-green-700 mt-1">
                    For security purposes • Accuracy: ±{Math.round(location.accuracy)}m
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={verifyCode}
              disabled={verificationCode.length !== 8}
              className="w-full py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Verify Code & Continue
            </button>

            <div className="text-center pt-4">
              <button
                onClick={() => navigate('/auth')}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Back to Login
              </button>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Don't have a verification code? Contact administration at <br />
              <a href="mailto:info@meritcollege.edu.ng" className="text-gray-900 font-semibold hover:underline">
                info@meritcollege.edu.ng
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Registration Form
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Staff Registration Form</h1>
            <p className="text-gray-600">Complete your profile information</p>
            {codeExpiry && (
              <p className="text-sm text-orange-600 mt-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Code expires at {codeExpiry.toLocaleTimeString()}
              </p>
            )}
          </div>

          <div className="space-y-6">
            {/* Photo Upload */}
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload Professional Photo
                </h3>
                {formData.photoPreview && (
                  <button onClick={removeImage} className="text-red-500 hover:text-red-700">
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
                    className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
                  >
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

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Personal Information</h3>
              
              <Input
                label="Full Name"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Enter your full name"
                required
                error={errors.fullName}
              />

              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your.email@example.com"
                  required
                  error={errors.email}
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+234..."
                  required
                  error={errors.phone}
                />
              </div>

              <Input
                label="Alternative Phone"
                type="tel"
                value={formData.altPhone}
                onChange={(e) => handleInputChange('altPhone', e.target.value)}
                placeholder="+234... (Optional)"
              />
            </div>

            {/* Professional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Professional Information</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <Select
                  label="Department"
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  options={departments}
                  required
                  error={errors.department}
                />
                <Input
                  label="Position/Role"
                  value={formData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  placeholder="e.g. Mathematics Teacher"
                  required
                  error={errors.position}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Select
                  label="Highest Qualification"
                  value={formData.qualification}
                  onChange={(e) => handleInputChange('qualification', e.target.value)}
                  options={qualifications}
                  required
                  error={errors.qualification}
                />
                <Select
                  label="Years of Experience"
                  value={formData.experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                  options={experiences}
                  required
                  error={errors.experience}
                />
              </div>

              <Input
                label="When can you start?"
                type="date"
                value={formData.availability}
                onChange={(e) => handleInputChange('availability', e.target.value)}
                required
                error={errors.availability}
              />
            </div>

            {/* Employment Type */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Employment Type</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {['Full-Time', 'Part-Time', 'Contract'].map(type => (
                  <button
                    key={type}
                    onClick={() => handleInputChange('employmentType', type)}
                    className={`p-4 border-2 rounded-lg transition ${
                      formData.employmentType === type
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-300 hover:border-gray-900'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              {errors.employmentType && (
                <p className="text-sm text-red-500">{errors.employmentType}</p>
              )}
            </div>

            {/* Gender & Address */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Gender <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  {['Male', 'Female'].map(gender => (
                    <button
                      key={gender}
                      onClick={() => handleInputChange('gender', gender)}
                      className={`flex-1 py-3 rounded-lg border-2 font-semibold transition ${
                        formData.gender === gender
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-300 hover:border-gray-900'
                      }`}
                    >
                      {gender}
                    </button>
                  ))}
                </div>
                {errors.gender && (
                  <p className="mt-1 text-sm text-red-500">{errors.gender}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Home Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.homeAddress}
                  onChange={(e) => handleInputChange('homeAddress', e.target.value)}
                  placeholder="Enter your complete home address"
                  rows={3}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none ${
                    errors.homeAddress ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.homeAddress && (
                  <p className="mt-1 text-sm text-red-500">{errors.homeAddress}</p>
                )}
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Emergency Contact</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Contact Name"
                  value={formData.emergencyName}
                  onChange={(e) => handleInputChange('emergencyName', e.target.value)}
                  placeholder="Emergency contact full name"
                  required
                  error={errors.emergencyName}
                />
                <Input
                  label="Contact Phone"
                  type="tel"
                  value={formData.emergencyPhone}
                  onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                  placeholder="+234..."
                  required
                  error={errors.emergencyPhone}
                />
              </div>

              <Select
                label="Relationship"
                value={formData.relationship}
                onChange={(e) => handleInputChange('relationship', e.target.value)}
                options={relationships}
                required
                error={errors.relationship}
              />
            </div>

            {/* Signature & Terms */}
            <div className="space-y-4">
              <Input
                label="Digital Signature"
                value={formData.signature}
                onChange={(e) => handleInputChange('signature', e.target.value)}
                placeholder="Type your full name as digital signature"
                required
                error={errors.signature}
              />

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={formData.termsAccepted}
                  onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
                  className="w-5 h-5 mt-1 rounded"
                />
                <label htmlFor="terms" className="text-sm text-gray-700">
                  I agree to Merit College employment terms, conditions, and privacy policy
                  <span className="text-red-500 ml-1">*</span>
                </label>
              </div>
              {errors.terms && (
                <p className="text-sm text-red-500">{errors.terms}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-4 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Staff Registration'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Input = ({ label, type = 'text', value, onChange, placeholder, required, error }) => (
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
      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 ${
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

const Select = ({ label, value, onChange, options, required, error }) => (
  <div>
    {label && (
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <select
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 ${
        error ? 'border-red-500' : 'border-gray-200'
      }`}
    >
      <option value="">Select {label}</option>
      {options.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
    {error && (
      <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
        <AlertCircle className="w-4 h-4" />
        {error}
      </p>
    )}
  </div>
);

export default StaffRegistrationForm;