import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { TelPhone } from '../../utils/Icons'
import { toast } from 'react-toastify'
import { ApiHandler } from '../../helper/ApiHandler'
import { API_ENDPOINTS, getApiUrl } from '../../config/apiEndpoints'
import { useDispatch, useSelector } from 'react-redux'
import Loading from '../Common/Loading'

const ContactUsDetails = () => {
    const token = useSelector((state) => state.auth.token);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [apiLoading, setApiLoading] = useState(false);
    const [attachment, setAttachment] = useState(null);

    const [user, setUser] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    });

    const { firstName, lastName, email, phone, message, subject } = user;

    const onInputChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value })
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (10MB max)
            if (file.size > 10 * 1024 * 1024) {
                toast.error('File size must be less than 10MB');
                e.target.value = '';
                return;
            }
            // Validate file type
            const allowed = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'zip', 'mp4', 'wav'];
            const ext = file.name.split('.').pop().toLowerCase();
            if (!allowed.includes(ext)) {
                toast.error('Invalid file type. Allowed: PDF, JPG, PNG, GIF, ZIP, MP4, WAV');
                e.target.value = '';
                return;
            }
            setAttachment(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Create FormData for file upload
        const formData = new FormData();
        formData.append('first_name', firstName);
        formData.append('last_name', lastName);
        formData.append('email', email);
        formData.append('phone', phone);
        formData.append('message', message);
        formData.append('subject', subject);
        if (attachment) {
            formData.append('attachment', attachment);
        }

        try {
            setApiLoading(true);
            const response = await fetch(getApiUrl(API_ENDPOINTS.CONTACT.SUBMIT_WITH_UPLOAD), {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.status.code === 1) {
                toast.success(data.status.message);
                setUser({
                    firstName: '',
                    lastName: '',
                    email: '',
                    phone: '',
                    message: '',
                    subject: '',
                });
                setAttachment(null);
                navigate('/');
            } else {
                toast.error(data.status.message);
            }
        } catch (error) {
            toast.error('An error occurred. Please try again.');
        } finally {
            setApiLoading(false);
        }
    };

    if (apiLoading) {
        return <Loading />;
    }

    return (
        <>
            <section className='bg-[#1A202C] text-white support'>
                <div className='container mx-auto'>
                    <div className='flex flex-wrap flex-col md:flex-row justify-between items-center py-10 px-2 md:px-6 space-y-6'>
                        <div className='flex flex-col justify-center items-start gap-3 md:gap-5 w-full md:w-[40%]'>
                            <h1 className='text-3xl md:text-5xl font-semibold tracking-wide'>Do you need help?</h1>
                            <p className='text-sm md:text-lg font-medium tracking-wide mt-2'>
                                Our support experts are here to help you. You can check our Resource page to see if you can find answer to your questions or you can just fill in the form and we will contact you regarding your question.
                            </p>
                            <Link to="#" className='flex flex-row justify-center items-center -ml-4'>
                                   {/*<span><TelPhone /></span>
                                <span></span>*/}
                            </Link>
                        </div>

                        <div className='flex flex-col gap-3 rounded-md  px-6 py-8 w-full md:w-[50%]'
                            style={{ backgroundColor: '#0E0E0E', borderRadius: '1rem', boxShadow: '0 0 20px 0 #0E0E0E' }}
                        >
                            <form action="" onSubmit={handleSubmit} className='space-y-4'>
                                <div className='flex flex-col sm:flex-row justify-between items-center w-full space-y-4'>
                                    <div className='w-full sm:w-[47%]'>
                                        <label htmlFor='firstName' className='block text-white text-base mb-2 font-medium'>
                                            First Name
                                        </label>
                                        <input
                                            type='text'
                                            name='firstName'
                                            value={firstName}
                                            onChange={(e) => onInputChange(e)}
                                            className='w-full p-2 rounded-md bg-[#222222] text-white border border-white/50 focus:bg-transparent outline-none focus-within:outline-none'
                                            required
                                        />
                                    </div>
                                    <div className='w-full sm:w-[47%]'>
                                        <label htmlFor='lastName' className='block text-white text-base mb-2 font-medium'>
                                            Last Name
                                        </label>
                                        <input
                                            type='text'
                                            name='lastName'
                                            value={lastName}
                                            onChange={(e) => onInputChange(e)}
                                            className='w-full p-2 rounded-md bg-[#222222] text-white border border-white/50 focus:bg-transparent outline-none focus-within:outline-none'
                                            required
                                        />
                                    </div>
                                </div>
                                <div className='w-full'>
                                    <label htmlFor='lastName' className='block text-white text-base mb-2 font-medium'>
                                        Email
                                    </label>
                                    <input
                                        type='email'
                                        name='email'
                                        value={email}
                                        onChange={(e) => onInputChange(e)}
                                        className='w-full p-2 rounded-md bg-[#222222] text-white border border-white/50 focus:bg-transparent outline-none focus-within:outline-none'
                                        required
                                    />
                                </div>
                                <div className='flex flex-col sm:flex-row justify-between items-center w-full space-y-4'>
                                    <div className='w-full sm:w-[47%]'>
                                        <label htmlFor='firstName' className='block text-white text-base mb-2 font-medium'>
                                            Phone
                                        </label>
                                        <input
                                            type='number'
                                            name='phone'
                                            value={phone}
                                            onChange={(e) => onInputChange(e)}
                                            className='w-full p-2 rounded-md bg-[#222222] text-white border border-white/50 focus:bg-transparent outline-none focus-within:outline-none'
                                            required
                                        />
                                    </div>
                                    <div className='w-full sm:w-[47%]'>
                                        <label htmlFor='lastName' className='block text-white text-base mb-2 font-medium'>
                                            Subject
                                        </label>
                                        <input
                                            type='text'
                                            name='subject'
                                            value={subject}
                                            onChange={(e) => onInputChange(e)}
                                            className='w-full p-2 rounded-md bg-[#222222] text-white border border-white/50 focus:bg-transparent outline-none focus-within:outline-none'
                                            required
                                        />
                                    </div>
                                </div>
                                <div className='w-full'>
                                    <label htmlFor='lastName' className='block text-white text-base mb-2 font-medium'>
                                        Message
                                    </label>
                                    <textarea
                                        className='w-full p-2 rounded-md bg-[#222222] text-white border border-white/50 focus:bg-transparent outline-none focus-within:outline-none'
                                        name="message"
                                        value={message}
                                        onChange={(e) => onInputChange(e)}
                                        placeholder='Message'
                                        required
                                        minLength={5}
                                        rows={5}
                                    />
                                </div>
                                <div className='w-full'>
                                    <label htmlFor='attachment' className='block text-white text-base mb-2 font-medium'>
                                        Attachment (Optional)
                                    </label>
                                    <input
                                        type='file'
                                        name='attachment'
                                        id='attachment'
                                        onChange={handleFileChange}
                                        accept='.pdf,.jpg,.jpeg,.png,.gif,.zip,.mp4,.wav'
                                        className='w-full p-2 rounded-md bg-[#222222] text-white border border-white/50 focus:bg-transparent outline-none focus-within:outline-none file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-yellow-500 file:text-black hover:file:bg-yellow-600'
                                    />
                                    <small className='text-gray-400 mt-1 block'>Allowed: PDF, Images, ZIP, MP4, WAV (Max: 10MB)</small>
                                </div>
                                <button type='submit' className='w-full bg-yellow-500 text-black py-2 rounded-md font-semibold'>
                                    Submit
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default ContactUsDetails