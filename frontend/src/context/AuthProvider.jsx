import React, { useEffect, useState } from 'react'
import AuthContext from './AuthContext'
import {useNavigate} from 'react-router-dom'
import jwt_decode from "jwt-decode";

function AuthProvider({ children }) {
    const [login,setLogin]=useState(false);
    const [role,setRole] = useState("admin");
    const nav = useNavigate();
    const [token,setToken] = useState(null)
    const [user,setUser] = useState(null)
    // const backend = "https://lms-fh7w.onrender.com";
    const backend = "http://localhost:5000";
    const [loading,setLoading] = useState(false);
    useEffect(() => {
        // Check if the token is available in localStorage
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            // Set the token and user state based on the stored token
            setToken(storedToken);
            const decoded = jwt_decode(storedToken);
            setUser(decoded.user);
            setLogin(true);
            nav('/')
        }
    }, []);

    async function loginUser(email,password){
        try {
            if(loading) return;
            const init={
                method: 'POST',
                body:JSON.stringify({
                    email:email,
                    password:password
                }),
                headers:{
                    'Content-Type':'application/json'
                }
            }
            setLoading(true)
            var res = await fetch(`${backend}/api/auth/login`,init)
            if (!res.ok) {
                throw new Error('Login failed');
            }
            var data = await res.json();
            setToken(data)
            localStorage.setItem('token',data)
            var decoded = await jwt_decode(data);
            console.log(decoded);
            setUser(decoded.user)
            setLogin(true)
            setLoading(false)
            nav('/')
        } catch (error) {
            console.log(error)
        }
    }
    async function logoutUser(){
        localStorage.removeItem('token')
        setLogin(false)
    }
    const contextData = {
        loginUser:loginUser,
        name: user==null?"User":user.name,
        role: user==null?role:user.role,
        token:token,
        login: login,
        logoutUser:logoutUser
    }

    return (
        <AuthContext.Provider value={contextData} >
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider;