import React, { useState, useEffect } from 'react';
import { getUserDetails, saveUserDetails, uploadProfilePhoto } from '../../../services/userService';
import swal from 'sweetalert';
import './UserProfile.css';
import { useAuth } from '../../../context/AuthContext';

const UserProfile = ({ onProfilePhotoUpdate }) => {
    const { currentUser } = useAuth();
    // const currentUser = currentUser ? { ...currentUser, uid: currentUser.uid } : null;
    // if (!currentUser) {
    //     return <div className="profile-container">Loading...</div>;
    // }

    // Initialize form data state
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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
            if (!validTypes.includes(file.type)) {
                swal("Invalid file!", "Only PNG, JPG and JPEG images are allowed.", "error");
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                swal("File too large!", "Maximum size allowed is 2MB.", "error");
                return;
            }
            setSelectedImage(file);
        }
    };

    const handlePhotoUpload = async () => {
        try {
            if (!currentUser?.uid) {
                swal("Error!", "User data is missing. Please reload the page.", "error");
                return;
            }
            setLoading(true);
            const downloadURL = await uploadProfilePhoto(currentUser.uid, selectedImage);
            const updatedFormData = { ...formData, photoURL: downloadURL };

            await saveUserDetails(currentUser.uid, updatedFormData);
            setFormData(updatedFormData);
            setSelectedImage(null);

            if (typeof onProfilePhotoUpdate === "function") {
                onProfilePhotoUpdate(downloadURL);
            }

            swal("Success!", "Profile photo updated successfully!", "success");
            setLoading(false);
        } catch (error) {
            console.error("Error uploading photo:", error);
            swal("Oops!", `Something went wrong: ${error.message}`, "error");
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            try {
                setLoading(true);
                if (!currentUser || !currentUser.uid) {
                    swal("Error!", "User data is missing. Please reload the page.", "error");
                    setLoading(false);
                    return;
                }

                await saveUserDetails(currentUser.uid, formData);

                swal("Success!", "Profile updated successfully!", "success");
                setSelectedImage(null);
                setLoading(false);
            } catch (error) {
                console.error('Error saving user profile:', error);
                swal("Oops!", `Something went wrong: ${error.message}`, "error");
                setLoading(false);
            }
        }
    };

    return (
        <div className="profile-container">
            <div className="profile-card">
                <h2>My Profile</h2>

                <div className="profile-image-container">
                    <img
                        src={selectedImage ? URL.createObjectURL(selectedImage) : formData.photoURL || '/default-profile.png'}
                        alt="Profile"
                        className="profile-photo"
                    />

                    <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={handleImageChange}
                        className="choose-file-input"
                        disabled={loading}
                    />

                    {selectedImage && (
                        <button type="button" className="upload-btn" onClick={handlePhotoUpload} disabled={loading}>
                            {loading ? 'Uploading...' : 'Upload'}
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-columns">
                        <div className="column">
                            <div className="form-group">
                                <label htmlFor='fullname'>Full Name</label>
                                <input type="text" value={formData.name} disabled />
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

                    <button type="submit" className="save-btn" disabled={loading}>
                        {loading ? 'Saving...' : 'Save'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UserProfile;
