export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^\+?[0-9]{10,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validatePassword = (password) => {
  return password.length >= 8;
};

export const generateStudentId = (programme, department) => {
  const year = new Date().getFullYear().toString().slice(-2);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  const programmeCode = programme === 'O-Level' ? 'O' : 'A';
  const deptCode = department.substring(0, 3).toUpperCase();
  
  return `MCAS/${deptCode}/${year}/${random}/${programmeCode}`;
};

export const generateStaffId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `STF_${timestamp}_${random}`;
};

export const generateVerificationCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const code = 'MRT' + Array.from({ length: 5 }, () => 
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
  return code;
};