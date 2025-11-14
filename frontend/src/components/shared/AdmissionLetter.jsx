import React, { useState, useEffect } from 'react';
import { Download, Printer, Home } from 'lucide-react';

// Place in: frontend/src/components/shared/AdmissionLetter.jsx

const AdmissionLetter = ({ navigate }) => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      const token = sessionStorage.getItem('meritToken');
      const user = JSON.parse(sessionStorage.getItem('meritUser') || '{}');
      
      if (!token || !user.id) {
        navigate('/auth');
        return;
      }

      const response = await fetch(`/api/students/profile/${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch data');
      
      const data = await response.json();
      setStudent(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to load admission letter');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Generating admission letter...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-900 font-semibold mb-4">Failed to load admission letter</p>
          <button onClick={() => navigate('/student/dashboard')} className="px-6 py-2 bg-gray-900 text-white rounded-lg">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isOLevel = student.programme === 'O-Level';
  const resumptionDate = student.resumption_date 
    ? new Date(student.resumption_date)
    : new Date(new Date(student.registration_date).getTime() + 7 * 24 * 60 * 60 * 1000);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Print controls - hidden when printing */}
      <div className="print:hidden bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-[210mm] mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate('/student/dashboard')}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Back to Dashboard
          </button>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print Letter
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* A4 Letter Container */}
      <div className="py-8 print:py-0">
        <div className="max-w-[210mm] mx-auto bg-white shadow-lg print:shadow-none" style={{ minHeight: '297mm' }}>
          {/* Letter Content */}
          <div className="p-[20mm] print:p-[15mm]">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-gray-900">
              <img 
                src="/meritlogo.jpg" 
                alt="Merit College" 
                className="w-20 h-20 rounded-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center text-white text-2xl font-bold" style={{ display: 'none' }}>
                MC
              </div>

              <div className="text-center flex-1">
                <h1 className="text-2xl font-bold text-gray-900 uppercase">
                  Merit College of Advanced Studies (MCAS)
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Affiliated to ABUZARIA, UNILORIN, KWASU, Crown Hill University & Oro College of Education
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Office: 32, Ansarul Ogidi, beside Conoil filling station, Ilorin, Kwara State
                </p>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-center text-gray-900 mb-6 uppercase">
              Admission Letter
            </h2>

            {/* Letter Body */}
            <div className="space-y-4 text-gray-800 leading-relaxed">
              <p>
                This is to inform you that <strong className="text-gray-900">{student.full_name.toUpperCase()}</strong> with 
                admission No: <strong className="text-red-600">{student.student_id}</strong> has been offered provisional 
                admission into <strong className="text-gray-900">{student.programme} Programme ({student.department} Department)</strong> to 
                study and learn in the study center in Ilorin, Kwara state <strong>(Merit College of Advanced Studies).</strong>
              </p>

              <p>
                The effect of this lecture will kickstart by <strong>{resumptionDate.toLocaleDateString('en-US', { 
                  day: 'numeric', month: 'long', year: 'numeric' 
                })} Academic session.</strong>
              </p>

              <p>
                Please note that the admission is provisional and is subject to satisfying the admission conditions as stated below.
              </p>

              {/* Conditions */}
              <div className="my-6">
                <ul className="list-disc ml-6 space-y-2">
                  {!isOLevel && <li>Awaiting the WASSCE/NECO result.</li>}
                  <li>
                    {isOLevel ? 'Form Fee' : 'Acceptance Fee'} of{' '}
                    <strong className="text-red-600">
                      ₦{isOLevel ? '10,000' : '25,750'}
                    </strong> must be paid.
                  </li>
                  <li>
                    Must resume latest by {resumptionDate.toLocaleDateString('en-US', { 
                      day: 'numeric', month: 'long', year: 'numeric' 
                    })}.
                  </li>
                </ul>
              </div>

              <p>
                {isOLevel 
                  ? 'Please meet with the school management for complete registration and orientation.'
                  : 'Please log in to the college portal and follow the acceptance procedures to make payment of the acceptance fee. The acceptance fee is non-refundable.'
                }
              </p>

              {/* Bank Details */}
              {!isOLevel && (
                <div className="bg-gray-50 border-l-4 border-gray-900 p-4 my-6">
                  <p className="text-sm italic text-gray-700 mb-3">
                    If you already initiated this payment to the admission officer, there is no need for further payment. 
                    But if you haven't, you are expected to make payment to the below bank account!
                  </p>
                  <div className="space-y-1">
                    <p><strong>Account Name:</strong> Merit College of Advanced Studies</p>
                    <p><strong>Account Number:</strong> 8166985866</p>
                    <p><strong>Bank:</strong> MoniePoint MFB</p>
                  </div>
                </div>
              )}

              <p>
                You are expected to report to the College on the resumption date. Please note that the offer of admission 
                is valid subject to {isOLevel ? 'meeting with administration' : 'the payment of the acceptance fee'}.
              </p>

              <p className="text-center font-bold text-blue-600 text-lg mt-6">
                Congratulations!
              </p>

              {/* Signature Section */}
              <div className="mt-12 flex justify-between items-end">
                <div className="text-sm text-gray-600">
                  {new Date().toLocaleDateString('en-US', { 
                    day: 'numeric', month: 'long', year: 'numeric' 
                  })}
                </div>
                <div className="text-right">
                  <div className="mb-2 h-12"></div>
                  <div className="border-t-2 border-gray-900 pt-1">
                    <p className="font-bold text-gray-900">Dr. O. A. Opeyemi</p>
                    <p className="text-sm text-gray-600">Admission Officer</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Rule */}
            <div className="mt-12 h-2 bg-gradient-to-r from-gray-900 to-transparent rounded"></div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          
          body {
            margin: 0;
            padding: 0;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          
          .print\\:py-0 {
            padding-top: 0 !important;
            padding-bottom: 0 !important;
          }
          
          .print\\:p-\\[15mm\\] {
            padding: 15mm !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AdmissionLetter;