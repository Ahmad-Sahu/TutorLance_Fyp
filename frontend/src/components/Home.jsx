import React from 'react'
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
    return (
        <>
            <div>
                {/* Nav Bar */}
                <div className='bg-blue-950 text-white font-semibold text-2xl p-20 py-15 flex justify-between'>

                    <div className='flex items-center'>
                        <div className='flex items-center'>
                            <h1 className='mr-2'><SiStudyverse /></h1>
                            <h1 className='mr-10'>TutorLance</h1>
                        </div>
                        <div>
                            <Link className='mr-10' to="/find-tutors">Find Tutor</Link>
                            <Link to="/signup">Become a Tutor</Link>
                        </div>
                    </div>

                    <div className='flex items-center justify-between'>
                        <a className='flex items-center mr-8 font-semibold' href="">English <span className='text-4xl ml-2 font-bold'><MdExpandMore /></span></a>
                        <Link to="/login"><button type="button" className='flex bg-blue-600 text-white py-3 px-6 border-4 border-white rounded-full font-semibold hover:bg-blue-500'>
                            <span className='text-2xl mr-4 mt-1'><LuArrowRightToLine /></span>Login</button></Link>
                    </div>
                </div>

                {/* Main Section */}
                <div className='bg-blue-950 text-white pb-36 flex justify-between items-center'>
                    <div className=' font-semibold text-2xl p-20 pt-32 ml-28'>
                        <h1 className='text-4xl font-bold leading-tight'>Your Skill. Your Peace. Your Tutor.</h1>
                        <Link to="/find-tutors" className='flex items-center justify-center mt-32 bg-blue-600 text-white text-4xl py-6 px-6 border-4 border-white rounded-2xl font-semibold w-full hover:bg-blue-500 hover:border-blue-400 duration-300'>
                            Get Started <span className='text-5xl ml-6'><GrFormNextLink /></span></Link>
                    </div>

                    <div className='p-20 pt-32 mr-20'>
                        <img className='border' src="/homeimage.png" alt="" />
                    </div>
                </div>

                {/* 1st slider main content page */}
                <div className='mt-20 px-52'>
                    <div className='flex justify-between text-center'>
                        <div>
                            <h1 className='text-4xl font-bold'>50,000</h1>
                            <h6 className='mt-4'>Experienced Tutors</h6>
                        </div>

                        <div>
                            <h1 className='text-4xl font-bold'>300,000</h1>
                            <h6 className='mt-4'>5-star tutor reviews</h6>
                        </div>

                        <div>
                            <h1 className='text-4xl font-bold'>120+</h1>
                            <h6 className='mt-4'>Subjects Taught</h6>
                        </div>

                        <div>
                            <h1 className='text-4xl font-bold'>4.9 <span >⭐⭐⭐⭐⭐</span></h1>
                            <h6 className='mt-4'>Ratings</h6>
                        </div>
                    </div>

                    <h1 className='mt-32 text-8xl font-semibold text-center whitespace-nowrap'>Find Right Tutor For You</h1>

                    <div className="flex items-center justify-between mt-28 mb-32">
                        <div>
                            {/* Left Image */}
                            <img
                                src="/homeframetutor.png"
                                alt="Find Right Tutor"
                                className="w-96 h-80 ml-20 rounded-xl "
                            />
                        </div>

                        {/* Right Text */}
                        <div className="w-96 h-80 mr-20 flex flex-col justify-center text-2xl leading-relaxed">
                            <p>“The Energy She Brings To Each" <br />  Lesson Is Amazing”.</p>

                            <h5 className=" font-bold">Sumaira Azam</h5>
                            <p className='mt-4'>C++ Programming Learner</p>
                        </div>

                        {/* Icon fixed at mid-right */}
                        <div className="flex justify-end items-center">
                            <a className='font-semibold text-4xl flex items-center' href="Next Tutor">
                                <MdOutlineNavigateNext />
                            </a>
                        </div>

                    </div>


                </div>
                <hr className="border-t-2 border-gray-400 my-4" />

                {/* Working Guide 2nd Home slideing page */}
                <div className='px-36 mt-20 mb-20'>
                    <h1 className='text-6xl font-semibold'>How TutorLance Works:</h1>

                    <div className='relative mt-20 flex items-center justify-between'>
                        <div className='w-1/3 mr-2 h-lvh border-4 border-black'>
                            <h1 className='text-6xl font-bold h-20 w-20 bg-blue-950 text-white flex items-center justify-center mt-6 ml-3'>1</h1>
                            <h1 className='font-bold text-4xl ml-4 mt-10'>Find Your Tutor</h1>
                            <p className='ml-4 mt-2 text-xl'>Browse a wide variety of tutors offering expertise in academics,
                                software skills, filter tutor by subjects, location, bid on hourly charges and more.</p>
                            {/* card 1 */}
                            <div className='flex ml-4 mt-3 w-10/12 h-36 py-1 border-4 border-black rounded-xl'>
                                <img className='ml-6 mt-2 w-18 h-28' src="/frame11.png" alt="" />
                                <div className='relative'>
                                    <h5 className='font-semibold ml-40'>⭐4.6</h5>
                                    <h5 className='ml-4 font-bold'>Muhammad Naeem</h5>
                                    <h6 className='flex ml-6  '><FaGraduationCap /> <span className='ml-1 text-sm'>Mathematics Tutor</span></h6>
                                    <h6 className='flex ml-6 '><LiaLanguageSolid /> <span className='ml-1 text-sm'>Urdu (Native)</span></h6>
                                    <h6 className='ml-11 text-sm'>English (Moderate)</h6>
                                </div>
                            </div>
                            {/* card 2 */}
                            <div className='flex -mt-4 ml-8 w-10/12 h-36 py-1 border-4 border-black rounded-xl bg-white'>
                                <img className='ml-6 mb-4 mt-2 w-18 h-28' src="/frame12.png" alt="" />
                                <div className='mt-4'>
                                    <h5 className='ml-4 font-bold'>Muhammad Azam</h5>
                                    <h6 className='flex ml-6  '><FaGraduationCap /> <span className='ml-1 text-sm'>Python Language Tutor</span></h6>
                                    <h6 className='flex ml-6 '><LiaLanguageSolid /> <span className='ml-1 text-sm'>Urdu (Native)</span></h6>
                                    <h6 className='ml-11 text-sm'>English (Moderate)</h6>
                                </div>
                            </div>
                            {/* card 3 */}
                            <div className='flex -mt-4 ml-12 w-10/12 h-36 py-1 border-4 border-black rounded-xl bg-white'>
                                <img className='ml-6 mb-4 mt-2 w-18 h-28' src="/frame13.png" alt="" />
                                <div className='mt-4'>
                                    <h5 className='ml-4 font-bold'>Azhar Muneer</h5>
                                    <h6 className='flex ml-6  '><FaGraduationCap /> <span className='ml-1 text-sm'>English Tutor</span></h6>
                                    <h6 className='flex ml-6 '><LiaLanguageSolid /> <span className='ml-1 text-sm'>Urdu (Native)</span></h6>
                                    <h6 className='ml-11 text-sm'>English (Moderate)</h6>
                                </div>
                            </div>
                        </div>

                        <div className='w-1/3 mr-2 h-lvh border-4 border-black'>
                            <h1 className='text-6xl font-bold h-20 w-20 bg-blue-950 text-white flex items-center justify-center mt-6 ml-3'>2</h1>
                            <h1 className='font-bold text-4xl ml-4 mt-10'>Book A Lesson</h1>
                            <p className='ml-4 mt-2 text-xl'>Pick the time and type of learning:
                                live call, video call, recorded lessons,
                                or project help.</p>
                            <img className='mt-20 px-2 rounded-xl' src="/frame2.png" alt="" />
                        </div>

                        <div className='w-1/3 mr-2 h-lvh border-4 border-black'>
                            <h1 className='text-6xl font-bold h-20 w-20 bg-blue-950 text-white flex items-center justify-center mt-6 ml-3'>3</h1>
                            <h1 className='font-bold text-4xl ml-4 mt-10'>Learn, Practice & Repeat</h1>
                            <p className='ml-4 mt-2 text-xl'>Connect via video, get learning materials, and start improving</p>
                            <img className='mt-20 px-2 rounded-xl' src="/frame3.png" alt="" />
                        </div>
                    </div>


                </div>

                {/* Working Guide 3rd Home sliding page */}
                <div>
                    <div className='w-full h-60 bg-blue-950 flex flex-col justify-center items-center'>
                        <h1 className='text-5xl font-bold text-white '>Lessons You will Love guranteed</h1>
                        <p className='text-white font-light text-3xl mt-4'>Try another tutor for free if you are not satisfied</p>
                    </div>

                    <div className='mx-40 h-[85vh] mt-8 border-4 border-black flex'>
                        <div className='ml-10 mt-8'>
                            <img className='h-[76vh] rounded-2xl' src="/page3.png" alt="" />
                        </div>
                        <div>
                            <h1 className='font-bold text-5xl ml-24 mt-20'>Become a Tutor</h1>
                            <p className='text-light ml-24 mt-10'>Earn money sharing your expert knowledge with students. Sign up to start tutoring online with TutorLance.</p>
                            <ul className='font-semibold list-disc text-3xl mt-8 ml-32'>
                                <li> Find new students</li>
                                <li> Grow your business</li>
                                <li> Get paid securely</li>
                            </ul>
                            <button className='flex items-center justify-center ml-28 mt-20 bg-blue-6950 text-white text-4xl py-4 px-6 border-4 bg-blue-950 rounded-2xl font-semibold w-3/4'>
                                Get Started <span className='text-5xl ml-6'><GrFormNextLink /></span></button>
                        </div>

                    </div>
                </div>

                {/* Working Guide 4th Home sliding page */}
                <div className='mx-40 mt-48 w-[85%] flex mb-36'>
                    <div className=' p-4  w-[50%] flex flex-col  items-center'>
                        <h1 className='ml-16 font-bold text-5xl leading-tight'>Corporate Courses training for business</h1>
                        <p className='ml-16 mt-12 text-2xl text-light'>TutorLance corporate training is designed for teams and businesses offering personalized language
                            learning with online tutors. Book a demo to learn more about it.</p>
                        <button className='-ml-36 mt-16 bg-blue-950 text-white text-xl py-4 px-16 font-semibold'>
                            Book a Demo
                        </button>
                    </div>
                    <div className='ml-24 flex items-center justify-center '>
                        <img className='rounded-2xl' src="/page4.png" alt="" />
                    </div>
                </div>
                <hr className="border-t-2 border-gray-400 mb-40 mx-64 " />

                {/* Footer */}
                <div className='bg-blue-950 h-lvh text-white px-40 py-14 flex justify-between'>
                    <div>
                        <h1 className='font-bold text-3xl'>About</h1>
                        <p className='mt-4 underline text-2xl text-light'>
                            Who we are?
                        </p>
                        <p className='underline text-2xl text-light'>
                            How it works?
                        </p>
                        <p className='underline text-2xl text-light'>
                            TutorLance reviews
                        </p>
                        <p className='underline text-2xl text-light'>
                            Work at TutorLance
                        </p>
                        <p className='text-2xl text-light'>
                            Status
                        </p>
                        <p className='text-light text-xl'>
                            We stand with Palestine
                        </p>
                        <p className='text-light text-xl'>
                            Affiliate Program
                        </p>

                        <div>
                            <h1 className='mt-20 font-bold text-3xl'>For Tutors</h1>
                            <p className='mt-4 underline text-2xl text-light'>
                                Become an Online Tutor
                            </p>
                            <p className='underline text-2xl text-light'>
                                Teach CS courses online
                            </p>
                            <p className='underline text-2xl text-light'>
                                Teach Mathematics online
                            </p>
                            <p className='underline text-2xl text-light'>
                                Teach Science Online
                            </p>
                            <p className='underline text-2xl text-light'>
                                See all online tutoring jobs
                            </p>
                        </div>
                    </div>

                    <div>
                        <h1 className='font-bold text-3xl'>For Students</h1>
                        <p className='mt-4 underline text-xl text-light'>
                            TutorLance Blog
                        </p>
                        <p className='underline text-2xl text-light'>
                            Questions and Answers
                        </p>
                        <p className='underline text-2xl text-light'>
                            Student discount
                        </p>
                        <p className='underline text-2xl text-light'>
                            Test your English for free
                        </p>
                        <p className='underline text-2xl text-light'>
                            TutorLance discounts
                        </p>

                        <div>
                            <h1 className='mt-36 font-bold text-3xl'>Learn</h1>
                            <p className='mt-4 underline text-xl text-light'>
                                Learn Programming Online
                            </p>
                            <p className='underline text-2xl text-light'>
                                Learn Mathametics Online
                            </p>
                            <p className='underline text-2xl text-light'>
                                Learn Software Engineering <br /> courses Online
                            </p>
                            <p className='underline text-2xl text-light'>
                                Learn Mobile Application Online
                            </p>
                            <p className='underline text-2xl text-light'>
                                Learn Python Online
                            </p>
                        </div>
                    </div>

                    <div>
                        <h1 className='font-bold text-2xl'>Support</h1>
                        <p className='mt-4 underline text-2xl text-light'>
                            Need any Help?
                        </p>

                        <h1 className='mt-10 text-3xl font-bold'>
                            Contacts
                        </h1>
                        <p className='mt-4 text-2xl text-light'>
                            Gmail: abc@gmail.com
                        </p>
                        <p className='mt-4 underline text-2xl text-light flex'>
                            <FaPhoneAlt /> <span className='ml-4'>+92-300-7674574</span>
                        </p>
                        <p className='mt-4 underline text-2xl text-light flex'>
                            <FaWhatsapp /> <span className='ml-4'>+92-300-7674574</span>
                        </p>
                        <div>
                            <h1 className='mt-14 font-bold text-3xl'>Tutors near you</h1>
                            <p className='mt-4 underline text-xl text-light'>
                                Tutors in Multan
                            </p>
                            <p className='underline text-2xl text-light'>
                                Tutors in Islamabad
                            </p>
                            <p className='underline text-2xl text-light'>
                                Tutors in Lahore
                            </p>
                            <p className='underline text-2xl text-light'>
                                Tutors in Faislabad
                            </p>
                            <p className='underline text-2xl text-light'>
                                Tutors in Peshawar
                            </p>
                        </div>
                    </div>

                </div>
                {/* Lower Footer */}
                <div className='flex items-center justify-center bg-blue-950 text-white -mt-20 py-20'>
                        <h1 className='underline text-xl'>Legal Center</h1>
                        <h1 className='ml-12 underline text-xl'>Privacy Policy</h1>
                        <h1 className='ml-12 underline text-xl'>Cookies Policy</h1>
                    </div>

            </div>
        </>

    )
}

export default Home