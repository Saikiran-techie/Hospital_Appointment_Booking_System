import React, { useState, useEffect, useRef } from 'react';
import { getUserDetails, saveUserDetails, uploadProfilePhoto } from '../../../services/userService';
import { toast } from 'react-toastify';
import './UserProfile.css';
import { useAuth } from '../../../context/AuthContext';

const UserProfile = ({ onProfilePhotoUpdate }) => {
    const { currentUser } = useAuth();
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        dob: '',
        age: '',
        gender: '',
        address: '',
        photoURL: '',
    });

    const [errors, setErrors] = useState({});
    const [selectedImage, setSelectedImage] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (currentUser) {
            setFormData(prev => ({
                ...prev,
                fullName: currentUser.displayName || '',
                email: currentUser.email || '',
                photoURL: currentUser.photoURL || '',
            }));
            fetchUserDetails(currentUser.uid);
        }
    }, [currentUser]);

    const fetchUserDetails = async (uid) => {
        try {
            const data = await getUserDetails(uid);
            if (data) {
                setFormData(prev => ({ ...prev, ...data }));
            }
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };

    const calculateAge = (dob) => {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        return age;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
            ...(name === 'dob' && { age: calculateAge(value) }),
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.phone.match(/^[6-9]\d{9}$/)) newErrors.phone = 'Valid 10-digit phone number required';
        if (!formData.dob) newErrors.dob = 'Date of Birth is required';
        if (!formData.gender) newErrors.gender = 'Gender is required';
        if (!formData.address) newErrors.address = 'Address is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
            if (!validTypes.includes(file.type)) {
                toast.error('Only PNG, JPG and JPEG images are allowed.');
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                toast.error('Maximum size allowed is 2MB.');
                return;
            }
            setSelectedImage(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            try {
                setLoading(true);
                let updatedFormData = { ...formData };

                if (selectedImage && currentUser?.uid) {
                    const downloadURL = await uploadProfilePhoto(currentUser.uid, selectedImage);
                    updatedFormData.photoURL = downloadURL;

                    if (typeof onProfilePhotoUpdate === "function") {
                        onProfilePhotoUpdate(downloadURL);
                    }
                }

                await saveUserDetails(currentUser.uid, updatedFormData);
                setFormData(updatedFormData);
                setSelectedImage(null);

                toast.success('Profile updated successfully!');
            } catch (error) {
                console.error('Error saving profile:', error);
                toast.error(`Something went wrong: ${error.message}`);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="profile-container">
            <div className="profile-card">
                <h3 className='text-primary'>My Profile</h3>

                <div className="profile-image-container">
                    <button
                        type="button"
                        className="image-button"
                        onClick={handleImageClick}
                        title="Click to change photo"
                        style={{ border: 'none', background: 'none', padding: 0 }}
                    >
                        <img
                            src={
                                selectedImage
                                    ? URL.createObjectURL(selectedImage)
                                    : formData.photoURL || '/default-profile.png'
                            }
                            alt="Profile"
                            className="profile-photo"
                        />
                        <i className="fas fa-plus edit-icon"></i>
                    </button>

                    <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={handleImageChange}
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                    />
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-columns">
                        <div className="column">
                            <div className="form-group">
                                <label htmlFor='fullname'>Full Name</label>
                                <input type="text" value={formData.fullName} disabled />
                            </div>

                            <div className="form-group">
                                <label htmlFor='dob'>Date of Birth</label>
                                <input type="date" name="dob" value={formData.dob} onChange={handleChange} />
                                {errors.dob && <span className="error">{errors.dob}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor='gender'>Gender</label>
                                <select name="gender" value={formData.gender} onChange={handleChange}>
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                                {errors.gender && <span className="error">{errors.gender}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor='address'>Address</label>
                                <textarea name="address" value={formData.address} onChange={handleChange}></textarea>
                                {errors.address && <span className="error">{errors.address}</span>}
                            </div>
                        </div>

                        <div className="column">
                            <div className="form-group">
                                <label htmlFor='email'>Email</label>
                                <input type="email" value={formData.email} disabled />
                            </div>

                            <div className="form-group">
                                <label htmlFor='age'>Age</label>
                                <input type="text" value={formData.age} readOnly />
                            </div>

                            <div className="form-group">
                                <label htmlFor='phone'>Phone</label>
                                <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
                                {errors.phone && <span className="error">{errors.phone}</span>}
                            </div>
                        </div>
                    </div>

                    <div className="form-footer">
                        <button type="submit" className="save-btn" disabled={loading}>
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserProfile;
