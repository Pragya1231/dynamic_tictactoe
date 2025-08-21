// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';

// const LoginComponent = () => {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const navigate = useNavigate();

//   const handleRegisterOrLogin = async () => {
//     if (!username.trim() || !password.trim()) {
//       return setError('Username and password required.');
//     }

//     try {
//       const res = await axios.post('http://localhost:8080/api/users/login', {
//         username,
//         password,
//       });

//       if (res.data.success) {
//         localStorage.setItem('username', res.data.username);
//         navigate('/home');
//       } else {
//         setError(res.data.message || 'Login failed');
//       }
//     } catch (err) {
//       if (err.response?.data?.message) {
//         setError(err.response.data.message);
//       } else {
//         setError('Server error');
//       }
//     }
//   };

//   const handleGuestLogin = async () => {
//     try {
//       const res = await axios.post('http://localhost:8080/api/users/guest');

//       if (res.data.success) {
//         localStorage.setItem('username', res.data.username);
//         navigate('/home');
//       } else {
//         setError(res.data.message);
//       }
//     } catch (err) {
//       setError('Could not login as guest.');
//     }
//   };

//   return (
//     <div className="bg-white p-8 rounded-xl shadow-lg w-80">
//       <h2 className="text-2xl font-bold mb-4 text-center">Login or Continue as Guest</h2>

//       <input
//         type="text"
//         placeholder="Enter username"
//         value={username}
//         onChange={(e) => setUsername(e.target.value)}
//         className="w-full p-2 border rounded mb-2"
//       />

//       <input
//         type="password"
//         placeholder="Enter password"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//         className="w-full p-2 border rounded mb-2"
//       />

//       {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

//       <button
//         onClick={handleRegisterOrLogin}
//         className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 mb-2"
//       >
//         Login / Register
//       </button>

//       <div className="text-center text-sm text-gray-500 my-2">or</div>

//       <button
//         onClick={handleGuestLogin}
//         className="w-full bg-gray-600 text-white py-2 rounded hover:bg-gray-700"
//       >
//         Continue as Guest
//       </button>
//     </div>
//   );
// };

// export default LoginComponent;
