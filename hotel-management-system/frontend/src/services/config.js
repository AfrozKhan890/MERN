const API_BASE_URL = 'http://localhost:5000/api';

const getToken = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user?.token;
};

const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

export { API_BASE_URL, getToken, headers };