import React, { useState, useEffect } from 'react';
import { getDoctorDetails, saveDoctorDetails, uploadProfilePhoto } from '../../../services/doctorService';
import { useAuth } from '../../../context/AuthContext';
import swal from 'sweetalert';
import '../Patient/UserProfile.css';

export function generateDoctorCode(length = 8) {
    const characters = 'DOC0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = 'DOC';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

const DoctorProfile = ({ doctorProfile, onProfilePhotoUpdate }) => {
    const { currentUser } = useAuth();
    const doctorData = currentUser;

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        dob: '',
        age: '',
        gender: '',
        bloodGroup: '',
        address: '',
        specialization: '',
        photoURL: '',
        doctorCode: '',
    });

    const [errors, setErrors] = useState({});
    const [selectedImage, setSelectedImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [profileLoading, setProfileLoading] = useState(true);

    useEffect(() => {
        if (doctorData) {
            setFormData((prev) => ({
                ...prev,
                fullName: doctorData.displayName || '',
                email: doctorData.email || '',
                photoURL: doctorData.photoURL || '',
            }));
            fetchDoctorDetails(doctorData.uid);
        }
    }, [doctorData]);

    const fetchDoctorDetails = async (uid) => {
        try {
            const data = await getDoctorDetails(uid);
            if (data) {
                let updatedData = { ...data };
                if (!data.doctorCode) {
                    updatedData.doctorCode = generateDoctorCode();
                    await saveDoctorDetails(uid, updatedData);
                }
                setFormData((prev) => ({
                    ...prev,
                    ...updatedData,
                }));
            }
            setProfileLoading(false);
        } catch (error) {
            console.error('Error fetching doctor details:', error);
            setProfileLoading(false);
        }
    };

    const calculateAge = (dob) => {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
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
        if (!formData.specialization) newErrors.specialization = 'Specialization is required';
        if (!formData.bloodGroup) newErrors.bloodGroup = 'Blood group is required';
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
            if (!doctorData?.uid) {
                swal("Error!", "Doctor data is missing. Please reload the page.", "error");
                return;
            }
            setLoading(true);
            const downloadURL = await uploadProfilePhoto(doctorData.uid, selectedImage);
            const updatedFormData = { ...formData, photoURL: downloadURL };

            await saveDoctorDetails(doctorData.uid, updatedFormData);
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
                if (!doctorData?.uid) {
                    swal("Error!", "Doctor data is missing. Please reload the page.", "error");
                    setLoading(false);
                    return;
                }

                let updatedFormData = { ...formData };
                updatedFormData.fullName = doctorProfile?.name || doctorData.displayName || '';

                if (!updatedFormData.doctorCode) {
                    updatedFormData.doctorCode = generateDoctorCode();
                }

                await saveDoctorDetails(doctorData.uid, updatedFormData);
                swal("Success!", "Profile updated successfully!", "success");
                setSelectedImage(null);
                setLoading(false);
            } catch (error) {
                console.error('Error saving doctor profile:', error);
                swal("Oops!", `Something went wrong: ${error.message}`, "error");
                setLoading(false);
            }
        }
    };

    return (
        <div className="profile-container">
            <div className="profile-card">
                <h2>Doctor Profile</h2>

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

                {!doctorData ? (
                    <div className="text-center mt-4 text-danger">Doctor profile not found. Please login again.</div>
                ) : profileLoading ? (
                    <div className="text-center mt-3"><i className="fas fa-spinner fa-spin"></i> Loading profile data...</div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="form-columns">
                            <div className="column">
                                <div className="form-group">
                                    <label htmlFor='text'>Full Name</label>
                                            <input type="text" value={formData.fullName} disabled />
                                </div>

                                <div className="form-group">
                                    <label htmlFor='text'>Specialization</label>
                                    <input type="text" name="specialization" value={formData.specialization} onChange={handleChange} />
                                    {errors.specialization && <span className="error">{errors.specialization}</span>}
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
                                        <option>Male</option>
                                        <option>Female</option>
                                        <option>Other</option>
                                    </select>
                                    {errors.gender && <span className="error">{errors.gender}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor='text'>Phone</label>
                                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
                                    {errors.phone && <span className="error">{errors.phone}</span>}
                                </div>
                            </div>

                            <div className="column">
                                <div className="form-group">
                                    <label htmlFor='email'>Email</label>
                                    <input type="email" value={doctorData.email || ''} disabled />
                                </div>

                                <div className="form-group">
                                    <label htmlFor='text'>Doctor ID</label>
                                    <input type="text" value={formData.doctorCode} disabled />
                                </div>

                                <div className="form-group">
                                    <label htmlFor='age'>Age</label>
                                    <input type="text" value={formData.age} readOnly />
                                </div>

                                <div className="form-group">
                                    <label htmlFor='bloodGroup'>Blood Group</label>
                                    <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange}>
                                        <option value="">Select Blood Group</option>
                                        <option>A+</option>
                                        <option>A-</option>
                                        <option>B+</option>
                                        <option>B-</option>
                                        <option>AB+</option>
                                        <option>AB-</option>
                                        <option>O+</option>
                                        <option>O-</option>
                                    </select>
                                    {errors.bloodGroup && <span className="error">{errors.bloodGroup}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor='address'>Address</label>
                                    <textarea name="address" value={formData.address} onChange={handleChange}></textarea>
                                    {errors.address && <span className="error">{errors.address}</span>}
                                </div>
                            </div>
                        </div>

                        <div className="text-center mt-4">
                            <button type="submit" className="save-btn" disabled={loading}>
                                {loading ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin me-2"></i> Saving...
                                    </>
                                ) : (
                                    'Save'
                                )}
                            </button>
                        </div>

                    </form>
                )}
            </div>
        </div>
    );
};

export default DoctorProfile;
