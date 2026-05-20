import React, { useState } from 'react'
import { SiStudyverse } from "react-icons/si";
import { LuArrowRightToLine } from "react-icons/lu";
import { MdExpandMore } from "react-icons/md";
import { MdOutlineNavigateNext } from "react-icons/md";
import { GrFormNextLink } from "react-icons/gr";
// Images are served from public/ — reference them by absolute paths in src attributes
import { FaGraduationCap } from "react-icons/fa";
import { LiaLanguageSolid } from "react-icons/lia";
import { FaPhoneAlt } from "react-icons/fa";
import { FaWhatsapp } from "react-icons/fa";
import { Link } from 'react-router-dom';

function Home() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const token = localStorage.getItem('token');
    let loggedInName = null;
    let dashboardPath = '/login';

    if (token) {
        try {
            const studentData = localStorage.getItem('student');
            const tutorData = localStorage.getItem('tutor');
            if (studentData) {
                const s = JSON.parse(studentData);
                loggedInName = s.firstName || 'Dashboard';
                dashboardPath = '/studentdashboard';
            } else if (tutorData) {
                const t = JSON.parse(tutorData);
                loggedInName = t.firstName || 'Dashboard';
                dashboardPath = '/tutordashboard';
            } else if (localStorage.getItem('tutorId')) {
                loggedInName = 'Dashboard';
                dashboardPath = '/tutordashboard';
            }
        } catch (e) {}
    }

    return (
        <>
            <div>
                {/* Nav Bar */}
                <div className='bg-blue-950 text-white font-semibold text-xl px-4 md:px-20 py-4 md:py-6'>
                    <div className='flex justify-between items-center'>
                        <div className='flex items-center'>
                            <h1 className='mr-2 text-2xl'><SiStudyverse /></h1>
                            <h1 className='mr-4 md:mr-10 text-xl md:text-2xl'>TutorLance</h1>
                            <div className='hidden md:flex'>
                                <Link className='mr-10' to="/find-tutors">Find Tutor</Link>
                                <Link to="/signup">Become a Tutor</Link>
                            </div>
                        </div>

                        <div className='flex items-center gap-4'>
                            <a className='hidden md:flex items-center font-semibold' href="">English <span className='text-3xl ml-1 font-bold'><MdExpandMore /></span></a>
                            <Link to={dashboardPath} className='hidden md:block'>
                                <button type="button" className='flex items-center bg-blue-600 text-white py-2 px-4 border-2 border-white rounded-full font-semibold hover:bg-blue-500 transition-colors text-sm'>
                                    {loggedInName ? (
                                        <span>{loggedInName}'s Dashboard</span>
                                    ) : (
                                        <>
                                            <span className='text-xl mr-2 mt-0.5'><LuArrowRightToLine /></span>Login/Signup
                                        </>
                                    )}
                                </button>
                            </Link>
                            {/* Hamburger */}
                            <button
                                className='md:hidden text-white text-3xl focus:outline-none'
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                aria-label="Toggle menu"
                            >
                                {mobileMenuOpen ? '✕' : '☰'}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <div className='md:hidden mt-4 flex flex-col gap-3 pb-4 border-t border-blue-800 pt-4'>
                            <Link to="/find-tutors" onClick={() => setMobileMenuOpen(false)}>Find Tutor</Link>
                            <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>Become a Tutor</Link>
                            <Link to={dashboardPath} onClick={() => setMobileMenuOpen(false)}>
                                <button type="button" className='flex items-center bg-blue-600 text-white py-2 px-4 border-2 border-white rounded-full font-semibold text-sm'>
                                    {loggedInName ? (
                                        <span>{loggedInName}'s Dashboard</span>
                                    ) : (
                                        <><span className='text-xl mr-2'><LuArrowRightToLine /></span>Login/Signup</>
                                    )}
                                </button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Main Section */}
                <div className='bg-blue-950 text-white pb-16 md:pb-36 flex flex-col md:flex-row justify-between items-center'>
                    <div className='font-semibold px-6 pt-10 md:p-20 md:pt-32 md:ml-28 text-center md:text-left'>
                        <h1 className='text-2xl md:text-4xl font-bold leading-tight'>Your Skill. Your Peace. Your Tutor.</h1>
                        <Link to="/find-tutors" className='flex items-center justify-center mt-10 md:mt-32 bg-blue-600 text-white text-xl md:text-4xl py-4 md:py-6 px-4 md:px-6 border-2 md:border-4 border-white rounded-2xl font-semibold w-full hover:bg-blue-500 hover:border-blue-400 duration-300'>
                            Get Started <span className='text-2xl md:text-5xl ml-4 md:ml-6'><GrFormNextLink /></span></Link>
                    </div>

                    <div className='px-6 pt-8 md:p-20 md:pt-32 md:mr-20'>
                        <img className='border w-full max-w-sm mx-auto md:max-w-none' src="/homeimage.png" alt="" />
                    </div>
                </div>

                {/* 1st slider main content page */}
                <div className='mt-10 md:mt-20 px-4 md:px-52'>
                    <div className='grid grid-cols-2 md:flex md:justify-between text-center gap-4'>
                        <div>
                            <h1 className='text-2xl md:text-4xl font-bold'>50,000</h1>
                            <h6 className='mt-2 md:mt-4 text-sm md:text-base'>Experienced Tutors</h6>
                        </div>

                        <div>
                            <h1 className='text-2xl md:text-4xl font-bold'>300,000</h1>
                            <h6 className='mt-2 md:mt-4 text-sm md:text-base'>5-star tutor reviews</h6>
                        </div>

                        <div>
                            <h1 className='text-2xl md:text-4xl font-bold'>120+</h1>
                            <h6 className='mt-2 md:mt-4 text-sm md:text-base'>Subjects Taught</h6>
                        </div>

                        <div>
                            <h1 className='text-2xl md:text-4xl font-bold'>4.9 <span>⭐⭐⭐⭐⭐</span></h1>
                            <h6 className='mt-2 md:mt-4 text-sm md:text-base'>Ratings</h6>
                        </div>
                    </div>

                    <h1 className='mt-16 md:mt-32 text-3xl sm:text-5xl md:text-7xl font-semibold text-center'>Find Right Tutor For You</h1>

                    <div className="flex flex-col md:flex-row items-center justify-between mt-16 md:mt-28 mb-16 md:mb-32 gap-8">
                        <div className='w-full md:w-auto'>
                            {/* Left Image */}
                            <img
                                src="/homeframetutor.png"
                                alt="Find Right Tutor"
                                className="w-full max-w-xs mx-auto md:w-96 md:h-80 md:ml-20 rounded-xl"
                            />
                        </div>

                        {/* Right Text */}
                        <div className="px-4 md:w-96 md:h-80 md:mr-20 flex flex-col justify-center text-lg md:text-2xl leading-relaxed text-center md:text-left">
                            <p>"The Energy She Brings To Each" <br />  Lesson Is Amazing".</p>
                            <h5 className="font-bold mt-2">Sumaira Azam</h5>
                            <p className='mt-2 md:mt-4'>C++ Programming Learner</p>
                        </div>

                        {/* Icon */}
                        <div className="flex justify-center md:justify-end items-center">
                            <a className='font-semibold text-3xl md:text-4xl flex items-center' href="">
                                <MdOutlineNavigateNext />
                            </a>
                        </div>

                    </div>


                </div>
                <hr className="border-t-2 border-gray-400 my-4" />

                {/* Working Guide 2nd Home sliding page */}
                <div className='px-4 md:px-36 mt-10 md:mt-20 mb-10 md:mb-20'>
                    <h1 className='text-3xl md:text-6xl font-semibold'>How TutorLance Works:</h1>

                    <div className='mt-10 md:mt-20 flex flex-col md:flex-row items-stretch gap-4 md:gap-0 md:justify-between'>
                        <div className='w-full md:w-1/3 md:mr-2 border-4 border-black'>
                            <h1 className='text-4xl md:text-6xl font-bold h-16 md:h-20 w-16 md:w-20 bg-blue-950 text-white flex items-center justify-center mt-4 md:mt-6 ml-3'>1</h1>
                            <h1 className='font-bold text-2xl md:text-4xl ml-4 mt-6 md:mt-10'>Find Your Tutor</h1>
                            <p className='ml-4 mt-2 text-base md:text-xl'>Browse a wide variety of tutors offering expertise in academics,
                                software skills, filter tutor by subjects, location, bid on hourly charges and more.</p>
                            {/* card 1 */}
                            <div className='flex ml-4 mt-3 w-10/12 h-36 py-1 border-4 border-black rounded-xl'>
                                <img className='ml-2 mt-2 w-16 h-28 object-cover' src="/frame11.png" alt="" />
                                <div className='relative'>
                                    <h5 className='font-semibold ml-20 md:ml-40 text-sm'>⭐4.6</h5>
                                    <h5 className='ml-4 font-bold text-sm'>Muhammad Naeem</h5>
                                    <h6 className='flex ml-4 text-xs'><FaGraduationCap /> <span className='ml-1'>Mathematics Tutor</span></h6>
                                    <h6 className='flex ml-4 text-xs'><LiaLanguageSolid /> <span className='ml-1'>Urdu (Native)</span></h6>
                                    <h6 className='ml-8 text-xs'>English (Moderate)</h6>
                                </div>
                            </div>
                            {/* card 2 */}
                            <div className='flex -mt-4 ml-6 w-10/12 h-36 py-1 border-4 border-black rounded-xl bg-white'>
                                <img className='ml-2 mb-4 mt-2 w-16 h-28 object-cover' src="/frame12.png" alt="" />
                                <div className='mt-4'>
                                    <h5 className='ml-4 font-bold text-sm'>Muhammad Azam</h5>
                                    <h6 className='flex ml-4 text-xs'><FaGraduationCap /> <span className='ml-1'>Python Language Tutor</span></h6>
                                    <h6 className='flex ml-4 text-xs'><LiaLanguageSolid /> <span className='ml-1'>Urdu (Native)</span></h6>
                                    <h6 className='ml-8 text-xs'>English (Moderate)</h6>
                                </div>
                            </div>
                            {/* card 3 */}
                            <div className='flex -mt-4 ml-8 w-10/12 h-36 py-1 border-4 border-black rounded-xl bg-white'>
                                <img className='ml-2 mb-4 mt-2 w-16 h-28 object-cover' src="/frame13.png" alt="" />
                                <div className='mt-4'>
                                    <h5 className='ml-4 font-bold text-sm'>Azhar Muneer</h5>
                                    <h6 className='flex ml-4 text-xs'><FaGraduationCap /> <span className='ml-1'>English Tutor</span></h6>
                                    <h6 className='flex ml-4 text-xs'><LiaLanguageSolid /> <span className='ml-1'>Urdu (Native)</span></h6>
                                    <h6 className='ml-8 text-xs'>English (Moderate)</h6>
                                </div>
                            </div>
                        </div>

                        <div className='w-full md:w-1/3 md:mr-2 border-4 border-black'>
                            <h1 className='text-4xl md:text-6xl font-bold h-16 md:h-20 w-16 md:w-20 bg-blue-950 text-white flex items-center justify-center mt-4 md:mt-6 ml-3'>2</h1>
                            <h1 className='font-bold text-2xl md:text-4xl ml-4 mt-6 md:mt-10'>Book A Lesson</h1>
                            <p className='ml-4 mt-2 text-base md:text-xl'>Pick the time and type of learning:
                                live call, video call, recorded lessons,
                                or project help.</p>
                            <img className='mt-10 md:mt-20 px-2 rounded-xl w-full' src="/frame2.png" alt="" />
                        </div>

                        <div className='w-full md:w-1/3 md:mr-2 border-4 border-black'>
                            <h1 className='text-4xl md:text-6xl font-bold h-16 md:h-20 w-16 md:w-20 bg-blue-950 text-white flex items-center justify-center mt-4 md:mt-6 ml-3'>3</h1>
                            <h1 className='font-bold text-2xl md:text-4xl ml-4 mt-6 md:mt-10'>Learn, Practice & Repeat</h1>
                            <p className='ml-4 mt-2 text-base md:text-xl'>Connect via video, get learning materials, and start improving</p>
                            <img className='mt-10 md:mt-20 px-2 rounded-xl w-full' src="/frame3.png" alt="" />
                        </div>
                    </div>


                </div>

                {/* Working Guide 3rd Home sliding page */}
                <div>
                    <div className='w-full bg-blue-950 flex flex-col justify-center items-center py-12 md:h-60 px-4 text-center'>
                        <h1 className='text-2xl md:text-5xl font-bold text-white'>Lessons You will Love guranteed</h1>
                        <p className='text-white font-light text-xl md:text-3xl mt-4'>Try another tutor for free if you are not satisfied</p>
                    </div>

                    <div className='mx-4 md:mx-40 mt-8 border-4 border-black flex flex-col md:flex-row'>
                        <div className='flex justify-center md:block md:ml-10 mt-4 md:mt-8'>
                            <img className='h-64 md:h-[76vh] rounded-2xl w-full object-cover md:w-auto' src="/page3.png" alt="" />
                        </div>
                        <div className='p-6 md:p-0'>
                            <h1 className='font-bold text-2xl md:text-5xl md:ml-24 mt-6 md:mt-20'>Become a Tutor</h1>
                            <p className='text-light md:ml-24 mt-4 md:mt-10 text-base md:text-base'>Earn money sharing your expert knowledge with students. Sign up to start tutoring online with TutorLance.</p>
                            <ul className='font-semibold list-disc text-xl md:text-3xl mt-4 md:mt-8 ml-8 md:ml-32'>
                                <li> Find new students</li>
                                <li> Grow your business</li>
                                <li> Get paid securely</li>
                            </ul>
                            <button className='flex items-center justify-center mt-8 md:ml-28 md:mt-20 bg-blue-950 text-white text-2xl md:text-4xl py-4 px-6 border-4 rounded-2xl font-semibold w-full md:w-3/4'>
                                Get Started <span className='text-3xl md:text-5xl ml-4 md:ml-6'><GrFormNextLink /></span></button>
                        </div>

                    </div>
                </div>

                {/* Working Guide 4th Home sliding page */}
                <div className='mx-4 md:mx-40 mt-16 md:mt-48 w-auto md:w-[85%] flex flex-col md:flex-row mb-16 md:mb-36'>
                    <div className='p-4 w-full md:w-[50%] flex flex-col items-start md:items-center'>
                        <h1 className='font-bold text-2xl md:text-5xl leading-tight'>Corporate Courses training for business</h1>
                        <p className='mt-6 md:ml-16 md:mt-12 text-lg md:text-2xl text-light'>TutorLance corporate training is designed for teams and businesses offering personalized language
                            learning with online tutors. Book a demo to learn more about it.</p>
                        <button className='mt-8 md:-ml-36 md:mt-16 bg-blue-950 text-white text-lg md:text-xl py-4 px-8 md:px-16 font-semibold'>
                            Book a Demo
                        </button>
                    </div>
                    <div className='mt-6 md:mt-0 md:ml-24 flex items-center justify-center'>
                        <img className='rounded-2xl w-full md:w-auto' src="/page4.png" alt="" />
                    </div>
                </div>
                <hr className="border-t-2 border-gray-400 mb-16 md:mb-40 mx-4 md:mx-64 " />

                {/* Footer */}
                <div className='bg-blue-950 text-white px-6 md:px-40 py-14 grid grid-cols-1 md:grid-cols-3 gap-10'>
                    <div>
                        <h1 className='font-bold text-3xl'>About</h1>
                        <p className='mt-4 underline text-xl text-light'>Who we are?</p>
                        <p className='underline text-xl text-light'>How it works?</p>
                        <p className='underline text-xl text-light'>TutorLance reviews</p>
                        <p className='underline text-xl text-light'>Work at TutorLance</p>
                        <p className='text-xl text-light'>Status</p>
                        <p className='text-light text-lg'>We stand with Palestine</p>
                        <p className='text-light text-lg'>Affiliate Program</p>

                        <div>
                            <h1 className='mt-10 font-bold text-3xl'>For Tutors</h1>
                            <p className='mt-4 underline text-xl text-light'>Become an Online Tutor</p>
                            <p className='underline text-xl text-light'>Teach CS courses online</p>
                            <p className='underline text-xl text-light'>Teach Mathematics online</p>
                            <p className='underline text-xl text-light'>Teach Science Online</p>
                            <p className='underline text-xl text-light'>See all online tutoring jobs</p>
                        </div>
                    </div>

                    <div>
                        <h1 className='font-bold text-3xl'>For Students</h1>
                        <p className='mt-4 underline text-xl text-light'>TutorLance Blog</p>
                        <p className='underline text-xl text-light'>Questions and Answers</p>
                        <p className='underline text-xl text-light'>Student discount</p>
                        <p className='underline text-xl text-light'>Test your English for free</p>
                        <p className='underline text-xl text-light'>TutorLance discounts</p>

                        <div>
                            <h1 className='mt-10 font-bold text-3xl'>Learn</h1>
                            <p className='mt-4 underline text-xl text-light'>Learn Programming Online</p>
                            <p className='underline text-xl text-light'>Learn Mathametics Online</p>
                            <p className='underline text-xl text-light'>Learn Software Engineering courses Online</p>
                            <p className='underline text-xl text-light'>Learn Mobile Application Online</p>
                            <p className='underline text-xl text-light'>Learn Python Online</p>
                        </div>
                    </div>

                    <div>
                        <h1 className='font-bold text-2xl'>Support</h1>
                        <p className='mt-4 underline text-xl text-light'>Need any Help?</p>

                        <h1 className='mt-10 text-3xl font-bold'>Contacts</h1>
                        <p className='mt-4 text-xl text-light'>Gmail: abc@gmail.com</p>
                        <p className='mt-4 underline text-xl text-light flex'>
                            <FaPhoneAlt /> <span className='ml-4'>+92-300-7674574</span>
                        </p>
                        <p className='mt-4 underline text-xl text-light flex'>
                            <FaWhatsapp /> <span className='ml-4'>+92-300-7674574</span>
                        </p>
                        <div>
                            <h1 className='mt-10 font-bold text-3xl'>Tutors near you</h1>
                            <p className='mt-4 underline text-xl text-light'>Tutors in Multan</p>
                            <p className='underline text-xl text-light'>Tutors in Islamabad</p>
                            <p className='underline text-xl text-light'>Tutors in Lahore</p>
                            <p className='underline text-xl text-light'>Tutors in Faislabad</p>
                            <p className='underline text-xl text-light'>Tutors in Peshawar</p>
                        </div>
                    </div>

                </div>
                {/* Lower Footer */}
                <div className='flex flex-wrap items-center justify-center bg-blue-950 text-white py-8 gap-4 md:gap-0'>
                    <h1 className='underline text-lg'>Legal Center</h1>
                    <h1 className='md:ml-12 underline text-lg'>Privacy Policy</h1>
                    <h1 className='md:ml-12 underline text-lg'>Cookies Policy</h1>
                </div>

            </div>
        </>

    )
}

export default Home
