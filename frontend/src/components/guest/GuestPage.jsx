import React from 'react';
import { 
  Users, BookOpen, FileText, Mail, Phone, MapPin, 
  Clock, CheckCircle, GraduationCap, Award, Target
} from 'lucide-react';

const GuestPage = ({ navigate }) => {
  const services = [
    {
      icon: <GraduationCap className="w-8 h-8" />,
      title: 'Academic Programs',
      description: 'O-Level, A-Level, and JAMB preparation with expert guidance',
      features: ['WAEC Preparation', 'NECO Preparation', 'IJMB Programs', 'Cambridge IGCSE']
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: 'Digital Library',
      description: 'Access thousands of books, past questions, and study materials',
      features: ['E-books & Journals', 'Past Questions', 'Study Guides', 'Video Tutorials']
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Student Support',
      description: '24/7 academic counseling, career guidance, and exam support',
      features: ['Academic Counseling', 'Career Guidance', 'Exam Registration', 'University Application']
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Exam Preparation',
      description: 'Intensive courses and practice tests for all major examinations',
      features: ['Mock Exams', 'Test Practice', 'Performance Analytics', 'Expert Review']
    }
  ];

  const programs = [
    {
      title: 'O-Level Programs',
      description: 'Foundation courses for secondary education',
      duration: '1-2 years',
      exams: ['WAEC', 'NECO', 'NABTEB', 'Cambridge IGCSE']
    },
    {
      title: 'A-Level Programs',
      description: 'Advanced studies for university admission',
      duration: '1 year',
      exams: ['IJMB', 'JUPEB', 'Cambridge A-Level']
    },
    {
      title: 'JAMB Preparation',
      description: 'Comprehensive UTME preparation',
      duration: '3-6 months',
      exams: ['JAMB UTME']
    }
  ];

  const faqs = [
    {
      question: 'What programs do you offer?',
      answer: 'We offer comprehensive O-Level (WAEC, NECO, NABTEB) and A-Level (IJMB, JUPEB, Cambridge, JAMB) programs with both online and on-campus options.'
    },
    {
      question: 'What is the registration fee?',
      answer: 'The student registration fee is ₦10,000 for O-Level and ₦25,750 for A-Level programs. This includes access to our digital platform and study materials.'
    },
    {
      question: 'Do you offer student support?',
      answer: 'Yes! We provide academic counseling, career guidance, exam registration assistance, and university application support through our student portal.'
    },
    {
      question: 'What are the admission requirements?',
      answer: 'For O-Level: Minimum of Junior WAEC or equivalent. For A-Level: Valid O-Level results with at least 5 credits including English and Mathematics.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/meritlogo.jpg" 
                alt="Merit College" 
                className="w-12 h-12 rounded-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center" style={{ display: 'none' }}>
                <span className="text-white font-bold">MC</span>
              </div>
              <div>
                <h1 className="font-bold text-gray-900 text-lg">Merit College</h1>
                <p className="text-xs text-gray-600">Excellence in Education</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => navigate('/auth')}
                className="px-5 py-2 border-2 border-gray-900 text-gray-900 rounded-full font-semibold hover:bg-gray-50 transition-all"
              >
                Login
              </button>
              <button 
                onClick={() => navigate('/auth?register=true')}
                className="px-5 py-2 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 transition-all"
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Guest Services</h1>
          <p className="text-xl text-gray-300">Explore Merit College services and learn more about our programs</p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Services</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gray-900 rounded-xl flex items-center justify-center text-white mb-4">
                {service.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
              <p className="text-gray-600 mb-4">{service.description}</p>
              <ul className="space-y-2">
                {service.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Programs Section */}
      <div className="bg-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Academic Programs</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {programs.map((program, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-xl p-6">
                <h3 className="text-2xl font-bold mb-3">{program.title}</h3>
                <p className="text-gray-300 mb-4">{program.description}</p>
                <div className="mb-4">
                  <span className="text-sm text-gray-400">Duration:</span>
                  <p className="text-white font-semibold">{program.duration}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Examinations:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {program.exams.map((exam, i) => (
                      <span key={i} className="px-3 py-1 bg-white/20 rounded-full text-sm">
                        {exam}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <details key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
              <summary className="px-6 py-4 cursor-pointer hover:bg-gray-50 font-semibold text-gray-900">
                {faq.question}
              </summary>
              <div className="px-6 pb-4 text-gray-600">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-gray-900 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Contact & Location</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-6 h-6 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Address</h3>
                  <p className="text-gray-300">32, Ansarul Ogidi, beside Conoil filling station<br/>Ilorin, Kwara State, Nigeria</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-6 h-6 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Phone</h3>
                  <p className="text-gray-300">+234 (0) 123 456 7890</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-6 h-6 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Email</h3>
                  <p className="text-gray-300">info@meritcollege.edu.ng</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-6 h-6 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Office Hours</h3>
                  <p className="text-gray-300">Mon - Fri: 8:00 AM - 6:00 PM<br/>Sat: 9:00 AM - 3:00 PM</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 rounded-xl p-6">
              <h3 className="font-bold text-xl mb-4">Ready to Get Started?</h3>
              <p className="text-gray-300 mb-6">
                Join thousands of students who have achieved excellence through our comprehensive educational programs.
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => navigate('/auth?register=true')}
                  className="w-full py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition"
                >
                  Register Now
                </button>
                <button 
                  onClick={() => navigate('/auth')}
                  className="w-full py-3 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition"
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p>© 2025 Merit College of Advanced Studies. All rights reserved.</p>
          <div className="mt-4">
            <button 
              onClick={() => navigate('/')}
              className="text-white hover:underline"
            >
              Back to Homepage
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default GuestPage;