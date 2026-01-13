import React from 'react'
import { NavLink } from 'react-router-dom'
const Home = () => {
  return (
    <div>
      <section class="text-gray-600 body-font">
  <div class="container px-5 py-24 mx-auto">
    <div class="flex flex-col text-center w-full mb-20">
      <h2 class="text-xs text-indigo-500 tracking-widest font-medium title-font mb-1">Primary Healthcare Management System</h2>
      <h1 class="sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-900">Smart. Secure. Patient-centric care delivery.</h1>
      <p class="lg:w-2/3 mx-auto leading-relaxed text-base">A modern primary healthcare management system that simplifies patient registration, appointment scheduling, and medical record management. Built to support clinics and healthcare professionals, the platform improves operational efficiency while ensuring secure and seamless access to patient information.</p>
    </div>
    <div class="flex flex-wrap">
      <div class="xl:w-1/4 lg:w-1/2 md:w-full px-8 py-6 border-l-2 border-gray-200 border-opacity-60">
        <h2 class="text-lg sm:text-xl text-gray-900 font-medium title-font mb-2">Centralized Patient Records</h2>
        <p class="leading-relaxed text-base mb-4">Securely store and manage patient demographics, medical histories, prescriptions, and visit records in one unified system. Access accurate patient information instantly to support informed clinical decisions and continuity of care.</p>
        <a class="text-indigo-500 inline-flex items-center">Learn More
          <svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="w-4 h-4 ml-2" viewBox="0 0 24 24">
            <path d="M5 12h14M12 5l7 7-7 7"></path>
          </svg>
        </a>
      </div>
      <div class="xl:w-1/4 lg:w-1/2 md:w-full px-8 py-6 border-l-2 border-gray-200 border-opacity-60">
        <h2 class="text-lg sm:text-xl text-gray-900 font-medium title-font mb-2">Smart Appointment Scheduling</h2>
        <p class="leading-relaxed text-base mb-4">Simplify appointment booking and reduce wait times with an intuitive scheduling system. Manage doctor availability, patient bookings, and follow-ups efficiently to improve clinic workflow and patient satisfaction.</p>
        <a class="text-indigo-500 inline-flex items-center">Learn More
          <svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="w-4 h-4 ml-2" viewBox="0 0 24 24">
            <path d="M5 12h14M12 5l7 7-7 7"></path>
          </svg>
        </a>
      </div>
      <div class="xl:w-1/4 lg:w-1/2 md:w-full px-8 py-6 border-l-2 border-gray-200 border-opacity-60">
        <h2 class="text-lg sm:text-xl text-gray-900 font-medium title-font mb-2">Doctor & Staff Management</h2>
        <p class="leading-relaxed text-base mb-4">Manage healthcare professionals, roles, and responsibilities with ease. Assign schedules, track consultations, and ensure smooth coordination between doctors, nurses, and administrative staff.</p>
        <a class="text-indigo-500 inline-flex items-center">Learn More
          <svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="w-4 h-4 ml-2" viewBox="0 0 24 24">
            <path d="M5 12h14M12 5l7 7-7 7"></path>
          </svg>
        </a>
      </div>
      <div class="xl:w-1/4 lg:w-1/2 md:w-full px-8 py-6 border-l-2 border-gray-200 border-opacity-60">
        <h2 class="text-lg sm:text-xl text-gray-900 font-medium title-font mb-2">Secure & Compliant Platform</h2>
        <p class="leading-relaxed text-base mb-4">Built with data security and privacy in mind, the system ensures safe handling of sensitive healthcare information while supporting compliance with healthcare data protection standards</p>
        <a class="text-indigo-500 inline-flex items-center">Learn More
          <svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="w-4 h-4 ml-2" viewBox="0 0 24 24">
            <path d="M5 12h14M12 5l7 7-7 7"></path>
          </svg>
        </a>
      </div>
    </div>
    <button class="flex mx-auto mt-16 text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg"><NavLink
                  to="/login"
                  
                >
                  try Now
                </NavLink></button>
  </div>
</section>

    </div>
  )
}

export default Home
